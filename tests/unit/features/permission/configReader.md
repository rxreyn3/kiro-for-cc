# ConfigReader Unit Test Cases

## Test File

`configReader.test.ts`

## Test Purpose

Ensure the ConfigReader service correctly reads and writes configuration files, including file operations, JSON parsing, error handling, file monitoring, and other core functionalities. This module is responsible for managing permission state in the `~/.claude.json` configuration file.

## Test Case Overview

| Case ID | Feature Description                                      | Test Type     |
| ------- | -------------------------------------------------------- | ------------- |
| CR-01   | Read existing config file and return permission status  | Positive test |
| CR-02   | Return false when config file does not exist           | Positive test |
| CR-03   | Return false when config file JSON format is invalid   | Exception test |
| CR-04   | bypassPermissionsModeAccepted field missing            | Positive test |
| CR-05   | Set permission status to new file                      | Positive test |
| CR-06   | Update existing config file preserving other fields    | Positive test |
| CR-07   | Config file parse failure retry mechanism              | Exception test |
| CR-08   | Create directory if it doesn't exist                   | Positive test |
| CR-09   | File monitoring triggers callback                       | Positive test |
| CR-10   | dispose cleans up file monitoring                      | Positive test |

## Detailed Test Steps

### CR-01: Read Existing Config File and Return Permission Status

**Test Purpose**: Verify ability to correctly read permission status from config file

**Test Data**:

- Mock file exists with content:

  ```json
  {
    "bypassPermissionsModeAccepted": true,
    "otherField": "value"
  }
  ```

**Test Steps**:

1. Create ConfigReader instance
2. Mock fs.existsSync to return true
3. Mock fs.promises.readFile to return config content
4. Call `getBypassPermissionStatus()`
5. Verify return value

**Expected Results**:

- Return `true`
- Do not output error logs
- fs.promises.readFile is called with path `~/.claude.json`

### CR-02: Return False When Config File Does Not Exist

**Test Purpose**: Verify default behavior when file does not exist

**Test Data**:

- Mock fs.existsSync to return false

**Test Steps**:

1. Create ConfigReader instance
2. Call `getBypassPermissionStatus()`
3. Verify return value and logs

**Expected Results**:

- Return `false`
- Log contains: `[ConfigReader] Config file not found: /Users/.../`.claude.json`
- Do not call fs.promises.readFile

### CR-03: Return False When Config File JSON Format Is Invalid

**Test Purpose**: Verify error handling when JSON parsing fails

**Test Data**:

- Mock file content as invalid JSON: `{ invalid json }`

**Test Steps**:

1. Mock fs.existsSync to return true
2. Mock fs.promises.readFile to return invalid JSON
3. Call `getBypassPermissionStatus()`
4. Verify error handling

**Expected Results**:

- Return `false`
- Log contains: `[ConfigReader] Error reading config:`
- Do not throw uncaught exceptions

### CR-04: bypassPermissionsModeAccepted Field Missing

**Test Purpose**: Verify return false when field is missing

**Test Data**:

- Mock file content as:

  ```json
  {
    "otherField": "value"
  }
  ```

**Test Steps**:

1. Mock file exists and returns above content
2. Call `getBypassPermissionStatus()`
3. Verify return value

**Expected Results**:

- Return `false` (missing field or non-true values return false)
- Complete normally, no errors

### CR-05: Set Permission Status to New File

**Test Purpose**: Verify creation of new config file and setting permissions

**Test Data**:

- Mock file does not exist
- Set permission value to true

**Test Steps**:

1. Mock fs.existsSync to return false
2. Mock fs.promises.mkdir and fs.promises.writeFile
3. Call `setBypassPermission(true)`
4. Verify file operations

**Expected Results**:

- fs.promises.mkdir is called (create directory)
- fs.promises.writeFile is called with content:

  ```json
  {
    "bypassPermissionsModeAccepted": true
  }
  ```

- Use 2-space indentation
- Log contains: `[ConfigReader] Set bypassPermissionsModeAccepted to true`

### CR-06: Update Existing Config File Preserving Other Fields

**Test Purpose**: Verify updating config while preserving original fields

**Test Data**:

- Mock existing file content:

  ```json
  {
    "bypassPermissionsModeAccepted": false,
    "apiKey": "secret",
    "theme": "dark"
  }
  ```

**Test Steps**:

1. Mock file exists and returns above content
2. Call `setBypassPermission(true)`
3. Verify written content

**Expected Results**:

- fs.promises.writeFile is called with content containing all original fields
- `bypassPermissionsModeAccepted` updated to true
- Other fields remain unchanged
- Maintain correct JSON format

### CR-07: Config File Parse Failure Retry Mechanism

**Test Purpose**: Verify retry logic when JSON parsing fails

**Test Data**:

- Mock file content as invalid JSON
- Retry still fails

**Test Steps**:

1. Mock file exists but content is invalid
2. Call `setBypassPermission(true)`
3. Verify retry behavior

**Expected Results**:

- JSON.parse is called 3 times (initial + 2 retries)
- Log contains retry information
- Finally use empty object as configuration
- Successfully write new configuration

### CR-08: Create Directory If It Doesn't Exist

**Test Purpose**: Verify automatic creation of config directory

**Test Data**:

- Mock directory does not exist
- Mock fs.promises.mkdir

**Test Steps**:

1. Mock directory check returns false
2. Call `setBypassPermission(true)`
3. Verify directory creation

**Expected Results**:

- fs.promises.mkdir is called
- Use `{ recursive: true }` option
- Directory path is correct (user home directory)

### CR-09: File Monitoring Triggers Callback

**Test Purpose**: Verify callback is triggered when file changes

**Test Data**:

- Mock fs.watchFile
- Simulate file change events

**Test Steps**:

1. Create ConfigReader instance
2. Register monitoring callback
3. Call `watchConfigFile(callback)`
4. Simulate file change
5. Verify callback is called

**Expected Results**:

- fs.watchFile is called with monitoring interval 2000ms
- Callback is triggered when file changes
- Log contains: `[ConfigReader] Started watching config file`

### CR-10: dispose Cleans Up File Monitoring

**Test Purpose**: Verify resource cleanup is executed correctly

**Test Data**:

- File monitoring already set up

**Test Steps**:

1. Create ConfigReader and set up monitoring
2. Call `dispose()`
3. Verify cleanup operations

**Expected Results**:

- fs.unwatchFile is called
- Log contains: `[ConfigReader] Stopped watching config file`
- No more callbacks will be triggered

## Test Considerations

### Mocking Strategy

- Mock all fs module methods (existsSync, promises.readFile, promises.writeFile, promises.mkdir)
- Mock fs.watchFile and fs.unwatchFile
- Mock os.homedir() to return fixed path
- Mock OutputChannel's appendLine method

### File Path Handling

- Config file path: `~/.claude.json`
- Need to correctly handle path concatenation
- Use fixed home directory path during testing

### JSON Processing

- Use 2-space indentation when writing
- Maintain field order (although JSON doesn't guarantee order)
- Handle various invalid JSON situations

### Error Handling

- File read/write errors need to be caught
- JSON parsing errors have retry mechanism
- All errors are logged to OutputChannel

### Async Operations

- All file operations are asynchronous
- Use async/await to handle Promises
- Tests need to properly handle async operations

### File Monitoring

- Use fs.watchFile instead of fs.watch
- Monitoring interval 2000ms
- Only trigger callback when file modification time changes
