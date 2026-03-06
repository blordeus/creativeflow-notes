'use client';

export default function Modal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)', padding: 28, width: 400, maxWidth: '90vw',
      }}>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, marginBottom: 8, color: 'var(--text)' }}>
          {title}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius-sm)', fontSize: 13.5,
              fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
              background: 'var(--surface2)', color: 'var(--text)',
            }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius-sm)', fontSize: 13.5,
              fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
              background: 'var(--danger)', color: '#fff',
            }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}
