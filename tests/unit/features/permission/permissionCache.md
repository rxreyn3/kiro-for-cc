# PermissionCache Unit Test Cases

## Test File

`permissionCache.test.ts`

## Test Purpose

Ensure the PermissionCache service correctly manages permission state caching, including cache reading, refreshing, event triggering, and other core functionalities. This module is a core component of the permission validation system, responsible for caching permission state and notifying other components when permissions change.

## Test Case Overview

| Case ID | Feature Description                               | Test Type     |
| ------- | ------------------------------------------------- | ------------- |
| PC-01   | First time get permission status (no cache)      | Positive test |
| PC-02   | Get permission status from cache                 | Positive test |
| PC-03   | Refresh cache (no return value)                  | Positive test |
| PC-04   | Refresh and get latest status                    | Positive test |
| PC-05   | Permission change from false to true triggers event | Positive test |
| PC-06   | Permission change from true to false triggers event | Positive test |
| PC-07   | No event triggered when permission state unchanged | Positive test |
| PC-08   | Multiple consecutive get calls use cache         | Performance test |
| PC-09   | Return false when ConfigReader read fails       | Exception test |
| PC-10   | Event listeners correctly receive permission changes | Positive test |

## Detailed Test Steps

### PC-01: First Time Get Permission Status (No Cache)

**Test Purpose**: Verify first call to `get()` reads from ConfigReader and caches state

**Test Data**:

- Mock ConfigReader to return true
- Ensure cache is empty (first call)

**Test Steps**:

1. Create PermissionCache instance
2. Call `get()` method
3. Verify ConfigReader.getBypassPermissionStatus is called
4. Verify return value is correct

**Expected Results**:

- ConfigReader.getBypassPermissionStatus is called once
- Return value is true
- Cache is set

### PC-02: Get Permission Status from Cache

**Test Purpose**: Verify subsequent calls to `get()` return directly from cache without calling ConfigReader

**Test Data**:

- First call `get()` to establish cache
- Mock ConfigReader to return true

**Test Steps**:

1. Create PermissionCache instance
2. First call to `get()` to establish cache
3. Second call to `get()`
4. Verify ConfigReader call count

**Expected Results**:

- ConfigReader.getBypassPermissionStatus is only called once
- Second call returns cached value directly
- Both return values are the same

### PC-03: Refresh Cache (No Return Value)

**Test Purpose**: Verify `refresh()` method updates cache but does not return value

**Test Data**:

- Mock ConfigReader initially returns false
- After refresh returns true

**Test Steps**:

1. Create PermissionCache instance
2. Call `get()` to cache false
3. Change Mock return value to true
4. Call `refresh()`
5. Call `get()` again to verify new value

**Expected Results**:

- `refresh()` returns Promise<void>
- Cache is updated to new value
- Subsequent `get()` returns new value

### PC-04: Refresh and Get Latest Status

**Test Purpose**: Verify `refreshAndGet()` method updates cache and returns latest value

**Test Data**:

- Mock ConfigReader to return true
- Initial cache is false

**Test Steps**:

1. Create PermissionCache instance
2. Set initial cache to false
3. Call `refreshAndGet()`
4. Verify return value and cache state

**Expected Results**:

- Return latest value true
- Cache is updated to true
- ConfigReader is called once

### PC-05: Permission Change from False to True Triggers Event

**Test Purpose**: Verify event is triggered and logs recorded when permission is granted

**Test Data**:

- Mock ConfigReader initially returns false
- After refresh returns true
- Set up event listeners

**Test Steps**:

1. Create PermissionCache instance
2. Register event listeners
3. Call `get()` to cache false
4. Change Mock to return true
5. Call `refreshAndGet()`
6. Verify event is triggered

**Expected Results**:

- Event listener is called with parameter true
- Log contains: `[PermissionCache] Permission changed: false -> true`
- Log contains: `[PermissionCache] Permission granted! Firing event.`

### PC-06: Permission Change from True to False Triggers Event

**Test Purpose**: Verify event is triggered and logs recorded when permission is revoked

**Test Data**:

- Mock ConfigReader initially returns true
- After refresh returns false
- Set up event listeners

**Test Steps**:

1. Create PermissionCache instance
2. Register event listeners
3. Call `get()` to cache true
4. Change Mock to return false
5. Call `refreshAndGet()`
6. Verify event is triggered

**Expected Results**:

- Event listener is called with parameter false
- Log contains: `[PermissionCache] Permission changed: true -> false`
- Log contains: `[PermissionCache] Permission revoked! Firing event.`

### PC-07: No Event Triggered When Permission State Unchanged

**Test Purpose**: Verify no event is triggered when permission state is unchanged, avoiding unnecessary notifications

**Test Data**:

- Mock ConfigReader always returns true
- Set up event listeners

**Test Steps**:

1. Create PermissionCache instance
2. Register event listeners
3. Call `get()` to cache true
4. Call `refreshAndGet()`
5. Verify event is not triggered

**Expected Results**:

- Event listener is not called
- No permission change logs output
- Cache value remains unchanged

### PC-08: Multiple Consecutive Get Calls Use Cache

**Test Purpose**: Verify cache mechanism performance advantage, avoiding frequent file reads

**Test Data**:

- Mock ConfigReader to return true
- Simulate multiple consecutive calls

**Test Steps**:

1. Create PermissionCache instance
2. Call `get()` 10 times consecutively
3. Verify ConfigReader call count
4. Verify all return values are consistent

**Expected Results**:

- ConfigReader.getBypassPermissionStatus is only called once
- All calls return the same value
- Subsequent calls return immediately (no async waiting)

### PC-09: Return False When ConfigReader Read Fails

**Test Purpose**: Verify error handling mechanism, ensure system safely degrades when read fails

**Test Data**:

- Mock ConfigReader to throw error
- Error message: `File read error`

**Test Steps**:

1. Create PermissionCache instance
2. Configure ConfigReader Mock to throw error
3. Call `get()`
4. Verify return value and error handling

**Expected Results**:

- Return false (safe default value)
- Do not throw uncaught exceptions
- Cache value is false

### PC-10: Event Listeners Correctly Receive Permission Changes

**Test Purpose**: Verify EventEmitter mechanism works correctly, supporting multiple listeners

**Test Data**:

- Mock ConfigReader return value change sequence
- Register multiple event listeners

**Test Steps**:

1. Create PermissionCache instance
2. Register 3 different event listeners
3. Trigger permission change (false -> true)
4. Verify all listeners are called
5. Remove one listener
6. Trigger permission change again
7. Verify remaining listeners are called

**Expected Results**:

- All registered listeners receive events
- Listeners receive correct parameter values
- Removed listener is no longer called
- Remaining listeners continue to work normally

## Test Considerations

### Mocking Strategy

- Mock ConfigReader's `getBypassPermissionStatus` method
- Mock OutputChannel's `appendLine` method
- Use Jest's `jest.fn()` to track calls

### Event System Testing

- PermissionCache inherits from vscode.EventEmitter<boolean>
- Use `event` property to register listeners
- Events only trigger when permission state changes
- Support multiple listeners working simultaneously

### Cache Mechanism

- Cache uses private field `cache?: boolean`
- undefined indicates uncached, needs reading
- Cached value may be false (valid cache)
- Refresh operations update cache

### Log Output

- Output detailed logs when permissions change
- Include comparison of old and new values
- Distinguish between grant and revoke scenarios
- No logs output when state unchanged

### Async Operations

- All methods return Promise
- ConfigReader operations are asynchronous
- Event triggering is synchronous
- Tests need to properly handle Promises

### Edge Conditions

- First call has cache as undefined
- false is a valid cache value
- Consecutive identical refreshes don't trigger events
- Return false when ConfigReader throws exceptions
