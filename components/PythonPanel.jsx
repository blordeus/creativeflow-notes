'use client';
import { useState } from 'react';

const API = 'http://127.0.0.1:8000';

export default function PythonPanel({ open, onClose, currentNote }) {
  const [tab, setTab] = useState('api');
  const [apiOut, setApiOut] = useState('Click to check if the Python backend is running…');
  const [apiColor, setApiColor] = useState('#a6e3a1');
  const [exportOut, setExportOut] = useState('Select a note and click to see export preview…');

  const checkAPI = async () => {
    setApiOut('Checking…');
    try {
      const r = await fetch(API + '/notes', { signal: AbortSignal.timeout(3000) });
      const data = await r.json();
      setApiColor('#a6e3a1');
      setApiOut(`✅ Backend running!\nFound ${data.length} notes.\nEndpoints: GET/POST /notes, PATCH/DELETE /notes/{id}`);
    } catch {
      setApiColor('#f38ba8');
      setApiOut('⚠️ Backend not running.\n\nThe app still works with local storage.\nRun: uvicorn main:app --reload --port 8000\nto enable full backend sync.');
    }
  };

  const exportNote = () => {
    if (!currentNote) { setExportOut('No note selected.'); return; }
    setExportOut(`# ${currentNote.title}\n\n**Category:** ${currentNote.category}\n**Tags:** ${currentNote.tags}\n**Created:** ${currentNote.created_at}\n\n${currentNote.content || '(empty)'}\n\n---\nExported from CreativeFlow Notes`);
  };

  if (!open) return null;

  return (
    <div style={{
      width: 380, flexShrink: 0,
      borderLeft: '1px solid #313244',
      display: 'flex', flexDirection: 'column',
      background: '#1e1e2e', color: '#cdd6f4',
      height: '100vh', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #313244',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600,
      }}>
        <span style={{ color: '#a6e3a1' }}>●</span>
        Python Integration
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#cdd6f4', fontSize: 16, cursor: 'pointer', opacity: .6 }}
        >✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #313244' }}>
        {['api', 'sdk', 'export'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', fontSize: 12, background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              color: tab === t ? '#cba6f7' : '#6c7086',
              borderBottom: tab === t ? '2px solid #cba6f7' : '2px solid transparent',
            }}
          >
            {t === 'api' ? 'API Calls' : t === 'sdk' ? 'SDK Usage' : 'Export'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', fontSize: 12.5 }}>
        {tab === 'api' && (
          <>
            <PyLabel>FastAPI Backend — Quick Start</PyLabel>
            <PyCode>{`# Install dependencies\npip install fastapi uvicorn sqlalchemy\n\n# Start the server\nuvicorn main:app --reload --port 8000`}</PyCode>
            <PyLabel>Get All Notes</PyLabel>
            <PyCode>{`import requests\n\nr = requests.get("http://127.0.0.1:8000/notes")\nnotes = r.json()\nfor note in notes:\n    print(note["title"])`}</PyCode>
            <PyLabel>Create a Note</PyLabel>
            <PyCode>{`payload = {\n    "title": "My Creative Idea",\n    "content": "Details here...",\n    "category": "Ideas",\n    "tags": "launch,product"\n}\nr = requests.post(\n    "http://127.0.0.1:8000/notes",\n    json=payload\n)\nprint(r.json())`}</PyCode>
            <PyLabel>Live Endpoint Status</PyLabel>
            <button onClick={checkAPI} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#a6e3a1', color: '#1e1e2e', padding: '6px 14px',
              borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: 'none', marginTop: 10,
            }}>▶ Check Backend</button>
            <div style={{
              background: '#181825', borderRadius: 8, padding: '10px 14px',
              fontFamily: 'Fira Code, Courier New, monospace', fontSize: 12,
              color: apiColor, minHeight: 60, marginTop: 10, whiteSpace: 'pre-wrap',
            }}>{apiOut}</div>
          </>
        )}

        {tab === 'sdk' && (
          <>
            <PyLabel>notes_sdk.py — Reusable SDK</PyLabel>
            <PyCode>{`class CreativeFlowClient:\n    def __init__(self, base="http://127.0.0.1:8000"):\n        self.base = base\n        self.s = requests.Session()\n\n    def notes(self, archived=False):\n        return self.s.get(\n            f"{self.base}/notes",\n            params={"archived": archived}\n        ).json()\n\n    def create(self, **kw):\n        return self.s.post(\n            f"{self.base}/notes", json=kw\n        ).json()\n\n    def search(self, q):\n        return self.s.get(\n            f"{self.base}/notes",\n            params={"search": q}\n        ).json()\n\n# Usage\ncf = CreativeFlowClient()\ncf.create(\n    title="Q2 Launch Plan",\n    category="Projects",\n    tags="launch,marketing"\n)`}</PyCode>
          </>
        )}

        {tab === 'export' && (
          <>
            <PyLabel>Export Notes to Markdown</PyLabel>
            <PyCode>{`import requests, os\n\nnotes = requests.get(\n    "http://127.0.0.1:8000/notes"\n).json()\n\nos.makedirs("exported", exist_ok=True)\nfor note in notes:\n    fname = f"{note['id']}-{note['title'][:40]}.md"\n    with open(f"exported/{fname}", "w") as f:\n        f.write(f"# {note['title']}\\n\\n")\n        f.write(f"**Category:** {note['category']}\\n")\n        f.write(f"**Tags:** {note['tags']}\\n\\n")\n        f.write(note['content'])\nprint(f"Exported {len(notes)} notes!")`}</PyCode>
            <PyLabel>Export Current Note</PyLabel>
            <button onClick={exportNote} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#a6e3a1', color: '#1e1e2e', padding: '6px 14px',
              borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: 'none', marginTop: 10,
            }}>▶ Export Active Note</button>
            <div style={{
              background: '#181825', borderRadius: 8, padding: '10px 14px',
              fontFamily: 'Fira Code, Courier New, monospace', fontSize: 12,
              color: '#a6e3a1', minHeight: 60, marginTop: 10, whiteSpace: 'pre-wrap',
            }}>{exportOut}</div>
          </>
        )}
      </div>
    </div>
  );
}

function PyLabel({ children }) {
  return (
    <div style={{ fontSize: 11, color: '#6c7086', margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: .8 }}>
      {children}
    </div>
  );
}

function PyCode({ children }) {
  return (
    <pre style={{
      background: '#181825', borderRadius: 8, padding: '12px 14px',
      fontFamily: 'Fira Code, Courier New, monospace', fontSize: 12,
      lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowX: 'auto', color: '#cdd6f4',
    }}>
      {children}
    </pre>
  );
}
