# CreativeFlow Notes

A full-stack note-taking app for creative entrepreneurs.
Built with a Next.js frontend + Python FastAPI backend.

---

## Project Structure

```
creativeflow-notes/
├── app/
│   ├── layout.js       ← root layout + metadata
│   ├── page.js         ← all state management
│   └── globals.css     ← brand tokens + fonts
├── components/
│   ├── Sidebar.jsx     ← nav, categories, tag filter, theme toggle
│   ├── NoteList.jsx    ← list panel with search
│   ├── Editor.jsx      ← title, content, tags, color, auto-save
│   ├── PythonPanel.jsx ← API/SDK/Export tabs
│   └── Modal.jsx       ← delete confirmation
├── lib/
│   └── notes.js        ← apiFetch, localStorage helpers, constants
├── backend/
│   ├── main.py         ← FastAPI routes
│   ├── models.py       ← SQLAlchemy models
│   ├── database.py     ← DB connection
│   ├── schemas.py      ← Pydantic schemas
│   └── requirements.txt
└── README.md
```

---

## Quick Start

Both the frontend and backend need to be running at the same time. Open two terminal windows.

### Terminal 1 — Python backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> ⚠️ Always run `uvicorn` from **inside** the `backend/` folder. Running it from the project root will cause a `Could not import module "main"` error because local imports (`models`, `database`) won't resolve.

### Terminal 2 — Next.js frontend

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

The app works offline via localStorage if the backend is not running.

---

## Features

- Create, edit, delete notes
- Pin important notes to top
- Archive old notes
- 6 creative entrepreneur categories: Ideas, Projects, Clients, Inspiration, Finances, Marketing
- Tag system with sidebar tag filtering
- Full-text search (title, content, tags)
- Color-coded notes (8 colors)
- Dark / Light mode
- Auto-save every 3 seconds
- Word count
- Python panel with live API examples and SDK code
- Keyboard shortcuts: Ctrl+S (save), Ctrl+N (new note)
- Fully responsive (mobile, tablet, desktop)
- Works offline (localStorage fallback)

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /notes | List notes (supports ?search=, ?tag=, ?category=, ?archived=) |
| POST | /notes | Create note |
| GET | /notes/{id} | Get single note |
| PATCH | /notes/{id} | Update note |
| DELETE | /notes/{id} | Delete note |
| PATCH | /notes/{id}/archive | Toggle archive |
| GET | /tags | All unique tags |
| GET | /categories | All categories |

API docs: http://127.0.0.1:8000/docs

---

## Known Issues & Fixes

### Nothing saves / buttons don't respond
**Cause:** A browser extension (e.g. image editors, screenshot tools) is injecting a script into your page that crashes the JavaScript runtime before `init()` runs.

**Fix:**
1. Open DevTools (F12) → Console tab
2. If you see an error referencing an unfamiliar `.js` file on load, a browser extension is the culprit
3. Go to `chrome://extensions`, disable all extensions, and hard refresh (`Ctrl+Shift+R`)
4. Re-enable extensions one at a time to identify which one is causing the conflict

### Backend not syncing (spinning / "Backend not running" message)
**Cause:** `localhost` and `127.0.0.1` can be treated as different origins by the browser, causing fetch requests to fail silently.

**Fix:** The frontend uses `http://127.0.0.1:8000` — ensure your backend is also bound to `127.0.0.1` (this is uvicorn's default). Do not change the API constant to `localhost`.

### Note list empty after refresh
**Cause (original bug — now fixed):** `loadNotes()` was async and awaited the backend before rendering. If the backend was slow or unavailable, the note list never populated.

**Fix applied:** Notes now load from localStorage immediately on init, then sync with the backend in the background. The UI is always instant regardless of backend status.

### Ctrl+S triggers browser "Save Page" dialog (Edge/Chrome)
**Cause:** Some browsers intercept `Ctrl+S` before the page's keydown listener fires.

**Fix applied:** The keydown handler now calls `e.stopPropagation()` in addition to `e.preventDefault()` to block browser interception.

---

## Error Prevention Checklist

Before running the project, verify:

- [ ] Using **Live Server** (not Five Server) to serve `index.html`
- [ ] No browser extensions active that inject scripts into local pages (Grammarly, image editors, screenshot tools are common offenders)
- [ ] Running `uvicorn` from **inside the `backend/` folder**, not the project root — local imports (`models`, `database`) will fail otherwise
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Browser window is **wider than 640px** — the note list panel is hidden below this breakpoint by design

### Debugging Tips

**Check if JavaScript is running:**
```js
// Paste in browser console
init()
```

**Check if localStorage is working:**
```js
localStorage.getItem('cf_notes')
```

**Check if the backend is reachable:**
```js
fetch('http://127.0.0.1:8000/notes').then(r => r.json()).then(console.log)
```

**Check if a note is selected:**
```js
console.log(currentNote)
```

---

## Development Notes

- The frontend falls back to localStorage automatically when the backend is unreachable — no errors are thrown
- Auto-save triggers 3 seconds after the last keystroke; a manual `Ctrl+S` or the Save button saves immediately
- New notes are assigned a `local-TIMESTAMP` ID until saved to the backend, at which point they receive a numeric ID from the database
