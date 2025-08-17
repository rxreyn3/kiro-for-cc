# PermissionManager Unit Test Cases

## Test File

`permissionManager.test.ts`

## Test Purpose

Ensure PermissionManager service correctly manages the overall permission system workflow, including permission initialization, permission checking, permission granting, UI management, event handling, and other core functions. This module is the core manager of the permission system, coordinating other components to complete the permission verification process.

## Test Case Overview

| Case ID | Function Description                                            | Test Type      |
| ------- | --------------------------------------------------------------- | -------------- |
| PM-01   | Initialize permission system and start monitoring              | Positive Test  |
| PM-02   | Direct return true when permissions exist during initialization| Positive Test  |
| PM-03   | Show permission setup interface when no permissions            | Positive Test  |
| PM-04   | Close UI and show notification when permission changes from false to true | Positive Test |
| PM-05   | Show warning and setup interface when permission changes from true to false | Positive Test |
| PM-06   | Check permissions using cache                                   | Positive Test  |
| PM-07   | Grant permission updates config and cache                       | Positive Test  |
| PM-08   | Retry mechanism handles permission denial                       | Positive Test  |
| PM-09   | User chooses to uninstall extension                            | Positive Test  |
| PM-10   | Reset permission triggers event and shows setup interface      | Positive Test  |

## Detailed Test Steps

### PM-01: Initialize Permission System and Start Monitoring

**Test Purpose**: Verify file monitoring is started during permission system initialization

**Test Data**:

- Mock PermissionCache returns false
- Mock ConfigReader.watchConfigFile

**Test Steps**:

1. Create PermissionManager instance
2. Call `initializePermissions()`
3. Verify monitoring starts
4. Verify cache refresh is called

**Expected Results**:

- `startMonitoring()` is called
- ConfigReader.watchConfigFile is called
- Log contains: `[PermissionManager] Initializing permissions...`
- Log contains: `[PermissionManager] Starting file monitoring...`

### PM-02: Direct Return True When Permissions Exist During Initialization

**Test Purpose**: Verify quick return when permissions already exist

**Test Data**:

- Mock cache.refreshAndGet returns true

**Test Steps**:

1. Create PermissionManager instance
2. Call `initializePermissions()`
3. Verify return value and flow

**Expected Results**:

- Returns `true`
- Does not show permission setup interface
- Log contains: `[PermissionManager] Permissions already granted`
- Still starts file monitoring

### PM-03: Show Permission Setup Interface When No Permissions

**Test Purpose**: Verify complete setup flow when no permissions exist

**Test Data**:

- Mock cache.refreshAndGet returns false
- Mock showPermissionSetup returns true

**Test Steps**:

1. Create PermissionManager instance
2. Call `initializePermissions()`
3. Verify permission setup flow

**Expected Results**:

- `showPermissionSetup()` is called
- Creates permission terminal
- Creates permission WebView
- Finally returns `true`

### PM-04: Close UI and Show Notification When Permission Changes from False to True

**Test Purpose**: Verify event handling when permission is granted

**Test Data**:

- Set up event listeners
- Mock permission change event

**Test Steps**:

1. Create PermissionManager instance
2. Trigger cache event with parameter true
3. Verify UI closure and notification

**Expected Results**:

- `closeUIElements()` is called
- WebView is closed
- Terminal is closed
- Shows success notification: `✅ Claude Code permissions detected and verified!`

### PM-05: Show Warning and Setup Interface When Permission Changes from True to False

**Test Purpose**: Verify event handling when permission is revoked

**Test Data**:

- Set up event listeners
- Mock permission revoke event

**Test Steps**:

1. Create PermissionManager instance
2. Trigger cache event with parameter false
3. Verify warning and setup interface

**Expected Results**:

- Shows warning message: `Claude Code permissions have been revoked...`
- `showPermissionSetup()` is called
- Log contains: `[PermissionManager] Permission revoked detected`

### PM-06: Check Permissions Using Cache

**Test Purpose**: Verify permission check directly uses cache

**Test Data**:

- Mock cache.get returns true

**Test Steps**:

1. Create PermissionManager instance
2. Call `checkPermission()`
3. Verify cache call

**Expected Results**:

- cache.get() is called
- Returns cached value
- Does not trigger file reading

### PM-07: Grant Permission Updates Config and Cache

**Test Purpose**: Verify complete flow of permission granting

**Test Data**:

- Mock ConfigReader.setBypassPermission
- Mock cache.refresh

**Test Steps**:

1. Create PermissionManager instance
2. Call `grantPermission()`
3. Verify config update and cache refresh

**Expected Results**:

- ConfigReader.setBypassPermission(true) is called
- cache.refresh() is called
- Returns `true`
- Log contains: `[PermissionManager] Permission granted via WebView`

### PM-08: Retry Mechanism Handles Permission Denial

**Test Purpose**: Verify retry flow after user denies permissions

**Test Data**:

- Mock initial permission as false
- Mock showPermissionSetup first time returns false
- Mock user selects "Try Again"
- Mock second time returns true

**Test Steps**:

1. Create PermissionManager instance
2. Call `initializePermissions()`
3. Simulate user denial then retry
4. Verify retry flow

**Expected Results**:

- Shows warning message
- Provides "Try Again" and "Uninstall" options
- Second call to showPermissionSetup
- Finally returns `true`

### PM-09: User Chooses to Uninstall Extension

**Test Purpose**: Verify flow when user chooses to uninstall

**Test Data**:

- Mock user selects "Uninstall"
- Mock confirmation dialog

**Test Steps**:

1. Create PermissionManager instance
2. Simulate no permissions state
3. User chooses uninstall
4. Confirm uninstall

**Expected Results**:

- Shows confirmation dialog
- Executes uninstall command: `workbench.extensions.uninstallExtension`
- Log contains: `[PermissionManager] User chose to uninstall`

### PM-10: Reset Permission Triggers Event and Shows Setup Interface

**Test Purpose**: Verify permission reset functionality

**Test Data**:

- Mock ConfigReader.setBypassPermission
- Mock cache.refresh

**Test Steps**:

1. Create PermissionManager instance
2. Call `resetPermission()`
3. Verify reset flow

**Expected Results**:

- ConfigReader.setBypassPermission(false) is called
- cache.refresh() is called
- Returns `true`
- Triggers permission change event (automatically shows setup interface)

## Test Considerations

### Mock Strategy

- Mock ConfigReader and PermissionCache
- Mock PermissionWebview.createOrShow static method
- Mock ClaudeCodeProvider.createPermissionTerminal static method
- Mock vscode.window various message methods
- Mock vscode.commands.executeCommand

### Event Handling

- PermissionManager listens to cache events
- Tests need to simulate event triggers
- Verify side effects of event handling

### UI Management

- Creation and destruction of WebView and terminal
- Ensure UI elements are properly closed
- Handle WebView callbacks (onAccept, onCancel, onDispose)

### Async Flow

- showPermissionSetup returns Promise
- Need to properly handle Promise chains
- Retry loop is asynchronous

### Error Handling

- Handle permission grant failures
- Handle uninstall command failures
- Handle WebView creation failures

### Resource Cleanup

- dispose method cleans up all resources
- Including event listeners, WebView, terminal
- Call dispose methods of child components
