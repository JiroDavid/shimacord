<div align="center">
  <img src="resources/icon.png" alt="Shimacord" width="160" height="160"/>

  <h1>Shimacord</h1>
  <p><strong>Decide what your Discord profile says you are doing - any game, or your own message</strong></p>

  [![Electron](https://img.shields.io/badge/Electron-41-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
  [![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=flat-square&logo=windows&logoColor=white)](#installation)
  [![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

</div>

---

Shimacord is a small desktop app for customising your Discord Rich Presence. Show any game from Discord's public list, or write a fully custom message with your own image, save it as a look, and switch between looks in one click. Everything stays on your machine.

## Features

- **Any game** - search Discord's detectable games and show one as your activity
- **Custom messages** - your own details and state lines, shown under the Shimacord name
- **Saved looks** - create, edit, duplicate, delete and switch looks with one click
- **Live preview** - see the activity card update as you type
- **Go live and Stop** - one button, with a clear "Discord not found" state that reconnects when Discord returns
- **Tray control** - closing the window keeps Shimacord in the tray, where you can switch looks or stop
- **Local and private** - no accounts, no telemetry, no network calls except the games list and Discord itself

## Installation

Build the Windows installer on a Windows machine with Node 20+:

```bash
git clone https://github.com/JiroDavid/shimacord.git
cd shimacord
npm install
npm run dist
```

Run the installer in `release/`. Discord must be open on the same machine.

## Discord setup

Custom looks run under Shimacord's own Discord application. This is a one-time step for whoever builds the installer; people who just install the app need nothing. For CI builds, add `SHIMACORD_APP_ID` as a repository variable in GitHub.

1. Open the [Discord developer portal](https://discord.com/developers/applications) and create an application named `Shimacord`.
2. Copy its Application ID.
3. Put it in a `.env` file in the project root as `SHIMACORD_APP_ID=<your id>` (or set it in your environment) before running or building.

Game looks use the real game's application ID and need no setup.

## Development

```bash
npm run dev
npm test
npm run typecheck
```

## License

MIT
