@echo off
npm run start || (
    echo Note Block crashed!
    PAUSE
)