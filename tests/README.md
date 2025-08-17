# Test Directory

This directory contains all test-related files for the project.

## Directory Structure

```plain
tests/
├── README.md                      # This document
├── MANUAL_TESTING.md             # Manual testing checklist and records
├── __mocks__/                    # Mock files
│   └── vscode.ts                 # VSCode API mock
├── unit/                         # Unit tests
│   ├── services/
│   │   ├── promptLoader.test.ts  # PromptLoader tests
│   │   └── promptLoader.md       # PromptLoader test documentation
│   ├── prompts/
│   │   ├── markdownParsing.test.ts # Markdown parsing tests
│   │   └── markdownParsing.md     # Markdown parsing test documentation
│   └── features/
│       ├── specManager.test.ts   # SpecManager tests (to be improved)
│       └── specManager.md        # SpecManager test documentation
└── integration/                  # Integration tests
    ├── prompts.test.ts          # Prompts integration tests
    ├── prompts.md               # Prompts integration test documentation
    ├── promptSnapshots.test.ts  # Prompt snapshot tests
    ├── promptSnapshots.md       # Prompt snapshot test documentation
    └── __snapshots__/           # Jest snapshot files
```

## Testing Strategy

- **Unit Tests**: Test independent functions and classes
- **Integration Tests**: Test interactions between components
- **Snapshot Tests**: Prevent unexpected changes to prompt content

## Running Tests

```bash
# Run all tests
npm test

# Run specific file
npm test promptLoader.test.ts

# Run tests and view coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

## Test Documentation

Each test file has corresponding Markdown documentation containing:

- Test case IDs and descriptions
- Test purpose and setup data
- Detailed test steps
- Expected results

Test case ID format:

- `PL-XX`: PromptLoader tests
- `MD-XX`: Markdown parsing tests
- `SM-XX`: SpecManager tests
- `INT-XX`: Integration tests

## Current Status

### Completed

- ✅ PromptLoader unit tests (11 test cases)
- ✅ Markdown parsing tests (7 test cases)
- ✅ Prompts integration tests (14 test cases)
- ✅ Prompt snapshot tests (5 test cases)

### In Progress

- 🚧 SpecManager unit tests (TypeScript type issues)
- 🚧 SteeringManager unit tests

### Planned

- 📅 File operation integration tests
- 📅 Provider class tests

## Notes

1. **VSCode API Mock**: VSCode extension testing is complex, requiring extensive API mocking
2. **Type Issues**: TypeScript strict type checking may cause mocking difficulties
3. **Async Operations**: Handle file system and other async operations carefully
4. **Test Isolation**: Ensure tests don't interfere with each other