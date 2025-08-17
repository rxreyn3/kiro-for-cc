# PromptLoader Unit Test Cases

## Test Files

`promptLoader.test.ts`

## Test Purpose

Ensure that the PromptLoader service continues to work normally after code updates, including core functions such as singleton pattern, initialization, loading, rendering and error handling.

## Test Case Overview

| Case ID | Function Description                   | Test Type |
| ------- | -------------------------------------- | --------- |
| PL-01   | Get singleton instance                 | Positive  |
| PL-02   | Initialize and load all prompts       | Positive  |
| PL-03   | Load prompt by ID                      | Positive  |
| PL-04   | Load non-existent prompt              | Exception |
| PL-05   | Render prompt with all variables       | Positive  |
| PL-06   | Render prompt missing optional variables | Positive  |
| PL-07   | Render prompt missing required variables | Exception |
| PL-08   | Render simple prompt without variables | Positive  |
| PL-09   | Get list of all prompts               | Positive  |
| PL-10   | Handle invalid Handlebars syntax      | Exception |
| PL-11   | Handle invalid prompt modules         | Exception |

## Detailed Test Steps

### PL-01: Get singleton instance

**Test Purpose**: Verify that PromptLoader implements the singleton pattern correctly

**Preparation**:

- Clear any existing instance state

**Test Steps**:

1. First call `PromptLoader.getInstance()`, get instance 1
2. Second call `PromptLoader.getInstance()`, get instance 2
3. Compare whether the two instances are the same object

**Expected Results**:

- instance1 === instance2 returns true
- Both calls return the same object reference

### PL-02: Initialize and load all prompts

**Test Purpose**: Verify that PromptLoader can successfully initialize and load all configured prompt templates

**Preparation**:

- Mock prompts/target module, provide test prompts:

  ```typescript
  {
    testPrompt: { frontmatter: {...}, content: '...' },
    simplePrompt: { frontmatter: {...}, content: '...' }
  }
  ```

**Test Steps**:

1. Create PromptLoader instance
2. Call `promptLoader.initialize()` method
3. Try to load registered prompts
4. Verify that the loading process does not throw exceptions

**Expected Results**:

- initialize() executes successfully, does not throw exceptions
- Internal prompts Map contains all mocked prompts
- Can access loaded prompts through loadPrompt()

### PL-03: Load prompt by ID

**Test Purpose**: Verify that the correct prompt object can be loaded by prompt ID

**Preparation**:

- Ensure PromptLoader is initialized
- Prompt with ID 'test-prompt' exists

**Test Steps**:

1. Call `promptLoader.loadPrompt('test-prompt')`
2. Check the returned prompt object
3. Verify frontmatter and content properties

**Expected Results**:

- Returns the correct prompt object
- frontmatter.id === 'test-prompt'
- frontmatter.name === 'Test Prompt'
- content contains expected template content

### PL-04: Load non-existent prompt

**Test Purpose**: Verify that the system can correctly handle loading non-existent prompts

**Preparation**:

- Ensure PromptLoader is initialized
- Use non-existent prompt ID: 'non-existent'

**Test Steps**:

1. Call `promptLoader.loadPrompt('non-existent')`
2. Catch the thrown error
3. Verify error message

**Expected Results**:

- Throws an error
- Error message: `Prompt not found: non-existent. Available prompts: test-prompt, simple-prompt`
- Error message includes list of available prompts

### PL-05: Render prompt with all variables

**Test Purpose**: Verify that the Handlebars template engine can correctly render prompts containing all variables

**Preparation**:

- Prompt template: `Hello {{name}}! {{#if age}}You are {{age}} years old.{{/if}}`
- Variable data: `{ name: 'John', age: 30 }`

**Test Steps**:

1. Call `promptLoader.renderPrompt('test-prompt', { name: 'John', age: 30 })`
2. Get rendering result
3. Verify output string

**Expected Results**:

- Returns: `Hello John! You are 30 years old.`
- All variables correctly replaced
- Conditional blocks correctly rendered

### PL-06: Render prompt missing optional variables

**Test Purpose**: Verify that the system can correctly handle missing optional variables

**Preparation**:

- Prompt template: `Hello {{name}}! {{#if age}}You are {{age}} years old.{{/if}}`
- Variable data: `{ name: 'Jane' }` (missing age)

**Test Steps**:

1. Call `promptLoader.renderPrompt('test-prompt', { name: 'Jane' })`
2. Get rendering result
3. Verify output string

**Expected Results**:

- Returns: `Hello Jane!`
- Required variables correctly replaced
- Conditional blocks not rendered due to missing variables

### PL-07: Render prompt missing required variables

**Test Purpose**: Verify that the system can correctly validate required variables and report errors when missing

**Preparation**:

- name is a required variable in the prompt definition
- Call without providing name variable: `{}`

**Test Steps**:

1. Try to call `promptLoader.renderPrompt('test-prompt', {})`
2. Catch the thrown error
3. Verify error type and message

**Expected Results**:

- Throws validation error
- Error message: `Variable validation failed: Missing required variable: name`
- Variable validation performed before rendering

### PL-08: Render simple prompt without variables

**Test Purpose**: Verify that static prompts without any variables can be rendered correctly

**Preparation**:

- Prompt template: `This is a simple prompt without any variables.`
- No variables needed

**Test Steps**:

1. Call `promptLoader.renderPrompt('simple-prompt')`
2. Get rendering result
3. Verify output matches original content

**Expected Results**:

- Returns: `This is a simple prompt without any variables.`
- Content remains unchanged
- No need to provide variable parameters

### PL-09: Get list of all prompts

**Test Purpose**: Verify that a metadata list of all loaded prompts can be obtained

**Preparation**:

- Ensure PromptLoader is initialized
- At least 2 prompts exist

**Test Steps**:

1. Call `promptLoader.listPrompts()`
2. Check the returned array
3. Verify the structure of each element

**Expected Results**:

- Returns an array containing 2 elements
- Each element contains: id, name, version, category, description
- category extracted from ID (e.g., 'test-prompt' → 'test')

### PL-10: Handle invalid Handlebars syntax

**Test Purpose**: Verify that the system can gracefully handle template syntax errors

**Preparation**:

- Create prompt with syntax error: `{{#if name}}Unclosed if block`

**Test Steps**:

1. Manually add erroneous prompt to loader
2. Try to compile template
3. Verify error handling

**Expected Results**:

- Handlebars throws compilation error
- Error is correctly caught
- Does not cause system crash

### PL-11: Handle invalid prompt modules

**Test Purpose**: Verify that invalid prompt modules can be skipped during initialization

**Preparation**:

- Add invalid module to mock: `{ invalidPrompt: { invalid: true } }`

**Test Steps**:

1. Call `promptLoader.initialize()`
2. Verify initialization process
3. Check if valid prompts are loaded normally

**Expected Results**:

- Initialization does not fail due to invalid modules
- Valid prompts load normally
- Invalid modules are silently skipped

## Test Notes

### Mock Strategy

- Use Jest mock to isolate prompts/target module
- Clear singleton instance state before each test
- Mock data should cover various edge cases

### Handlebars Features

- Number 0 is treated as falsy in conditional judgments
- Empty strings are also falsy
- undefined variables do not cause errors, they just don't render

### Performance Considerations

- Template compilation results are cached
- Initialization may be slow with large numbers of prompts
- Consider lazy loading optimization

### Test Isolation

- Each test should run independently
- Use beforeEach to reset state
- Avoid dependencies between tests
