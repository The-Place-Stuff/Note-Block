@echo off
npm run deploy-commands || (
    echo Failed to build commands!
    PAUSE
)