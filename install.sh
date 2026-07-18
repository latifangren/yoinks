#!/bin/sh
set -e

# yoinks installer script

echo "yoinks installer"
echo "================\n"

# 1. Detect OS
OS="$(uname -s 2>/dev/null || true)"
ARCH="$(uname -m 2>/dev/null || true)"

case "$OS" in
  *MINGW*|*MSYS*|*CYGWIN*)
    echo "Windows detected."
    echo "Please install yoinks manually using npm:"
    echo "  npm install -g yoinks"
    exit 1
    ;;
  Darwin)
    echo "macOS ($ARCH) detected."
    ;;
  Linux)
    echo "Linux ($ARCH) detected."
    ;;
  *)
    echo "OS: $OS ($ARCH) detected."
    ;;
esac

# 2. Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed."
  echo "yoinks requires Node.js v18 or higher."
  echo "Please install it from https://nodejs.org or your package manager."
  exit 1
fi

NODE_VERSION_RAW=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION_RAW" | cut -d'v' -f2 | cut -d'.' -f1)

if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Current Node.js version is $NODE_VERSION_RAW."
  echo "yoinks requires Node.js v18 or higher."
  echo "Please update Node.js before installing."
  exit 1
fi

# 3. Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm command not found."
  echo "Please install npm alongside Node.js."
  exit 1
fi

echo "Installing yoinks globally..."
if npm install -g yoinks; then
  echo "\nSUCCESS: yoinks has been installed!"
  echo "To get started, simply run:"
  echo "  yoinks <video-url>"
else
  echo "\nError: Global installation failed."
  echo "You may need to run this command with administrative privileges (sudo):"
  echo "  sudo npm install -g yoinks"
  exit 1
fi
