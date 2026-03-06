const API = 'http://127.0.0.1:8000';

export async function apiFetch(path, opts = {}) {
  try {
    const r = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
      ...opts,
    });
    if (!r.ok) throw new Error(await r.text());
    if (r.status === 204) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export function getLocal() {
  try { return JSON.parse(localStorage.getItem('cf_notes') || '[]'); } catch { return []; }
}

export function saveLocal(notes) {
  try { localStorage.setItem('cf_notes', JSON.stringify(notes)); } catch {}
}

export function getTheme() {
  try { return localStorage.getItem('cf_theme') || 'light'; } catch { return 'light'; }
}

export function saveTheme(theme) {
  try { localStorage.setItem('cf_theme', theme); } catch {}
}

export function makeLocalNote() {
  return {
    id: 'local-' + Date.now(),
    title: '',
    content: '',
    tags: '',
    category: 'General',
    color: '#ffffff',
    is_pinned: false,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const COLORS = [
  '#ffffff', '#fdf0e8', '#e8f4ec', '#e8f0fd',
  '#fdf5e8', '#fde8f0', '#e8fdf5', '#f5e8fd',
];

export const CATEGORIES = [
  { key: 'Ideas',       icon: '💡' },
  { key: 'Projects',    icon: '🚀' },
  { key: 'Clients',     icon: '🤝' },
  { key: 'Inspiration', icon: '🎨' },
  { key: 'Finances',    icon: '💰' },
  { key: 'Marketing',   icon: '📣' },
  { key: 'General',     icon: '📝' },
];
