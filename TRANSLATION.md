# English Translation

This branch contains a comprehensive English translation of the Kiro for Claude Code project, making it fully accessible to English-speaking developers.

## What Was Translated

### ✅ Production Code
- All Chinese comments in TypeScript/JavaScript files
- Code strings and user-facing messages
- Configuration file comments

### ✅ Documentation
- Specification documents (.claude/specs/)
- Agent definitions and prompts
- Test documentation and descriptions
- System prompts and workflows

### ✅ Test Files
- Test case descriptions and comments
- Test documentation (markdown files)
- Test snapshots with Chinese content

### ❌ Intentionally NOT Translated
- `README.zh-CN.md` - This is the Chinese version of the README and should remain in Chinese
- Emoji and Unicode symbols used for UI enhancement

## Translation Quality

- **Method**: Systematic AI-assisted translation using specialized translation agents
- **Scope**: 50+ files across the entire codebase
- **Accuracy**: Technical terminology preserved, context-aware translations
- **Functionality**: All code functionality maintained, no breaking changes

## Branch Strategy

This translation is maintained on the `english-translation` branch to facilitate easy integration with upstream updates.

### Current Setup
- **Origin**: `git@github.com:rxreyn3/kiro-for-cc.git` (your fork)
- **Upstream**: `https://github.com/notdp/kiro-for-cc.git` (original repo)
- **Branch**: `english-translation` (this translated version)
- **Main**: `main` (clean sync point with upstream)

## Syncing with Upstream Updates

When the original repository receives updates, follow this workflow:

### 1. Sync Main Branch
```bash
# Switch to main and sync with upstream
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Update Translation Branch
```bash
# Switch to translation branch and merge latest main
git checkout english-translation
git merge main

# Resolve any conflicts (likely in translated content)
# Then push updated translation
git push origin english-translation
```

### 3. Handle Translation Conflicts
When merging upstream changes, conflicts may occur in files that were translated:
- **Accept upstream changes** for new functionality
- **Preserve English translations** for content that was already translated
- **Translate new Chinese content** to English as needed

## Files with Potential Merge Conflicts

The following files are most likely to have conflicts during upstream merges:

**High Probability:**
- Test files in `tests/` directories
- Spec documents in `.claude/specs/`
- Agent files in `src/resources/agents/`

**Medium Probability:**
- Production code with Chinese comments
- Configuration files with Chinese comments
- Documentation files

**Low Probability:**
- Pure code files without comments
- Binary files and images

## Contributing Back

If you want to contribute the English translation back to the original project:

1. **Create a PR** from your `english-translation` branch to the upstream repository
2. **Highlight benefits**: Improved accessibility for international developers
3. **Emphasize non-breaking**: All functionality preserved
4. **Show scope**: Comprehensive translation across entire codebase

## Maintenance Notes

- **Keep translations current**: When adding new Chinese content, translate it immediately
- **Document changes**: Update this file when modifying the translation strategy
- **Test thoroughly**: Ensure all functionality works after upstream merges
- **Use translation agents**: Leverage the `chinese-to-english-translator` agent for consistency

## Translation Agent

This repository includes a `chinese-to-english-translator` agent in `.claude/agents/` that was used for the systematic translation. This agent can be used for:
- Translating new Chinese content
- Maintaining translation consistency
- Handling future translation needs

## Local Installation

To install your English translation version instead of the marketplace version:

### Quick Install
```bash
# Run the automated installation script
./install-local.sh
```

### Manual Installation
```bash
# Uninstall marketplace version
cursor --uninstall-extension heisebaiyun.kiro-for-cc

# Build and install local version
npm run package
cursor --install-extension kiro-for-cc-0.2.6.vsix
```

### Updating Your Local Version
When you make changes to the translation or pull upstream updates:
```bash
# Option 1: Use the script (recommended)
./install-local.sh

# Option 2: Manual process
npm run package
cursor --uninstall-extension heisebaiyun.kiro-for-cc
cursor --install-extension kiro-for-cc-*.vsix
```

**Note**: The extension installs globally for your user profile, so it's automatically available in all future Cursor instances.

## Branch Commands Reference

```bash
# View all branches
git branch -a

# Switch to translation branch
git checkout english-translation

# Switch to main for upstream sync
git checkout main

# Check translation status
git log --oneline --graph english-translation main

# See what's different between branches
git diff main english-translation
```

---

**Last Updated**: August 17, 2025  
**Translation Commit**: a8552d2 (feat: translate all Chinese content to English)  
**Files Translated**: 59 files, 3377 insertions, 3288 deletions