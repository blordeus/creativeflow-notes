'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import NoteList from '../components/NoteList';
import Editor from '../components/Editor';
import PythonPanel from '../components/PythonPanel';
import Modal from '../components/Modal';
import { apiFetch, getLocal, saveLocal, getTheme, saveTheme, makeLocalNote } from '../lib/notes';

export default function Home() {
  const [notes, setNotes]               = useState([]);
  const [currentNote, setCurrentNote]   = useState(null);
  const [currentView, setCurrentView]   = useState('all');
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  const [darkMode, setDarkMode]         = useState(false);
  const [pyOpen, setPyOpen]             = useState(false);
  const [modal, setModal]               = useState(null); // { title, message, onConfirm }
  const [unsaved, setUnsaved]           = useState(false);

  // Init
  useEffect(() => {
    const theme = getTheme();
    const isDark = theme === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');

    // Load localStorage immediately
    const local = getLocal();
    setNotes(local);

    // Sync backend in background
    apiFetch('/notes').then(remote => {
      if (remote && Array.isArray(remote)) {
        setNotes(remote);
        saveLocal(remote);
      }
    });
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    saveTheme(next ? 'dark' : 'light');
  };

  // Select note
  const selectNote = useCallback((id) => {
    if (unsaved && currentNote) {
      if (!confirm('You have unsaved changes. Discard them?')) return;
    }
    const note = notes.find(n => String(n.id) === String(id));
    if (note) { setCurrentNote(note); setUnsaved(false); }
  }, [notes, unsaved, currentNote]);

  // New note
  const newNote = useCallback(() => {
    const note = makeLocalNote();
    const updated = [note, ...notes];
    setNotes(updated);
    saveLocal(updated);
    setCurrentNote(note);
    setUnsaved(false);
  }, [notes]);

  // Save note
  const saveNote = useCallback(async (data) => {
    if (!currentNote) return;

    const updated = { ...currentNote, ...data, updated_at: new Date().toISOString() };
    const nextNotes = notes.map(n => String(n.id) === String(currentNote.id) ? updated : n);
    setNotes(nextNotes);
    setCurrentNote(updated);
    saveLocal(nextNotes);
    setUnsaved(false);
    showToast('Note saved ✓', 'ok');

    const isNew = String(currentNote.id).startsWith('local-');
    if (isNew) {
      const saved = await apiFetch('/notes', { method: 'POST', body: JSON.stringify(data) });
      if (saved) {
        const localId = currentNote.id;
        const synced = notes.filter(n => String(n.id) !== String(localId));
        synced.unshift(saved);
        setNotes(synced);
        setCurrentNote(saved);
        saveLocal(synced);
      }
    } else {
      const saved = await apiFetch('/notes/' + currentNote.id, { method: 'PATCH', body: JSON.stringify(data) });
      if (saved) {
        const synced = notes.map(n => n.id === saved.id ? saved : n);
        setNotes(synced);
        setCurrentNote(saved);
        saveLocal(synced);
      }
    }
  }, [currentNote, notes]);

  // Pin
  const pinNote = useCallback(async () => {
    if (!currentNote) return;
    const updated = { ...currentNote, is_pinned: !currentNote.is_pinned };
    const nextNotes = notes.map(n => String(n.id) === String(currentNote.id) ? updated : n);
    setNotes(nextNotes);
    setCurrentNote(updated);
    saveLocal(nextNotes);
    apiFetch('/notes/' + currentNote.id, { method: 'PATCH', body: JSON.stringify({ is_pinned: updated.is_pinned }) });
    showToast(updated.is_pinned ? 'Note pinned 📌' : 'Note unpinned', 'ok');
  }, [currentNote, notes]);

  // Archive
  const archiveNote = useCallback(async () => {
    if (!currentNote) return;
    const updated = { ...currentNote, is_archived: !currentNote.is_archived };
    const nextNotes = notes.map(n => String(n.id) === String(currentNote.id) ? updated : n);
    setNotes(nextNotes);
    setCurrentNote(updated);
    saveLocal(nextNotes);
    apiFetch('/notes/' + currentNote.id + '/archive', { method: 'PATCH' });
    showToast(updated.is_archived ? 'Note archived 🗃️' : 'Note restored 📤', 'ok');
  }, [currentNote, notes]);

  // Delete
  const deleteNote = useCallback(async () => {
    if (!currentNote) return;
    setModal(null);
    const deletedId = currentNote.id;
    const nextNotes = notes.filter(n => String(n.id) !== String(deletedId));
    setNotes(nextNotes);
    setCurrentNote(null);
    saveLocal(nextNotes);
    apiFetch('/notes/' + deletedId, { method: 'DELETE' });
    showToast('Note deleted', 'err');
  }, [currentNote, notes]);

  const confirmDelete = () => {
    setModal({
      title: 'Delete Note',
      message: `Are you sure you want to delete "${currentNote?.title || 'Untitled'}"? This cannot be undone.`,
      onConfirm: deleteNote,
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        notes={notes}
        currentView={currentView}
        setView={setCurrentView}
        activeTagFilter={activeTagFilter}
        setActiveTagFilter={setActiveTagFilter}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />
      <NoteList
        notes={notes}
        currentNote={currentNote}
        currentView={currentView}
        activeTagFilter={activeTagFilter}
        onSelect={selectNote}
        onNew={newNote}
      />
      <Editor
        note={currentNote}
        onSave={saveNote}
        onDelete={confirmDelete}
        onPin={pinNote}
        onArchive={archiveNote}
        onTogglePython={() => setPyOpen(p => !p)}
      />
      <PythonPanel
        open={pyOpen}
        onClose={() => setPyOpen(false)}
        currentNote={currentNote}
      />
      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}
      {/* Toast container */}
      <div id="toast-container" style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
        display: 'flex', flexDirection: 'column', gap: 8,
      }} />
      <style>{`
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    background: ${type === 'err' ? '#c0392b' : type === 'ok' ? '#3d6b4f' : '#1F1F1F'};
    color: #fff; padding: 10px 18px; border-radius: 8px; font-size: 13px;
    font-weight: 500; animation: slideIn .2s ease; font-family: DM Sans, sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,.2);
  `;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
