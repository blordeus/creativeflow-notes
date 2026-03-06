'use client';
import { useState } from 'react';

export default function NoteList({ notes, currentNote, currentView, activeTagFilter, onSelect, onNew }) {
  const [search, setSearch] = useState('');

  const viewTitles = {
    all: 'All Notes', pinned: 'Pinned Notes', archived: 'Archived',
    'cat-Ideas': '💡 Ideas', 'cat-Projects': '🚀 Projects', 'cat-Clients': '🤝 Clients',
    'cat-Inspiration': '🎨 Inspiration', 'cat-Finances': '💰 Finances', 'cat-Marketing': '📣 Marketing',
  };

  let visible = [...notes];
  if (currentView === 'all') visible = visible.filter(n => !n.is_archived);
  else if (currentView === 'pinned') visible = visible.filter(n => n.is_pinned && !n.is_archived);
  else if (currentView === 'archived') visible = visible.filter(n => n.is_archived);
  else if (currentView.startsWith('cat-')) visible = visible.filter(n => n.category === currentView.slice(4) && !n.is_archived);

  if (activeTagFilter) {
    visible = visible.filter(n =>
      (n.tags || '').split(',').map(t => t.trim()).includes(activeTagFilter)
    );
  }

  if (search) {
    const q = search.toLowerCase();
    visible = visible.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q) ||
      (n.tags || '').toLowerCase().includes(q)
    );
  }

  visible.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

  return (
    <div style={{
      width: 'var(--panel-w)', flexShrink: 0,
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', height: '100vh', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
          {activeTagFilter ? `#${activeTagFilter}` : (viewTitles[currentView] || currentView)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {visible.length} note{visible.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '7px 12px',
        margin: '10px 16px 12px',
      }}>
        <span>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
          }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div>No notes here yet.<br />Create one to get started!</div>
          </div>
        ) : (
          visible.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              selected={currentNote && String(currentNote.id) === String(note.id)}
              onClick={() => onSelect(note.id)}
            />
          ))
        )}
      </div>

      {/* New Note button */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onNew}
          style={{
            width: '100%', padding: '9px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)', color: '#fff', border: 'none',
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}
        >
          + New Note
        </button>
      </div>
    </div>
  );
}

function NoteCard({ note, selected, onClick }) {
  const tags = (note.tags || '').split(',').filter(t => t.trim()).slice(0, 3);
  const date = new Date(note.updated_at || note.created_at || Date.now())
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px', borderRadius: 'var(--radius)',
        cursor: 'pointer', marginBottom: 4,
        border: `2px solid ${selected ? 'var(--accent)' : 'transparent'}`,
        background: selected ? 'var(--accent-soft)' : 'var(--bg)',
        transition: 'all var(--transition)',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--surface2)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'var(--bg)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', flex: 1, lineHeight: 1.4 }}>
          {note.title || 'Untitled'}
        </span>
        {note.is_pinned && <span title="Pinned">📌</span>}
      </div>
      <div style={{
        fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {(note.content || '').substring(0, 120)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <Chip style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{note.category || 'General'}</Chip>
        {tags.map(t => (
          <Chip key={t} style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>{t.trim()}</Chip>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{date}</span>
      </div>
    </div>
  );
}

function Chip({ children, style }) {
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500, ...style }}>
      {children}
    </span>
  );
}
