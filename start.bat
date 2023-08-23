@echo off
npm run launch || (
    echo Note Block crashed!
    PAUSE
)