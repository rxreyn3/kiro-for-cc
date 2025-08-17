# UpdateChecker Unit Test Cases

## Test File

`updateChecker.test.ts`

## Test Purpose

Ensure the UpdateChecker service continues to work properly after code updates, including core functionality such as version checking, notification display, user interaction, and rate limiting.

## Test Case Overview

| Case ID | Function Description              | Test Type      |
| ------- | --------------------------------- | -------------- |
| UC-01   | Fetch latest version from GitHub API | Positive Test |
| UC-02   | Handle API network errors         | Exception Test |
| UC-03   | Handle non-200 responses          | Exception Test |
| UC-04   | Compare semantic version numbers  | Positive Test  |
| UC-05   | Display update notifications      | Positive Test  |
| UC-06   | Click view changelog              | Positive Test  |
| UC-07   | Click skip version                | Positive Test  |
| UC-08   | No prompt after skipping version  | Positive Test  |
| UC-09   | No repeated checks within 24 hours | Positive Test |
| UC-10   | Force check ignores rate limit    | Positive Test  |

## Detailed Test Steps

### UC-01: Fetch Latest Version from GitHub API

**Test Purpose**: Verify that UpdateChecker can successfully fetch the latest version information from GitHub API

**Test Data**:

- Mock fetch returns successful response
- Simulate GitHub Release API response format:

  ```json
  {
    "tag_name": "v0.1.8",
    "name": "Release v0.1.8",
    "html_url": "https://github.com/notdp/kiro-for-cc/releases/tag/v0.1.8",
    "body": "Release notes"
  }
  ```

**Test Steps**:

1. Create UpdateChecker instance
2. Call `checkForUpdates()` method
3. Verify fetch is called correctly
4. Check log output

**Expected Results**:

- fetch called with URL: `https://api.github.com/repos/notdp/kiro-for-cc/releases/latest`
- Log contains: `[UpdateChecker] Fetching latest release from GitHub...`
- Log contains: `[UpdateChecker] Latest release: v0.1.8`

### UC-02: Handle API Network Errors

**Test Purpose**: Verify the system can gracefully handle network errors

**Test Data**:

- Mock fetch throws network error
- Error message: `Network error`

**Test Steps**:

1. Configure fetch mock to throw error
2. Call `checkForUpdates()`
3. Verify error is caught
4. Check error logs

**Expected Results**:

- No uncaught exceptions are thrown
- Log contains: `[UpdateChecker] ERROR: Failed to fetch latest release: Error: Network error`
- System continues to run normally

### UC-03: Handle Non-200 Responses

**Test Purpose**: Verify the system can correctly handle HTTP error status codes

**Test Data**:

- Mock fetch returns 404 response
- Status text: `Not Found`

**Test Steps**:

1. Configure fetch to return non-OK response
2. Call `checkForUpdates()`
3. Verify response handling logic
4. Check log output

**Expected Results**:

- No update notification is displayed
- Log contains: `[UpdateChecker] GitHub API returned 404: Not Found`
- Method returns normally

### UC-04: Compare Semantic Version Numbers

**Test Purpose**: Verify the correctness of version comparison logic

**Test Data**:

- Test case matrix:

  | Current Version | Latest Version | Should Update |
  | --------------- | -------------- | ------------- |
  | 0.1.8          | v0.1.9         | Yes           |
  | 0.1.8          | v0.2.0         | Yes           |
  | 0.1.8          | v1.0.0         | Yes           |
  | 0.1.8          | v0.1.8         | No            |
  | 0.1.9          | v0.1.8         | No            |
  | 1.0.0          | v0.9.9         | No            |

**Test Steps**:

1. For each test case:
   - Set current version
   - Mock API to return latest version
   - Call `checkForUpdates()`
   - Verify if notification is displayed

**Expected Results**:

- Display notification when there's a new version
- No notification for same or older versions
- Version number prefix 'v' is handled correctly

### UC-05: Display Update Notifications

**Test Purpose**: Verify the display format and content of update notifications

**Test Data**:

- Current version: 0.1.8
- Latest version: v0.1.9

**Test Steps**:

1. Configure version difference to trigger update
2. Call `checkForUpdates()`
3. Verify notification content
4. Check button options

**Expected Results**:

- Notification message: `🎉 Kiro for CC 0.1.9 is available! (current: 0.1.8)`
- Button options: ["View Changelog", "Skip"]
- Uses showInformationMessage method

### UC-06: Click View Changelog

**Test Purpose**: Verify the behavior when clicking the "View Changelog" button

**Test Data**:

- Mock user clicking "View Changelog"
- Expected URL: `https://github.com/notdp/kiro-for-cc/releases/latest`

**Test Steps**:

1. Trigger update notification
2. Simulate user clicking "View Changelog"
3. Wait for async operations to complete
4. Verify external link call

**Expected Results**:

- vscode.env.openExternal is called
- Correct GitHub releases URL is passed
- Uses vscode.Uri.parse to handle URL

### UC-07: Click Skip Version

**Test Purpose**: Verify the implementation of skip version functionality

**Test Data**:

- Mock user clicking "Skip"
- Skipped version: 0.1.9

**Test Steps**:

1. Trigger update notification
2. Simulate user clicking "Skip"
3. Wait for async operations to complete
4. Verify state saving

**Expected Results**:

- globalState.update is called
- Save key: `kfc.skipVersion`
- Save value: `0.1.9`
- Display confirmation notification that auto-dismisses after 5 seconds

### UC-08: No Prompt After Skipping Version

**Test Purpose**: Verify that skipped versions are not prompted again

**Test Data**:

- Set skipped version: 0.1.9
- API returns same version

**Test Steps**:

1. Mock globalState to return skipped version
2. Call `checkForUpdates()`
3. Verify notification behavior

**Expected Results**:

- No update notification is displayed
- Version updates are ignored even if version number changes
- Logs normally record the check process

### UC-09: No Repeated Checks Within 24 Hours

**Test Purpose**: Verify rate limiting functionality avoids frequent checks

**Test Data**:

- Set last check time: 1 hour ago
- Check interval: 24 hours

**Test Steps**:

1. Mock last check timestamp
2. Call `checkForUpdates()`
3. Verify API call

**Expected Results**:

- fetch is not called
- Returns directly, skipping check
- Reduces unnecessary API requests

### UC-10: Force Check Ignores Rate Limit

**Test Purpose**: Verify that force check parameter can bypass rate limiting

**Test Data**:

- Set last check time: 1 hour ago
- Use force parameter

**Test Steps**:

1. Mock last check timestamp
2. Call `checkForUpdates(true)`
3. Verify API is called

**Expected Results**:

- fetch is called normally
- Ignores rate limiting
- Updates last check time

## Test Considerations

### Mock Strategy

- Use Jest mock to simulate vscode API
- Mock fetch global function
- Mock NotificationUtils to avoid actual notifications
- Clear all mocks before each test

### Async Handling

- Notification button callbacks are asynchronous
- Use `setTimeout(resolve, 0)` to wait for async operations
- Ensure Promise chain completes before verification

### State Management

- globalState is used for persistent configuration
- Skip version information needs persistent storage
- Last check time is used for rate limiting

### Version Number Handling

- GitHub tags may contain 'v' prefix
- Need to remove prefix for internal comparison
- Support major.minor.patch format

### Error Boundaries

- Network errors should not affect extension operation
- API rate limiting returning 403 needs graceful handling
- Invalid version number formats need fault tolerance
