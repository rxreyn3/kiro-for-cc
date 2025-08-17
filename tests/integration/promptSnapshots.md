# Prompt Snapshot Test Cases

## Test File

`promptSnapshots.test.ts`

## Test Purpose

Use Jest snapshot testing functionality to ensure all prompt template outputs remain stable, preventing accidental content changes from affecting user experience. Snapshot tests save the complete rendered output of each prompt and compare them in subsequent runs.

## Test Case Overview

| Case ID | Function Description                   | Test Type        |
| ------- | -------------------------------------- | ---------------- |
| INT-15  | create spec prompt snapshot test      | Regression Test  |
| INT-16  | init steering prompt snapshot test    | Regression Test  |
| INT-17  | create custom steering prompt snapshot test | Regression Test |
| INT-18  | refine steering prompt snapshot test  | Regression Test  |
| INT-19  | delete steering prompt snapshot test  | Regression Test  |

## Detailed Test Steps

### INT-15: create spec prompt snapshot test

**Test Purpose**: Ensure spec creation prompt output remains stable

**Test Data**:

```typescript
{
  description: 'User authentication with JWT',
  workspacePath: '/snapshot/test',
  specBasePath: '.claude/specs'
}
```

**Test Steps**:

1. Initialize PromptLoader
2. Render create-spec prompt
3. Use `toMatchSnapshot()` to compare output

**Expected Results**:

- First run: Create snapshot file
- Subsequent runs: Output matches snapshot

### INT-16: init steering prompt snapshot test

**Test Purpose**: Ensure steering initialization prompt output remains stable

**Test Data**:

```typescript
{
  steeringPath: '/snapshot/test/.claude/steering'
}
```

**Test Steps**:

1. Render init-steering prompt
2. Compare snapshot

**Expected Results**:

- Output contains correct path and initialization instructions
- Matches saved snapshot

### INT-17: create custom steering prompt snapshot test

**Test Purpose**: Ensure custom steering creation prompt output remains stable

**Test Data**:

```typescript
{
  description: 'API design patterns and best practices',
  steeringPath: '/snapshot/test/.claude/steering'
}
```

**Test Steps**:

1. Render create-custom-steering prompt
2. Compare snapshot

**Expected Results**:

- Output contains user description
- Matches saved snapshot

### INT-18: refine steering prompt snapshot test

**Test Purpose**: Ensure steering refinement prompt output remains stable

**Test Data**:

```typescript
{
  filePath: '/snapshot/test/.claude/steering/api-guidelines.md'
}
```

**Test Steps**:

1. Render refine-steering prompt
2. Compare snapshot

**Expected Results**:

- Output contains file path and refinement guidelines
- Matches saved snapshot

### INT-19: delete steering prompt snapshot test

**Test Purpose**: Ensure steering deletion prompt output remains stable

**Test Data**:

```typescript
{
  documentName: 'deprecated-guidelines.md',
  steeringPath: '/snapshot/test/.claude/steering'
}
```

**Test Steps**:

1. Render delete-steering prompt
2. Compare snapshot

**Expected Results**:

- Output contains document name and path
- Matches saved snapshot

## Snapshot File Management

### Snapshot File Location

- Snapshots are saved in `__snapshots__/promptSnapshots.test.ts.snap`
- Each test case corresponds to one snapshot entry

### Updating Snapshots

When prompt templates are intentionally modified:

```bash
# Update all snapshots
npm test promptSnapshots.test.ts -- -u

# Interactive update
npm test promptSnapshots.test.ts -- -i
```

### Viewing Differences

When tests fail, detailed differences are displayed:

- Red: Deleted content
- Green: Added content
- Gray: Unchanged context

## Best Practices

### 1. Fixed Test Data

- Use fixed test inputs, avoid random values
- Use `/snapshot/test` prefix for paths
- Use English descriptions to avoid encoding issues

### 2. Version Control

- Snapshot files must be committed to Git
- Review snapshot changes in PRs
- Use meaningful commit messages

### 3. Regular Review

- Regularly check if snapshots are too large
- Consider whether prompts need simplification
- Ensure snapshots reflect actual usage scenarios

### 4. CI/CD Integration

- Run snapshot tests in CI
- Prohibit updating snapshots in CI
- Snapshot mismatches should cause build failures

## Common Issues

### Snapshots Too Large

If snapshot files become too large:

1. Consider testing only key parts
2. Use `expect.stringContaining()` to test partial content
3. Split large prompts into multiple small tests

### Cross-Platform Issues

Different operating systems may produce different line endings:

1. Set line endings for snapshot files in `.gitattributes`
2. Use `prettier` to format snapshots
3. Normalize line endings in tests

### Missing Snapshots

If snapshot files are missing:

1. Run tests to regenerate
2. Restore from version control
3. Ensure `.gitignore` is not ignoring snapshot files
