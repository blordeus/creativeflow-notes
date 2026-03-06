'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS, CATEGORIES } from '../lib/notes';

export default function Editor({ note, onSave, onDelete, onPin, onArchive, onTogglePython }) {
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags]       = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor]     = useState('#ffffff');
  const [unsaved, setUnsaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const autoSaveRef = useRef(null);

  // Load note into editor
  useEffect(() => {
    if (!note) return;
    setTitle(note.title || '');
    setContent(note.content || '');
    setCategory(note.category || 'General');
    setTags((note.tags || '').split(',').filter(t => t.trim()));
    setColor(note.color || '#ffffff');
    setUnsaved(false);
    setWordCount(countWords(note.content || ''));
    clearTimeout(autoSaveRef.current);
  }, [note?.id]);

  const countWords = str => (str.trim().match(/\S+/g) || []).length;

  const markUnsaved = useCallback(() => {
    setUnsaved(true);
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      handleSave();
    }, 3000);
  }, [title, content, category, tags, color]);

  const handleSave = useCallback(() => {
    if (!note) return;
    const t = title.trim();
    if (!t) { showToast('Please enter a title', 'err'); return; }
    clearTimeout(autoSaveRef.current);
    onSave({ title: t, content, category, tags: tags.join(','), color });
    setUnsaved(false);
  }, [note, title, content, category, tags, color, onSave]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  if (!note) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', textAlign: 'center', padding: 40,
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16, opacity: .5 }}>✦</div>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, marginBottom: 8, color: 'var(--text)' }}>
          Welcome to CreativeFlow
        </h2>
        <p style={{ fontSize: 13.5, maxWidth: 320 }}>
          Your notes, ideas, and projects — beautifully organized for creative entrepreneurs.
        </p>
      </div>
    );
  }

  const handleTagKey = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val && !tags.includes(val)) {
        const next = [...tags, val];
        setTags(next);
        markUnsaved();
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput) {
      setTags(tags.slice(0, -1));
      markUnsaved();
    }
  };

  const removeTag = i => {
    setTags(tags.filter((_, idx) => idx !== i));
    markUnsaved();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '12px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
      }}>
        <TbBtn primary onClick={handleSave}>💾 Save</TbBtn>
        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 2px' }} />
        <TbBtn onClick={onPin}>{note.is_pinned ? '📌 Unpin' : '📌 Pin'}</TbBtn>
        <TbBtn onClick={onArchive}>{note.is_archived ? '📤 Unarchive' : '🗃️ Archive'}</TbBtn>
        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 2px' }} />
        <TbBtn onClick={onTogglePython}>🐍 Python</TbBtn>
        <div style={{ flex: 1 }} />
        <TbBtn danger onClick={onDelete}>🗑️ Delete</TbBtn>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px 28px', gap: 12 }}>
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setUnsaved(true); markUnsaved(); }}
          placeholder="Note title…"
          style={{
            fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700,
            color: 'var(--text)', background: 'none', border: 'none', outline: 'none',
            width: '100%', borderBottom: '2px solid transparent', paddingBottom: 8,
            transition: 'border-color var(--transition)',
          }}
          onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderBottomColor = 'transparent'}
        />

        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          paddingBottom: 12, borderBottom: '1px solid var(--border)',
        }}>
          <Label>Category</Label>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); markUnsaved(); }}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 10px', fontSize: 12.5,
              color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
            }}
          >
            {CATEGORIES.map(({ key }) => <option key={key}>{key}</option>)}
          </select>

          <Label>Tags</Label>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '3px 8px', minHeight: 32, cursor: 'text',
          }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500,
                background: 'var(--accent-soft)', color: 'var(--accent)',
              }}>
                {t}
                <span
                  onClick={() => removeTag(i)}
                  style={{ cursor: 'pointer', marginLeft: 4, opacity: .6 }}
                >✕</span>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="add tag, press Enter"
              style={{
                border: 'none', outline: 'none', background: 'none',
                fontSize: 12.5, color: 'var(--text)', minWidth: 80, flex: 1, fontFamily: 'inherit',
              }}
            />
          </div>

          <Label>Color</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {COLORS.map(c => (
              <div
                key={c}
                onClick={() => { setColor(c); markUnsaved(); }}
                title={c}
                style={{
                  width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                  background: c,
                  border: color === c ? '2px solid var(--text)' : '2px solid transparent',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all var(--transition)',
                }}
              />
            ))}
          </div>
        </div>

        <textarea
          value={content}
          onChange={e => {
            setContent(e.target.value);
            setWordCount(countWords(e.target.value));
            markUnsaved();
          }}
          placeholder={'Start writing your note…\n\n💡 Tip: Use this space for ideas, client notes, project plans, or anything that sparks your creativity.'}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            resize: 'none', fontSize: 14.5, lineHeight: 1.8,
            color: 'var(--text)', padding: '4px 0', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 28px', borderTop: '1px solid var(--border)',
        fontSize: 11.5, color: 'var(--text-muted)', background: 'var(--surface2)',
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: unsaved ? 'var(--accent)' : '#3d6b4f',
        }} />
        <span>{unsaved ? 'Unsaved changes…' : 'Saved'}</span>
        <span style={{ marginLeft: 'auto' }}>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

function TbBtn({ children, onClick, primary, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
        fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all var(--transition)',
        background: primary ? 'var(--accent)' : 'none',
        color: primary ? '#fff' : danger ? 'var(--danger)' : 'var(--text-muted)',
      }}
      onMouseEnter={e => {
        if (!primary) e.currentTarget.style.background = 'var(--surface2)';
        else e.currentTarget.style.opacity = '.88';
      }}
      onMouseLeave={e => {
        if (!primary) e.currentTarget.style.background = 'none';
        else e.currentTarget.style.opacity = '1';
      }}
    >
      {children}
    </button>
  );
}

function Label({ children }) {
  return <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{children}</span>;
}

// Toast utility (simple global)
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    background: ${type === 'err' ? 'var(--danger)' : type === 'ok' ? '#3d6b4f' : 'var(--text)'};
    color: #fff; padding: 10px 18px; border-radius: 8px; font-size: 13px;
    font-weight: 500; animation: slideIn .2s ease; font-family: DM Sans, sans-serif;
  `;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
