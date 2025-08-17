# Implementation Tasks

## 1. Create Agent Manager Core Functionality

- [x] 1.1 Create AgentManager class
  - Create `agentManager.ts` in `src/features/agents/` directory
  - Implement `AgentManager` interface, including initialization, get list, check existence methods
  - _Requirements: 1.1, 5.1_

- [x] 1.2 Implement built-in agents initialization logic
  - Implement `initializeBuiltInAgents()` method
  - Copy built-in agents from `src/resources/agents/` to `.claude/agents/kfc/`
  - Handle cases where files already exist (skip copying)
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 1.3 Implement agent list retrieval functionality
  - Implement `getAgentList()` method, supporting project-level and user-level agents
  - Parse YAML frontmatter of agent files to get metadata
  - Return `AgentInfo` array
  - _Requirements: 6.2_

- [x] 1.4 Add agent path management functionality
  - Implement `getAgentPath()` method
  - Implement `checkAgentExists()` method
  - Handle path resolution for project-level and user-level agents
  - _Requirements: 6.2_

## 2. Create Agents Explorer Provider

- [x] 2.1 Create AgentsExplorerProvider class
  - Create `agentsExplorerProvider.ts` in `src/providers/` directory
  - Extend `vscode.TreeDataProvider<AgentItem>`
  - Inject `AgentManager` dependency
  - _Requirements: 6.1, 6.2_

- [x] 2.2 Implement tree structure display
  - Implement `getChildren()` method, grouping project-level and user-level agents
  - Create `AgentItem` tree nodes for each agent
  - Set appropriate icons and tooltip information
  - _Requirements: 6.2_

- [x] 2.3 Implement agent file opening functionality
  - Implement clicking agent to open corresponding .md file
  - Add file opening command to `AgentItem`
  - _Requirements: 6.3_

- [x] 2.4 Implement view refresh mechanism
  - Implement `refresh()` method
  - Monitor `.claude/agents/` directory changes and auto-refresh
  - _Requirements: 6.1_

## 3. Integrate into VSCode Extension

- [x] 3.1 Initialize Agent Manager in extension.ts
  - Create `AgentManager` instance in `activate()` function
  - Call `initializeBuiltInAgents()` for initialization
  - _Requirements: 7.1_

- [x] 3.2 Register Agents Explorer Provider
  - Create `AgentsExplorerProvider` instance
  - Register using `vscode.window.registerTreeDataProvider()`
  - Add to `context.subscriptions`
  - _Requirements: 6.1_

- [x] 3.3 Update package.json configuration
  - Add `agentsExplorer` view configuration in `contributes.views`
  - Place view below Spec Explorer in `kfc-sidebar` container
  - Configure view title and icon
  - _Requirements: 6.1_

- [x] 3.4 Add new button to Spec Explorer
  - Define `kfc.spec.createWithAgents` command in package.json
  - Add button configuration in `view/title`, displayed at top of Spec Explorer
  - Set appropriate icon and tooltip text
  - _Requirements: 8.1_

- [x] 3.5 Implement new spec creation flow
  - Add `createWithAgents()` method in SpecManager
  - Add specific identifier in prompt to trigger subagent workflow
  - Ensure calling spec-system-prompt-loader to load workflow
  - _Requirements: 8.2, 8.3, 8.4_

## 4. Implement File Edit Confirmation Functionality

- [x] 4.1 Add confirmation dialog before file save
  - Listen to save events of agent files
  - Display confirmation dialog in center of screen
  - Allow save if confirmed, prevent save if cancelled
  - _Requirements: 6.4_

## 5. Add File Monitoring Functionality

- [x] 5.1 Set up file system watcher
  - Monitor changes in `.claude/agents/` directory to auto-refresh Agents Explorer
  - Monitor changes in `~/.claude/agents/` directory
  - _Requirements: 6.2_

## 6. Copy System Prompt File

- [x] 6.1 Copy spec-workflow-starter.md during initialization (copy if not exist)
  - Copy from `src/resources/system-prompts/` to `.claude/system-prompts/`
  - Ensure directory exists, create if it doesn't
  - Skip if file already exists
  - _Requirements: 2.2_

## 7. Add Commands and Context Menus

- [x] 7.1 Add refresh agents command
  - Define `kfc.agents.refresh` command in package.json
  - Register command handler in extension.ts
  - _Requirements: 6.2_

## 8. Error Handling and Logging

- [x] 8.1 Add error handling
  - Add try-catch blocks for all file operations
  - Handle errors like insufficient permissions, disk space, etc.
  - Log error information to output channel
  - _Requirements: 7.1_

- [x] 8.2 Add operation logging
  - Log agent initialization process
  - Log file copy and restore operations
  - Use outputChannel to output debug information
  - _Requirements: 1.1_

## 9. Testing and Verification

- [x] 9.1 Write unit tests
  - Test various methods of AgentManager
  - Test tree structure generation of AgentsExplorerProvider
  - Mock file system operations
  - _Requirements: 1.1, 6.2_

- [ ] 9.2 Conduct integration testing
  - Test complete initialization flow
  - Test file monitoring and recovery functionality
  - Test UI interaction and command execution
  - _Requirements: 7.1, 6.3_

- [ ] 9.3 Acceptance testing
  - Verify agents display below Spec Explorer
  - Verify clicking can open files for editing
  - Verify edit confirmation dialog functionality
  - Verify automatic copying of built-in agents (check for missing and copy on each startup)
  - Verify Spec Explorer new button functionality and subagent flow
  - _Requirements: 6.1, 6.3, 6.4, 7.1, 8.1, 8.2_