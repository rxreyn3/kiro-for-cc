import { ConfigReader } from '../../../../src/features/permission/configReader';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    watchFile: jest.fn(),
    unwatchFile: jest.fn(),
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        mkdir: jest.fn()
    }
}));

// Mock os module
jest.mock('os');

describe('ConfigReader', () => {
    let configReader: ConfigReader;
    let mockOutputChannel: vscode.OutputChannel;
    const mockHomePath = '/Users/test';
    const mockConfigPath = path.join(mockHomePath, '.claude.json');

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock os.homedir
        (os.homedir as jest.Mock).mockReturnValue(mockHomePath);

        // Mock output channel
        mockOutputChannel = {
            appendLine: jest.fn()
        } as any;

        // Create instance
        configReader = new ConfigReader(mockOutputChannel);
    });

    afterEach(() => {
        // Clean up any file watchers
        if (configReader) {
            configReader.dispose();
        }
    });

    describe('Read config file', () => {
        it('CR-01: Read existing config file and return permission status', async () => {
            const mockConfig = {
                bypassPermissionsModeAccepted: true,
                otherField: 'value'
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

            const result = await configReader.getBypassPermissionStatus();

            expect(result).toBe(true);
            expect(fs.existsSync).toHaveBeenCalledWith(mockConfigPath);
            expect(fs.promises.readFile).toHaveBeenCalledWith(mockConfigPath, 'utf8');
            expect(mockOutputChannel.appendLine).not.toHaveBeenCalledWith(
                expect.stringContaining('Error')
            );
        });

        it('CR-02: Return false when config file does not exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await configReader.getBypassPermissionStatus();

            expect(result).toBe(false);
            expect(fs.promises.readFile).not.toHaveBeenCalled();
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                `[ConfigReader] Config file not found: ${mockConfigPath}`
            );
        });

        it('CR-03: Return false when config file JSON format is invalid', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockResolvedValue('{ invalid json }');

            const result = await configReader.getBypassPermissionStatus();

            expect(result).toBe(false);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringContaining('[ConfigReader] Error reading config:')
            );
        });

        it('CR-04: bypassPermissionsModeAccepted field missing', async () => {
            const mockConfig = {
                otherField: 'value'
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

            const result = await configReader.getBypassPermissionStatus();

            expect(result).toBe(false);
        });

        it('CR-04-2: Return false when bypassPermissionsModeAccepted is false', async () => {
            const mockConfig = {
                bypassPermissionsModeAccepted: false
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

            const result = await configReader.getBypassPermissionStatus();

            expect(result).toBe(false);
        });
    });

    describe('Write config file', () => {
        it('CR-05: Set permission status to new file', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await configReader.setBypassPermission(true);

            expect(fs.promises.mkdir).toHaveBeenCalledWith(
                path.dirname(mockConfigPath),
                { recursive: true }
            );
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                mockConfigPath,
                JSON.stringify({ bypassPermissionsModeAccepted: true }, null, 2),
                'utf8'
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[ConfigReader] Set bypassPermissionsModeAccepted to true'
            );
        });

        it('CR-06: Update existing config file preserving other fields', async () => {
            const existingConfig = {
                bypassPermissionsModeAccepted: false,
                apiKey: 'secret',
                theme: 'dark'
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingConfig));
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await configReader.setBypassPermission(true);

            const expectedConfig = {
                ...existingConfig,
                bypassPermissionsModeAccepted: true
            };

            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                mockConfigPath,
                JSON.stringify(expectedConfig, null, 2),
                'utf8'
            );
        });

        it('CR-07: Config file parse failure retry mechanism', async () => {
            const invalidJson = '{ invalid json }';
            let parseCallCount = 0;
            const originalParse = JSON.parse;

            // Mock JSON.parse to fail 3 times
            JSON.parse = jest.fn().mockImplementation((text) => {
                if (text === invalidJson) {
                    parseCallCount++;
                    throw new Error('Invalid JSON');
                }
                return originalParse(text);
            });

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockResolvedValue(invalidJson);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await configReader.setBypassPermission(true);

            expect(parseCallCount).toBe(3); // Initial + 2 retries
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[ConfigReader] Failed to parse existing config, retrying...'
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[ConfigReader] All parse attempts failed, using empty config object'
            );
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                mockConfigPath,
                JSON.stringify({ bypassPermissionsModeAccepted: true }, null, 2),
                'utf8'
            );

            // Restore original JSON.parse
            JSON.parse = originalParse;
        });

        it('CR-08: Create directory if it doesn\'t exist', async () => {
            (fs.existsSync as jest.Mock)
                .mockReturnValueOnce(false)  // File doesn't exist
                .mockReturnValueOnce(false); // Directory doesn't exist

            (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await configReader.setBypassPermission(true);

            expect(fs.promises.mkdir).toHaveBeenCalledWith(
                path.dirname(mockConfigPath),
                { recursive: true }
            );
        });

        it('CR-05-2: Throw error when write fails', async () => {
            const writeError = new Error('Write failed');
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (fs.promises.writeFile as jest.Mock).mockRejectedValue(writeError);

            await expect(configReader.setBypassPermission(true)).rejects.toThrow('Write failed');

            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                `[ConfigReader] Failed to set permission: Error: Write failed`
            );
        });
    });

    describe('File monitoring', () => {
        it('CR-09: File monitoring triggers callback', async () => {
            const mockCallback = jest.fn();
            const mockWatcher = jest.fn();
            
            // Mock fs.watchFile
            (fs.watchFile as jest.Mock).mockImplementation((path, options, callback) => {
                mockWatcher(path, options);
                // Simulate file change
                const prevStats = { mtime: new Date('2024-01-01') };
                const currStats = { mtime: new Date('2024-01-02') };
                setTimeout(() => callback(currStats, prevStats), 10);
            });

            configReader.watchConfigFile(mockCallback);

            expect(mockWatcher).toHaveBeenCalledWith(
                mockConfigPath,
                { interval: 2000 }
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                `[ConfigReader] Started watching config file: ${mockConfigPath}`
            );

            // Wait for callback
            await new Promise(resolve => setTimeout(resolve, 20));
            expect(mockCallback).toHaveBeenCalled();
        });

        it('CR-10: dispose cleans up file monitoring', () => {
            const mockCallback = jest.fn();
            (fs.watchFile as jest.Mock).mockImplementation(() => {});
            (fs.unwatchFile as jest.Mock).mockImplementation(() => {});

            // Start watching
            configReader.watchConfigFile(mockCallback);

            // Dispose
            configReader.dispose();

            expect(fs.unwatchFile).toHaveBeenCalledWith(mockConfigPath);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[ConfigReader] Stopped watching config file'
            );
        });

        it('CR-10-2: dispose does not execute cleanup when monitoring not set', () => {
            (fs.unwatchFile as jest.Mock).mockImplementation(() => {});

            // Dispose without watching
            configReader.dispose();

            expect(fs.unwatchFile).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('CR-01-3: Handle file read exceptions', async () => {
            const readError = new Error('Read failed');
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockRejectedValue(readError);

            const result = await configReader.getBypassPermissionStatus();

            expect(result).toBe(false);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                `[ConfigReader] Error reading config: Error: Read failed`
            );
        });

        it('CR-04-3: Handle non-boolean bypassPermissionsModeAccepted', async () => {
            const mockConfig = {
                bypassPermissionsModeAccepted: 'true' // String instead of boolean
            };

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

            const result = await configReader.getBypassPermissionStatus();

            expect(result).toBe(false); // Strict comparison with true
        });
    });
});