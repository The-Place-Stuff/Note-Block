:: Fires both deploy-commands and start, just in case any changes are made to the voices.json file
@echo off
npm run launch || (
    echo Note Block crashed!
    PAUSE
)