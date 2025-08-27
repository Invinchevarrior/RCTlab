## RCTlab - Complete Guide

A comprehensive guide to RCTlab: features, setup, configuration, usage, troubleshooting, and advanced chat capabilities.

## Overview

RCTlab is a React-based coding platform for learning and practicing programming problems. It includes a built-in editor, problem sets, code execution via Judge0, a mobile emulator, and an AI Chat assistant with rich UI/UX features.

## Features

- **Code Editor**: Syntax highlighting, integrated editor, and code execution
- **Problem Sets**: Curated challenges with details and status tracking
- **Code Execution**: Judge0 integration (submit and poll results)
- **AI Chat Assistant**: Draggable, resizable, markdown-rendered chat with code extraction and copy buttons
- **Mobile Emulator**: Preview and interact with mobile layouts
- **Authentication**: Register/Login with JWT
- **Progress Tracking**: Track solved and attempted problems

## Tech Stack

### Frontend
- React 16.x, React Router DOM
- Axios
- CodeMirror/Prism.js for editing and highlighting
- Webpack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication, bcrypt hashing

## Project Structure

```
RCTlab/
├─ src/                # Frontend
│  ├─ components/      # UI components (Editor, CodeRunner, Chat, Emulator)
│  ├─ hooks/           # Custom hooks (code execution, local storage)
│  ├─ utils/           # API clients (api.js, judge0.js)
│  └─ index.js
├─ server/             # Backend API
│  ├─ models/          # Mongoose models
│  ├─ routes/          # auth, problems
│  ├─ scripts/         # data import utilities
│  └─ index.js         # Express entry
├─ public/             # Static assets
└─ package.json        # Root frontend package
```

## Getting Started

### Prerequisites
- Node.js v14+ (recommended LTS)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1) Clone the repository
```bash
git clone [<repository-url>](https://github.com/Invinchevarrior/RCTlab.git)
cd RCTlab
```

2) Install dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

3) Configure environment
- Backend MongoDB URL: edit `server/index.js` to set the MongoDB connection string
- Backend JWT secret: set in `server/routes/auth.js` (or via env variable if supported)
- Judge0 API (frontend): configure `src/utils/judge0.js` via Vite env vars:
  - `VITE_JUDGE0_URL`
  - `VITE_JUDGE0_HOST` (if using RapidAPI)
  - `VITE_RAPIDAPI_KEY` (if using RapidAPI)

4) Start the application
```bash
# Backend (from server/)
npm start

# Frontend (from project root)
cd ..
npm start
```

5) Access
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Backend API Summary

### Authentication
- POST `/api/auth/register` — create user
- POST `/api/auth/login` — login, returns JWT

### Problems
- GET `/api/problems` — list problems
- GET `/api/problems/:id` — problem detail
- POST `/api/problems/status` — update status

## Judge0 Integration (Code Execution)

- Client: `src/utils/judge0.js`
- Submit code: `submitCode(source, languageId, stdin)` → returns token
- Poll result: `getResult(token)` → returns decoded stdout/stderr, time, memory, status
- Requires Vite env vars (`VITE_*`) at build time

Tips:
- Language IDs follow Judge0 mapping.
- Base64 encoding is used for payloads; helper handles encode/decode.

## AI Chat - Capabilities and UI

### General Chat Mode
- Natural multi-language conversation (English/Chinese)
- Code generation and extraction for HTML/CSS/JS blocks
- Clear separation of text and code, modern UI design

### Draggable Global Chat Window
- Move anywhere by dragging the header
- Works across all pages (Editor, Code Runner, Mobile Emulator)
- Global toggle via a single "AI Chat" button, state synchronized

### Window Controls
- Minimize, restore, close
- Position/size remembered across minimize/restore
- Single component instance to avoid state duplication

### Resizing
- Resize from the bottom-right handle
- Constraints: min/max width/height
- Smooth feedback during resize

### Markdown Rendering
- Headings (#, ##, ###) → h1/h2/h3
- Bold/italic, inline code, links, lists, separators
- Smart paragraph and line-break handling

### Markdown Tables
- Detects and converts markdown tables to responsive HTML tables
- Horizontal scroll on small widths, professional styling

### Copy and Selection
- Copy entire message or individual code blocks with buttons
- Text selection enabled (contentEditable) for partial copy

### Input Box Optimization
- Multi-line input, Shift+Enter for newline, Enter to send
- Auto-height with min/max limits and styled scrollbars
- Preserves pasted code formatting (indentation/line breaks)

### Auto Scroll
- Automatically scroll to the latest message on update

### Visual Design Highlights
- Distinct message bubbles (user vs AI)
- Inline-code background, headline borders
- Accessible sizes for desktop and mobile

## AI Chat Configuration

- API key location (if applicable to your setup): `src/components/Chat.js` (set your provider key)
- Example provider (from docs): Hugging Face Inference Router
- Models: can be configured to your provider (e.g., Llama, GPT, DialoGPT)

Notes:
- Keep keys in environment variables for production.
- Ensure HTTPS context for Clipboard API copy buttons.

## Windows Utilities

The repository includes helper batch scripts:
- `start_frontend.bat` — start frontend dev server
- `configure_firewall.bat`, `fix_firewall.bat` — network/firewall helpers
- `mobile_access_test.bat`, `network_test.bat` — connectivity tests

Run these from Windows PowerShell or Command Prompt as needed.

## Usage Guide

### Problems and Editor
1. Navigate to Problems, open a problem
2. Read details in `ProblemDetail`
3. Write code in the Editor or Code Runner
4. Execute via Judge0, inspect stdout/stderr

### AI Chat
1. Click the "AI Chat" button to open the chat window
2. Ask questions or request code snippets
3. Drag to reposition; use the handle to resize
4. Copy code or text as needed; minimize/restore to keep context

### Mobile Emulator
1. Open the Mobile Emulator page
2. Preview and test mobile-oriented UI

## Troubleshooting

- **API call failures (Chat)**: verify API key and model availability
- **Judge0 errors**: ensure Vite env variables are set; validate URL/host/key
- **Markdown not rendering**: confirm formatter is applied and HTML injected via `dangerouslySetInnerHTML`
- **Input box truncates text**: check auto-height handlers and CSS (min/max height, overflow)
- **Chat window cannot move/resize**: ensure single instance usage and current state (position/size) drive rendering
- **Minimize loses state**: confirm saved position/size are restored on unminimize and instance is unique
- **Copy buttons not working**: Clipboard API requires secure context (HTTPS) or user gesture

## Development Guidelines

- Prefer functional React components with hooks
- Consistent error handling and UX feedback
- Keep chat state single-sourced; avoid duplicated local vs prop state
- Use `useEffect` for state sync and cleanup (timers, listeners)

## Deployment

### Frontend
- Build: `npm run build`
- Host on static platforms (e.g., Netlify, Vercel)

### Backend
- Set production env vars (MongoDB URI, JWT secret, CORS origins)
- Use a process manager (PM2) and managed MongoDB (e.g., Atlas)

## Security Notes

- Store API keys in environment variables
- Enable CORS only for trusted origins
- Hash passwords (bcrypt) and sign JWT securely

## Changelog Highlights (Chat)

- General chat mode and UI overhaul
- Markdown rendering and table support
- Code block visual differentiation (HTML/CSS/JS)
- Input auto-height and copy controls
- Draggable/resizable window, minimize/restore fixes
- State persistence across minimize/restore

## FAQ

- Q: Where do I set the Judge0 API endpoint?
  A: In Vite env vars consumed by `src/utils/judge0.js` (`VITE_JUDGE0_URL`, etc.).

- Q: My chat window reopens without previous messages.
  A: Ensure you minimize (not close). Closing clears messages by design.

- Q: Copy buttons do nothing.
  A: Use a secure context (HTTPS) or run locally with browser permissions.

## License

GPL-3.0 license.

## Support

Open an issue or contact the maintainers.



