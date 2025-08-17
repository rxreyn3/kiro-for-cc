# AgentsExplorerProvider Unit Test Cases

## Test File

`agentsExplorerProvider.test.ts`

## Test Purpose

Ensure AgentsExplorerProvider correctly implements VSCode TreeDataProvider interface, providing tree view display functionality for agents. This module is responsible for displaying user-level and project-level agents in the VSCode sidebar and providing interactive functionality.

## Test Case Overview

| Case ID    | Function Description                    | Test Type        |
| ---------- | --------------------------------------- | ---------------- |
| TC-AEP-001 | Constructor initialization              | Positive Test    |
| TC-AEP-002 | Get root nodes (user and project groups) | Positive Test  |
| TC-AEP-003 | Display loading state                   | Positive Test    |
| TC-AEP-004 | Get agents within group                 | Positive Test    |
| TC-AEP-005 | Handle no workspace situation           | Boundary Test    |
| TC-AEP-006 | Agent node properties                   | Positive Test    |
| TC-AEP-007 | Group node properties                   | Positive Test    |
| TC-AEP-008 | Set up project agents file watching    | Positive Test    |
| TC-AEP-009 | Set up user agents file watching       | Positive Test    |
| TC-AEP-010 | File changes trigger refresh           | Positive Test    |
| TC-AEP-011 | Manual refresh functionality           | Positive Test    |
| TC-AEP-012 | Data update during refresh             | Positive Test    |
| TC-AEP-013 | Handle AgentManager errors             | Exception Test   |
| TC-AEP-014 | Handle file watcher creation failure   | Exception Test   |
| TC-AEP-015 | dispose method cleans up resources     | Positive Test    |

## Test Environment

- Test Framework: Jest
- Mocks: vscode TreeDataProvider API, AgentManager, file watchers
- Test Data: Mock agent lists and tree nodes

## Test Cases

### 1. Constructor and Initialization

#### TC-AEP-001: Constructor Initialization

- **Description**: Verify AgentsExplorerProvider initializes correctly
- **Preconditions**: Valid context, agentManager and outputChannel
- **Test Steps**:
  1. Create AgentsExplorerProvider instance
  2. Verify file watcher setup
- **Expected Results**:
  - Instance created correctly
  - File watchers properly set up

### 2. Tree Structure Generation

#### TC-AEP-002: Get Root Nodes (User and Project Groups)

- **Description**: Verify root level displays user and project agent groups
- **Preconditions**: Has workspace folders
- **Test Steps**:
  1. Call getChildren() with no parameters
  2. Verify returned nodes
- **Expected Results**:
  - Returns two nodes: User Agents and Project Agents
  - User Agents first, Project Agents second
  - Correct icons and expansion state

#### TC-AEP-003: Display Loading State

- **Description**: Verify loading animation shows during refresh
- **Preconditions**: Call refresh() method
- **Test Steps**:
  1. Call refresh()
  2. Immediately call getChildren()
  3. Wait for loading completion then call again
- **Expected Results**:
  - First call returns loading node
  - Loading node uses sync~spin icon
  - After completion returns normal nodes

#### TC-AEP-004: Get Agents Within Group

- **Description**: Verify getting agent list under specific group
- **Preconditions**: AgentManager returns mock agents
- **Test Steps**:
  1. Create group node
  2. Call getChildren(groupNode)
  3. Verify returned agent nodes
- **Expected Results**:
  - Returns all agents of corresponding type
  - Each agent node contains correct information
  - Uses robot icon

#### TC-AEP-005: Handle No Workspace Situation

- **Description**: Verify returns empty list when no workspace
- **Preconditions**: vscode.workspace.workspaceFolders is undefined
- **Test Steps**:
  1. Mock no workspace
  2. Call getChildren()
- **Expected Results**: Returns empty array

### 3. Tree Node Properties

#### TC-AEP-006: Agent Node Properties

- **Description**: Verify agent node property settings
- **Preconditions**: Create agent with complete information
- **Test Steps**:
  1. Create AgentItem instance
  2. Verify various properties
- **Expected Results**:
  - Correct label and icon
  - tooltip shows description
  - description shows tool count
  - Contains command to open file

#### TC-AEP-007: Group Node Properties

- **Description**: Verify group node property settings
- **Preconditions**: Create user group and project group nodes
- **Test Steps**:
  1. Create different types of group nodes
  2. Verify properties
- **Expected Results**:
  - User Agents uses globe icon
  - Project Agents uses root-folder icon
  - Correct tooltip text

### 4. File Watching Functionality

#### TC-AEP-008: Set Up Project Agents File Watching

- **Description**: Verify project agents directory watcher setup
- **Preconditions**: Has workspace folders
- **Test Steps**:
  1. Create provider instance
  2. Verify file watcher creation
- **Expected Results**:
  - Creates .claude/agents/**/*.md watcher
  - Listens to create, change, delete events

#### TC-AEP-009: Set Up User Agents File Watching

- **Description**: Verify user agents directory watcher setup
- **Preconditions**: User directory exists
- **Test Steps**:
  1. Create provider instance
  2. Verify user directory watcher
- **Expected Results**:
  - Creates ~/.claude/agents/**/*.md watcher
  - Handles watcher creation errors

#### TC-AEP-010: File Changes Trigger Refresh

- **Description**: Verify file changes trigger view refresh
- **Preconditions**: File watchers already set up
- **Test Steps**:
  1. Trigger file creation event
  2. Trigger file modification event
  3. Trigger file deletion event
- **Expected Results**:
  - Each event triggers _onDidChangeTreeData
  - Does not show loading animation

### 5. Refresh Mechanism

#### TC-AEP-011: Manual Refresh Functionality

- **Description**: Verify manual refresh shows loading animation
- **Preconditions**: Provider already initialized
- **Test Steps**:
  1. Call refresh() method
  2. Verify loading state
  3. Verify state after completion
- **Expected Results**:
  - Sets isLoading to true
  - Triggers tree update event
  - Returns to normal after 100ms

#### TC-AEP-012: Data Update During Refresh

- **Description**: Verify displays latest data after refresh
- **Preconditions**: AgentManager data already updated
- **Test Steps**:
  1. Update AgentManager return data
  2. Call refresh()
  3. Verify new data display
- **Expected Results**: Shows updated agent list

### 6. Error Handling

#### TC-AEP-013: Handle AgentManager Errors

- **Description**: Verify handling of errors thrown by AgentManager
- **Preconditions**: AgentManager.getAgentList throws error
- **Test Steps**:
  1. Mock getAgentList to throw error
  2. Call getChildren()
- **Expected Results**:
  - Catches error
  - Returns empty list or error node
  - Logs error message

#### TC-AEP-014: Handle File Watcher Creation Failure

- **Description**: Verify handling of file watcher creation failure
- **Preconditions**: createFileSystemWatcher throws error
- **Test Steps**:
  1. Mock watcher creation failure
  2. Create provider instance
- **Expected Results**:
  - Catches error
  - Logs error information
  - Provider still works normally

### 7. Resource Cleanup

#### TC-AEP-015: dispose Method Cleans Up Resources

- **Description**: Verify dispose correctly cleans up resources
- **Preconditions**: Provider created and watchers set up
- **Test Steps**:
  1. Create provider
  2. Call dispose()
  3. Verify resource cleanup
- **Expected Results**:
  - File watchers are disposed
  - No longer responds to file changes
