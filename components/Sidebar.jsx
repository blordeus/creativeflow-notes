'use client';
import { CATEGORIES } from '../lib/notes';

export default function Sidebar({ notes, currentView, setView, activeTagFilter, setActiveTagFilter, darkMode, toggleTheme }) {
  const active = notes.filter(n => !n.is_archived);

  const counts = {
    all: active.length,
    pinned: active.filter(n => n.is_pinned).length,
    archived: notes.filter(n => n.is_archived).length,
  };

  CATEGORIES.forEach(({ key }) => {
    counts['cat-' + key] = active.filter(n => n.category === key).length;
  });

  const allTags = [...new Set(
    active.flatMap(n => (n.tags || '').split(',').map(t => t.trim()).filter(Boolean))
  )].sort();

  const navItems = [
    { view: 'all',      icon: '📝', label: 'All Notes',  badgeKey: 'all' },
    { view: 'pinned',   icon: '📌', label: 'Pinned',     badgeKey: 'pinned' },
    { view: 'archived', icon: '🗃️', label: 'Archive',    badgeKey: 'archived' },
  ];

  return (
    <nav style={{
      width: 'var(--sidebar-w)',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--accent)', letterSpacing: '-.3px' }}>
          ✦ CreativeFlow
        </h1>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginTop: 2 }}>
          Your creative workspace
        </span>
      </div>

      {/* Nav */}
      <div style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
        <SectionLabel>Workspace</SectionLabel>
        {navItems.map(({ view, icon, label, badgeKey }) => (
          <NavItem
            key={view}
            active={currentView === view && !activeTagFilter}
            onClick={() => { setView(view); setActiveTagFilter(null); }}
            icon={icon}
            label={label}
            badge={counts[badgeKey]}
          />
        ))}

        <SectionLabel style={{ marginTop: 12 }}>Categories</SectionLabel>
        {CATEGORIES.filter(c => c.key !== 'General').map(({ key, icon }) => (
          <NavItem
            key={key}
            active={currentView === 'cat-' + key && !activeTagFilter}
            onClick={() => { setView('cat-' + key); setActiveTagFilter(null); }}
            icon={icon}
            label={key}
            badge={counts['cat-' + key] || 0}
          />
        ))}

        {allTags.length > 0 && (
          <>
            <SectionLabel style={{ marginTop: 12 }}>Tags</SectionLabel>
            <div style={{ padding: '4px 8px 8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {allTags.map(tag => (
                <span
                  key={tag}
                  onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                  style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500,
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    cursor: 'pointer',
                    outline: activeTagFilter === tag ? '2px solid var(--accent)' : 'none',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500,
            background: 'none', border: 'none', width: '100%', fontFamily: 'inherit',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </nav>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: 1, color: 'var(--text-muted)', padding: '8px 12px 4px', ...style
    }}>
      {children}
    </div>
  );
}

function NavItem({ active, onClick, icon, label, badge }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        background: active ? 'var(--accent-soft)' : 'none',
        transition: 'all var(--transition)',
        userSelect: 'none',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
    >
      <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
      <span style={{
        marginLeft: 'auto', fontSize: 11, padding: '1px 7px', borderRadius: 99, minWidth: 22, textAlign: 'center',
        background: active ? 'var(--accent)' : 'var(--surface2)',
        color: active ? '#fff' : 'var(--text-muted)',
      }}>
        {badge}
      </span>
    </div>
  );
}
