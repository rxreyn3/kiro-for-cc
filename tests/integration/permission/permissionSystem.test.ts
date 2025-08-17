import { ConfigReader } from '../../../src/features/permission/configReader';
import { PermissionCache } from '../../../src/features/permission/permissionCache';
import { PermissionManager } from '../../../src/features/permission/permissionManager';
import { PermissionWebview } from '../../../src/features/permission/permissionWebview';
import { ClaudeCodeProvider } from '../../../src/providers/claudeCodeProvider';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock file system to avoid real file operations
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdtempSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    rmSync: jest.fn(),
    watchFile: jest.fn(),
    unwatchFile: jest.fn(),
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        mkdir: jest.fn()
    }
}));

jest.mock('os');

// Only mock what's necessary for integration tests
jest.mock('../../../src/features/permission/permissionWebview');
jest.mock('../../../src/providers/claudeCodeProvider');

describe('Permission System Integration Tests', () => {
    let mockConfigPath: string;
    let mockContext: vscode.ExtensionContext;
    let mockOutputChannel: vscode.OutputChannel;
    let configReader: ConfigReader;
    let permissionCache: PermissionCache;
    let permissionManager: PermissionManager;
    let mockFileContent: any = {};
    let fileWatchCallbacks: Array<(curr: any, prev: any) => void> = [];

    beforeEach(() => {
        // Setup mock paths
        mockConfigPath = '/mock/home/.claude.json';
        (os.homedir as jest.Mock).mockReturnValue('/mock/home');

        // Reset mock file content
        mockFileContent = {};
        fileWatchCallbacks = [];

        // Setup file system mocks
        (fs.existsSync as jest.Mock).mockImplementation((path) => {
            return mockFileContent[path] !== undefined;
        });

        (fs.readFileSync as jest.Mock).mockImplementation((path) => {
            if (mockFileContent[path]) {
                return mockFileContent[path];
            }
            throw new Error('File not found');
        });

        (fs.writeFileSync as jest.Mock).mockImplementation((path, content) => {
            mockFileContent[path] = content;
        });

        (fs.promises.readFile as jest.Mock).mockImplementation(async (path) => {
            if (mockFileContent[path]) {
                return mockFileContent[path];
            }
            throw new Error('File not found');
        });

        (fs.promises.writeFile as jest.Mock).mockImplementation(async (path, content) => {
            mockFileContent[path] = content;
        });

        (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);

        (fs.watchFile as jest.Mock).mockImplementation((path, options, callback) => {
            if (typeof options === 'function') {
                callback = options;
            }
            fileWatchCallbacks.push(callback);
        });

        (fs.unwatchFile as jest.Mock).mockImplementation(() => {
            fileWatchCallbacks = [];
        });

        // Mock vscode components
        mockContext = {
            subscriptions: []
        } as any;

        mockOutputChannel = {
            appendLine: jest.fn()
        } as any;

        // Mock UI components
        (ClaudeCodeProvider.createPermissionTerminal as jest.Mock).mockReturnValue({
            dispose: jest.fn()
        });

        (PermissionWebview.createOrShow as jest.Mock).mockImplementation(() => {});
        (PermissionWebview.close as jest.Mock).mockImplementation(() => {});

        // Mock vscode APIs
        (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        // Cleanup
        if (permissionManager) {
            permissionManager.dispose();
        }
        if (configReader) {
            configReader.dispose();
        }

        // Reset mocks
        mockFileContent = {};
        fileWatchCallbacks = [];
        jest.clearAllMocks();
    });

    describe('IS-01: Complete Permission Granting Flow', () => {
        it('IS-01: Complete flow from UI acceptance to file writing', async () => {
            // Create real components
            configReader = new ConfigReader(mockOutputChannel);
            permissionCache = new PermissionCache(configReader, mockOutputChannel);
            permissionManager = new PermissionManager(mockContext, mockOutputChannel);

            // Setup event listener
            const eventSpy = jest.fn();
            permissionCache.event(eventSpy);

            // Grant permission
            const result = await permissionManager.grantPermission();

            // Verify file was written
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                mockConfigPath,
                JSON.stringify({ bypassPermissionsModeAccepted: true }, null, 2),
                'utf8'
            );

            // Verify mock file content
            const content = JSON.parse(mockFileContent[mockConfigPath]);
            expect(content.bypassPermissionsModeAccepted).toBe(true);

            // Verify cache was updated
            const cacheValue = await permissionCache.get();
            expect(cacheValue).toBe(true);

            // Verify logs
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[ConfigReader] Set bypassPermissionsModeAccepted to true'
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[PermissionManager] Permission granted via WebView'
            );

            expect(result).toBe(true);
        });
    });

    describe('IS-02: File Changes Trigger Cache Updates', () => {
        it('IS-02: File monitoring detects changes and updates cache', async () => {
            // Create initial config file
            mockFileContent[mockConfigPath] = JSON.stringify({ bypassPermissionsModeAccepted: false });

            // Create components
            configReader = new ConfigReader(mockOutputChannel);
            permissionCache = new PermissionCache(configReader, mockOutputChannel);

            // Setup monitoring
            let watchCallback: ((curr: any, prev: any) => void) | undefined;
            configReader.watchConfigFile(async () => {
                await permissionCache.refresh();
            });

            // Get the watch callback
            expect(fileWatchCallbacks.length).toBeGreaterThan(0);
            watchCallback = fileWatchCallbacks[0];

            // Setup event listener
            const eventPromise = new Promise<boolean>((resolve) => {
                permissionCache.event((hasPermission) => {
                    resolve(hasPermission);
                });
            });

            // Initial state
            const initialValue = await permissionCache.get();
            expect(initialValue).toBe(false);

            // Simulate file change
            mockFileContent[mockConfigPath] = JSON.stringify({ bypassPermissionsModeAccepted: true });
            
            // Trigger watch callback
            if (watchCallback) {
                watchCallback(
                    { mtime: new Date('2024-01-02') },
                    { mtime: new Date('2024-01-01') }
                );
            }

            // Wait for event
            const eventResult = await eventPromise;
            expect(eventResult).toBe(true);

            // Verify cache was updated
            const newValue = await permissionCache.get();
            expect(newValue).toBe(true);
        });
    });

    describe('IS-03: Permission Revocation Triggers UI', () => {
        it('IS-03: Core functionality of permission revocation', async () => {
            // Create initial config with permission
            mockFileContent[mockConfigPath] = JSON.stringify({ bypassPermissionsModeAccepted: true });

            // Create PermissionManager (it creates its own ConfigReader and PermissionCache)
            permissionManager = new PermissionManager(mockContext, mockOutputChannel);

            // Get initial permission through PermissionManager
            const initialValue = await permissionManager.checkPermission();
            expect(initialValue).toBe(true);

            // Reset permission
            await permissionManager.resetPermission();

            // Verify file was updated
            const content = JSON.parse(mockFileContent[mockConfigPath]);
            expect(content.bypassPermissionsModeAccepted).toBe(false);
            
            // Verify cache was updated through PermissionManager
            const newValue = await permissionManager.checkPermission();
            expect(newValue).toBe(false);

            // Verify the operations were logged
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[PermissionManager] Resetting permission to false...'
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[ConfigReader] Set bypassPermissionsModeAccepted to false'
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[PermissionCache] Permission changed: true -> false'
            );
        });
    });

    describe('IS-04: Corrupted Config File Recovery', () => {
        it('IS-04: Handle corrupted config file and recover', async () => {
            // Create corrupted config file
            mockFileContent[mockConfigPath] = '{ invalid json }';

            // Create components
            configReader = new ConfigReader(mockOutputChannel);
            permissionCache = new PermissionCache(configReader, mockOutputChannel);

            // Reading should return false (safe default)
            const readResult = await permissionCache.get();
            expect(readResult).toBe(false);

            // Should be able to write new valid config
            await configReader.setBypassPermission(true);

            // Verify file was fixed
            const content = JSON.parse(mockFileContent[mockConfigPath]);
            expect(content.bypassPermissionsModeAccepted).toBe(true);

            // Cache should now return true
            const newValue = await permissionCache.refreshAndGet();
            expect(newValue).toBe(true);
        });

        it('IS-04-2: Preserve valid fields when repairing partial corruption', async () => {
            // Create partially valid config
            const partialConfig = {
                bypassPermissionsModeAccepted: 'invalid', // Wrong type
                apiKey: 'valid-key',
                theme: 'dark'
            };
            mockFileContent[mockConfigPath] = JSON.stringify(partialConfig);

            // Create components
            configReader = new ConfigReader(mockOutputChannel);

            // Should treat invalid value as false
            const hasPermission = await configReader.getBypassPermissionStatus();
            expect(hasPermission).toBe(false);

            // Update permission
            await configReader.setBypassPermission(true);

            // Verify other fields were preserved
            const content = JSON.parse(mockFileContent[mockConfigPath]);
            expect(content.bypassPermissionsModeAccepted).toBe(true);
            expect(content.apiKey).toBe('valid-key');
            expect(content.theme).toBe('dark');
        });
    });

    describe('IS-05: Multiple Listeners Collaboration', () => {
        it('IS-05: Multiple listeners respond to same permission change', async () => {
            // Create components
            configReader = new ConfigReader(mockOutputChannel);
            permissionCache = new PermissionCache(configReader, mockOutputChannel);

            // Register multiple listeners
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            const listener3 = jest.fn();

            permissionCache.event(listener1);
            permissionCache.event(listener2);
            permissionCache.event(listener3);

            // Initial state false
            await configReader.setBypassPermission(false);
            await permissionCache.refreshAndGet();

            // Change to true
            await configReader.setBypassPermission(true);
            await permissionCache.refreshAndGet();

            // All listeners should be called
            expect(listener1).toHaveBeenCalledWith(true);
            expect(listener2).toHaveBeenCalledWith(true);
            expect(listener3).toHaveBeenCalledWith(true);
        });
    });

    describe('IS-06: Initialization Flow', () => {
        it('IS-06: Complete initialization when file does not exist', async () => {
            // Ensure no config file
            expect(mockFileContent[mockConfigPath]).toBeUndefined();

            // Create components
            configReader = new ConfigReader(mockOutputChannel);
            permissionCache = new PermissionCache(configReader, mockOutputChannel);
            permissionManager = new PermissionManager(mockContext, mockOutputChannel);

            // Mock user accepting permission
            (PermissionWebview.createOrShow as jest.Mock).mockImplementation((ctx, callbacks) => {
                setTimeout(async () => {
                    const success = await callbacks.onAccept();
                    expect(success).toBe(true);
                }, 10);
            });

            // Initialize
            const result = await permissionManager.initializePermissions();

            // Verify file was created
            expect(mockFileContent[mockConfigPath]).toBeDefined();
            const content = JSON.parse(mockFileContent[mockConfigPath]);
            expect(content.bypassPermissionsModeAccepted).toBe(true);

            expect(result).toBe(true);
        });
    });

    describe('IS-07: Concurrent Operations', () => {
        it('IS-07: Data consistency under concurrent read/write operations', async () => {
            // Create components
            configReader = new ConfigReader(mockOutputChannel);
            permissionCache = new PermissionCache(configReader, mockOutputChannel);

            // Perform concurrent operations
            const operations = [
                // Multiple reads
                permissionCache.get(),
                permissionCache.get(),
                permissionCache.get(),
                // Write operation
                configReader.setBypassPermission(true),
                // More reads
                permissionCache.get(),
                permissionCache.refreshAndGet(),
                // Another write
                configReader.setBypassPermission(false),
                // Final reads
                permissionCache.refreshAndGet(),
                permissionCache.get()
            ];

            const results = await Promise.all(operations);

            // Verify final state is consistent
            const finalFileContent = JSON.parse(mockFileContent[mockConfigPath]);
            expect(finalFileContent.bypassPermissionsModeAccepted).toBe(false);

            const finalCacheValue = await permissionCache.get();
            expect(finalCacheValue).toBe(false);
        });
    });

    describe('IS-08: Lifecycle Management', () => {
        it('IS-08: Complete cycle of component creation, usage and destruction', async () => {
            // Create components
            configReader = new ConfigReader(mockOutputChannel);
            permissionCache = new PermissionCache(configReader, mockOutputChannel);
            permissionManager = new PermissionManager(mockContext, mockOutputChannel);

            // Mock to prevent timeout
            (PermissionWebview.createOrShow as jest.Mock).mockImplementation((ctx, callbacks) => {
                setTimeout(() => callbacks.onAccept(), 10);
            });

            // Use components
            await permissionManager.initializePermissions();
            await permissionManager.checkPermission();

            // Setup monitoring
            let watchCallbackCalled = false;
            configReader.watchConfigFile(() => {
                watchCallbackCalled = true;
            });

            // Store callback count before dispose
            const callbackCountBeforeDispose = fileWatchCallbacks.length;

            // Dispose all components
            permissionManager.dispose();
            configReader.dispose();

            // Verify cleanup
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[PermissionManager] Disposed'
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '[ConfigReader] Stopped watching config file'
            );

            // Verify callbacks were cleared
            expect(fs.unwatchFile).toHaveBeenCalled();
        });
    });
});