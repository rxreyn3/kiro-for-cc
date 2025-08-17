# Prompts Integration Test Cases

## Test File

`prompts.test.ts`

## Test Purpose

Ensure that the Prompt system's end-to-end functionality continues to work properly after code updates, including the complete process of loading real prompt files, rendering, content validation, etc.

## Test Case Overview

| Case ID | Function Description                   | Test Type |
| ------- | -------------------------------------- | --------- |
| INT-01  | Generate correct spec creation prompt  | Positive Test |
| INT-02  | Verify spec prompt contains directory creation instructions | Positive Test |
| INT-03  | Generate steering initialization prompt | Positive Test |
| INT-04  | Verify steering prompt contains analysis instructions | Positive Test |
| INT-05  | Verify steering prompt contains file instructions | Positive Test |
| INT-06  | Generate custom steering creation prompt | Positive Test |
| INT-07  | Verify custom steering file naming instructions | Positive Test |
| INT-08  | Generate steering refinement prompt    | Positive Test |
| INT-09  | Verify refinement prompt improvement guidelines | Positive Test |
| INT-10  | Generate steering deletion prompt      | Positive Test |
| INT-11  | Verify frontmatter of all prompts     | Positive Test |
| INT-12  | Verify all prompts can be successfully rendered | Positive Test |
| INT-13  | Verify rendered content contains no template errors | Positive Test |
| INT-14  | Verify structural consistency of prompts | Positive Test |
| INT-15  | create spec prompt snapshot test       | Regression Test |
| INT-16  | init steering prompt snapshot test     | Regression Test |
| INT-17  | create custom steering prompt snapshot test | Regression Test |
| INT-18  | refine steering prompt snapshot test   | Regression Test |
| INT-19  | delete steering prompt snapshot test   | Regression Test |

## Detailed Test Steps

### INT-01: Generate correct spec creation prompt

**Test Purpose**: Verify that the create-spec prompt can be correctly rendered and contains all required elements

**Test Data**:

- Initialize PromptLoader and load real prompts
- Variable data:

  ```typescript
  {
    description: 'A user authentication system with OAuth support',
    workspacePath: '/Users/test/my-project',
    specBasePath: '.claude/specs'
  }
  ```

**Test Steps**:

1. Call `promptLoader.renderPrompt('create-spec', variables)`
2. Check the returned string content
3. Verify it contains all provided variable values
4. Verify it contains system instructions and workflow descriptions

**Expected Results**:

- Contains 'A user authentication system with OAuth support'
- Contains '/Users/test/my-project'
- Contains '.claude/specs'
- Contains '<system>' tags
- Contains 'spec workflow' descriptions
- Contains 'Requirements', 'Design', 'Tasks' phases

### INT-02: Verify spec prompt contains directory creation instructions

**Test Purpose**: Verify that the spec creation prompt contains correct directory creation instructions

**Test Data**:

- Use the same variables as INT-01

**Test Steps**:

1. Render create-spec prompt
2. Search for directory creation related keywords
3. Verify path references

**Expected Results**:

- Contains 'mkdir' or 'create.*directory' patterns
- Contains '.claude/specs' path references

### INT-03: Generate steering initialization prompt

**Test Purpose**: Verify that the init-steering prompt can correctly generate initialization instructions

**Test Data**:

- Variable data:

  ```typescript
  {
    steeringPath: '/Users/test/project/.claude/steering'
  }
  ```

**Test Steps**:

1. Call `promptLoader.renderPrompt('init-steering', variables)`
2. Verify key elements in returned content
3. Check correct path replacement

**Expected Results**:

- Contains 'steering documents'
- Contains '/Users/test/project/.claude/steering'
- Contains 'codebase' keyword

### INT-04: Verify steering prompt contains analysis instructions

**Test Purpose**: Verify that the initialization prompt contains instructions related to codebase analysis

**Test Data**:

- Use the same variables as INT-03

**Test Steps**:

1. Render init-steering prompt
2. Search for analysis-related keywords
3. Verify it contains patterns and conventions descriptions

**Expected Results**:

- Contains 'analyzing' keyword
- Contains 'patterns'
- Contains 'conventions'

### INT-05: Verify steering prompt contains file instructions

**Test Purpose**: Verify that the initialization prompt contains instructions for creating required files

**Test Data**:

- Use the same variables as INT-03

**Test Steps**:

1. Render init-steering prompt
2. Check file creation related content
3. Verify descriptions of three core files

**Expected Results**:

- Contains 'file' keyword
- Contains '.md' extension
- Contains 'product.md', 'tech.md', 'structure.md' filenames

### INT-06: Generate custom steering creation prompt

**Test Purpose**: Verify correct rendering of the create-custom-steering prompt

**Test Data**:

- Variable data:

  ```typescript
  {
    description: 'Security best practices for API development',
    steeringPath: '/test/project/.claude/steering'
  }
  ```

**Test Steps**:

1. Call `promptLoader.renderPrompt('create-custom-steering', variables)`
2. Verify description is correctly inserted
3. Verify path is correctly replaced

**Expected Results**:

- Contains 'Security best practices for API development'
- Contains 'steering document'
- Contains '/test/project/.claude/steering'

### INT-07: Verify custom steering file naming instructions

**Test Purpose**: Verify that the prompt contains correct file naming guidance

**Test Data**:

- Use the same variables as INT-06

**Test Steps**:

1. Render create-custom-steering prompt
2. Search for file naming related instructions
3. Verify naming format descriptions

**Expected Results**:

- Contains 'Choose an appropriate kebab-case filename'
- Contains '.md' extension description

### INT-08: Generate steering refinement prompt

**Test Purpose**: Verify the functionality of the refine-steering prompt

**Test Data**:

- Variable data:

  ```typescript
  {
    filePath: '/test/project/.claude/steering/security.md'
  }
  ```

**Test Steps**:

1. Call `promptLoader.renderPrompt('refine-steering', variables)`
2. Verify file path is correctly inserted
3. Verify it contains refinement instructions

**Expected Results**:

- Contains '/test/project/.claude/steering/security.md'
- Contains 'refine' keyword
- Contains 'Review and refine'

### INT-09: Verify refinement prompt improvement guidelines

**Test Purpose**: Verify that the refinement prompt contains specific improvement guidance principles

**Test Data**:

- Use the same variables as INT-08

**Test Steps**:

1. Render refine-steering prompt
2. Check improvement guidelines content
3. Verify specific guidance principles

**Expected Results**:

- Contains 'clear and direct'
- Contains 'specific to this project'
- Contains 'concrete examples'

### INT-10: Generate steering deletion prompt

**Test Purpose**: Verify correct generation of the delete-steering prompt

**Test Data**:

- Variable data:

  ```typescript
  {
    documentName: 'security-practices.md',
    steeringPath: '/test/.claude/steering'
  }
  ```

**Test Steps**:

1. Call `promptLoader.renderPrompt('delete-steering', variables)`
2. Verify document name is correctly inserted
3. Verify path and deletion descriptions

**Expected Results**:

- Contains 'security-practices.md'
- Contains 'delete' keyword
- Contains '/test/.claude/steering'

### INT-11: Verify frontmatter of all prompts

**Test Purpose**: Verify that all loaded prompts have valid metadata

**Test Data**:

- Initialized PromptLoader instance

**Test Steps**:

1. Call `promptLoader.listPrompts()`
2. Iterate through all prompt metadata
3. Verify required fields for each prompt

**Expected Results**:

- Each prompt has a non-empty id
- Each prompt has a non-empty name
- Each prompt's version follows semantic version format (\d+\.\d+\.\d+)

### INT-12: Verify all prompts can be successfully rendered

**Test Purpose**: Verify that all prompts can be successfully rendered when provided with required variables

**Test Data**:

- Test variable sets for each prompt:

  ```typescript
  [
    { id: 'create-spec', variables: { description: 'test', workspacePath: '/test', specBasePath: '.claude/specs' } },
    { id: 'init-steering', variables: { steeringPath: '/test/.claude/steering' } },
    // ... other prompts
  ]
  ```

**Test Steps**:

1. Iterate through all test cases
2. Call renderPrompt for each prompt
3. Verify no exceptions are thrown

**Expected Results**:

- All prompts can be successfully rendered
- No exceptions are thrown

### INT-13: Verify rendered content contains no template errors

**Test Purpose**: Verify that rendered content does not contain unresolved template markers

**Test Data**:

- Use the same test data as INT-12

**Test Steps**:

1. Render each prompt
2. Check for common template error markers
3. Verify content integrity

**Expected Results**:

- Does not contain '{{'
- Does not contain '}}'
- Does not contain 'undefined'
- Does not contain '[object Object]'

### INT-14: Verify structural consistency of prompts

**Test Purpose**: Verify that main prompts maintain consistent structure

**Test Data**:

- Rendered results of spec and steering prompts

**Test Steps**:

1. Render create-spec prompt
2. Render init-steering prompt
3. Compare structural elements of both

**Expected Results**:

- Both contain <system> tag structure
- Both follow similar document format

### INT-15: spec creation prompt snapshot test

**Test Purpose**: Use snapshot testing to ensure stability of spec creation prompt output

**Test Data**:

- Fixed test variables:

  ```typescript
  {
    description: 'User authentication with JWT',
    workspacePath: '/snapshot/test',
    specBasePath: '.claude/specs'
  }
  ```

**Test Steps**:

1. Render create-spec prompt
2. Generate or compare snapshot
3. Verify output has not changed unexpectedly

**Expected Results**:

- Output matches saved snapshot
- Any changes require explicit review and update

### INT-16: steering initialization prompt snapshot test

**Test Purpose**: Use snapshot testing to ensure stability of steering initialization prompt

**Test Data**:

- Fixed test variables:

  ```typescript
  {
    steeringPath: '/snapshot/test/.claude/steering'
  }
  ```

**Test Steps**:

1. Render init-steering prompt
2. Generate or compare snapshot
3. Verify output consistency

**Expected Results**:

- Output matches saved snapshot
- Maintains backward compatibility

### INT-17: create custom steering prompt snapshot test

**Test Purpose**: Use snapshot testing to ensure stability of custom steering creation prompt

**Test Data**:

- Fixed test variables:

  ```typescript
  {
    description: 'API design patterns and best practices',
    steeringPath: '/snapshot/test/.claude/steering'
  }
  ```

**Test Steps**:

1. Render create-custom-steering prompt
2. Generate or compare snapshot
3. Verify output consistency

**Expected Results**:

- Output matches saved snapshot
- Contains user-provided description information

### INT-18: refine steering prompt snapshot test

**Test Purpose**: Use snapshot testing to ensure stability of steering refinement prompt

**Test Data**:

- Fixed test variables:

  ```typescript
  {
    filePath: '/snapshot/test/.claude/steering/api-guidelines.md'
  }
  ```

**Test Steps**:

1. Render refine-steering prompt
2. Generate or compare snapshot
3. Verify stability of refinement guidance content

**Expected Results**:

- Output matches saved snapshot
- Contains correct file path references

### INT-19: delete steering prompt snapshot test

**Test Purpose**: Use snapshot testing to ensure stability of steering deletion prompt

**Test Data**:

- Fixed test variables:

  ```typescript
  {
    documentName: 'deprecated-guidelines.md',
    steeringPath: '/snapshot/test/.claude/steering'
  }
  ```

**Test Steps**:

1. Render delete-steering prompt
2. Generate or compare snapshot
3. Verify deletion operation prompt content

**Expected Results**:

- Output matches saved snapshot
- Contains document name and path information

## Test Considerations

### Real File Dependencies

- Integration tests use real prompt files
- Ensure prompts/target directory is correctly compiled
- Run build-prompts script before testing

### Snapshot Test Management

- Snapshot files are saved in **snapshots** directory
- Updating snapshots requires explicit intent: `npm test -- -u`
- Regularly review snapshot changes to avoid unexpected regressions

### Variable Coverage

- Tests should cover various combinations of required and optional variables
- Edge cases: empty strings, special characters, long text
- Ensure error paths are also tested

### Performance Monitoring

- Integration tests are slower than unit tests
- Monitor test execution time
- Optimize or parallelize tests when necessary
