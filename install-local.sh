#!/bin/bash
# Script to reinstall local Kiro for CC extension in Cursor

set -e

echo "🔄 Updating local Kiro for CC extension installation..."

# Check if we're on the english-translation branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "english-translation" ]; then
    echo "⚠️  Warning: Not on english-translation branch (currently on: $CURRENT_BRANCH)"
    echo "   Switching to english-translation branch..."
    git checkout english-translation
fi

# Uninstall current version
echo "🗑️  Uninstalling current version..."
cursor --uninstall-extension heisebaiyun.kiro-for-cc || echo "   (No existing version found)"

# Build new package
echo "📦 Building VSIX package..."
npm run package

# Install new version
echo "⬇️  Installing local version..."
VSIX_FILE=$(ls -t *.vsix | head -n1)
cursor --install-extension "$VSIX_FILE"

# Verify installation
echo "✅ Verifying installation..."
cursor --list-extensions | grep kiro

echo ""
echo "🎉 Local English version of Kiro for CC is now installed!"
echo "   File: $VSIX_FILE"
echo "   Branch: $(git branch --show-current)"
echo ""
echo "💡 Tip: This extension is now available in all Cursor instances."
echo "   To update in the future, just run this script again."