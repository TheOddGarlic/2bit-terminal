# 2Bit Terminal
`npm i && node .`\
You can also add it to your Windows Terminal (new one) settings.\
And it will appear here:\
![image not found](images/a.PNG) \
Example Windows Terminal Settings: \
```json
{
    "$schema": "https://aka.ms/terminal-profiles-schema",

    "defaultProfile": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",

    "copyOnSelect": false,

    "copyFormatting": false,

    "profiles": {
        "defaults": {
        },
        "list": [{
                "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
                "name": "Windows PowerShell",
                "commandline": "powershell.exe",
                "hidden": false
            },
            {
                "guid": "{0caaadad-2569-5f56-a8ff-afceeeaa6101}",
                "name": "2 Bit Chat",
                "commandline": "node D:\\path\\to\\index.js",
                "hidden": false
            },

            {
                "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
                "name": "Command Prompt",
                "commandline": "cmd.exe",
                "hidden": false
            },
            {
                "guid": "{b453ae62-4e3d-5e58-b989-0a998ec441b8}",
                "hidden": true,
                "name": "Azure Cloud Shell",
                "source": "Windows.Terminal.Azure"
            }
        ]
    },

    "schemes": [],

    "keybindings": [
        {
            "command": {
                "action": "copy",
                "singleLine": false
            },
            "keys": "ctrl+c"
        },
        {
            "command": "paste",
            "keys": "ctrl+v"
        },

        {
            "command": "find",
            "keys": "ctrl+shift+f"
        },

        {
            "command": {
                "action": "splitPane",
                "split": "vertical",
                "splitMode": "duplicate"
            },
            "keys": "alt+shift+v"
        },
        {
            "command": {
                "action": "splitPane",
                "split": "horizontal",
                "splitMode": "duplicate"
            },
            "keys": "alt+shift+h"
        }
    ]
}
```