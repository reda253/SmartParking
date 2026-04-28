import React from 'react';
import { ICar } from '../utils/icons.jsx';

export function LegendDot({ color, bg, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--ink-600)' }}>
      <div style={{ width: 14, height: 10, borderRadius: 3, background: bg, border: `1.5px solid ${color}` }} />
      {label}
    </div>
  );
}

export function Stat({ label, value, color = 'blue' }) {
  return (
    <div className={`stat ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="card-head">
          <span className="card-title">{title}</span>
          <button className="btn btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }} onClick={onClose}>✕</button>
        </div>
        <div className="card-body">{children}</div>
        {footer && <div className="card-body" style={{ borderTop: '1px solid var(--ink-100)', padding: '16px 24px' }}>{footer}</div>}
      </div>
    </div>
  );
}

export function ParkingLot({ spots, selectedId, onSelect }) {
  const half = Math.ceil(spots.length / 2);
  const row1 = spots.slice(0, half);
  const row2 = spots.slice(half);

  return (
    <div className="lot-bg" style={{ background: 'linear-gradient(160deg, #1E293B, #334155)', borderRadius: 'var(--r-lg)', padding: 24 }}>
      <div className="lot-row" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {row1.map(spot => (
          <button
            key={spot.id}
            className="spot"
            data-status={selectedId === spot.id ? 'selected' : spot.status}
            onClick={() => onSelect && spot.status === 'free' && onSelect(spot.id)}
            title={spot.status !== 'free' && spot.plate ? `${spot.userName} · ${spot.plate}` : spot.label}
            style={{
              flex: 'none', width: 80, height: 110, borderRadius: 10, border: '2px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 800,
              borderColor: spot.status === 'free' ? '#22C55E' : (spot.status === 'reserved' ? '#F59E0B' : '#64748B'),
              background: spot.status === 'free' ? 'rgba(34,197,94,.12)' : (spot.status === 'reserved' ? 'rgba(245,158,11,.12)' : 'rgba(100,116,139,.15)'),
              color: spot.status === 'free' ? '#22C55E' : (spot.status === 'reserved' ? '#F59E0B' : '#94A3B8'),
              borderStyle: spot.status === 'free' ? 'dashed' : 'solid',
              cursor: spot.status === 'free' ? 'pointer' : 'default',
              position: 'relative'
            }}
          >
            {spot.status !== 'free' && <ICar size={28} stroke={spot.status === 'reserved' ? '#F59E0B' : '#94A3B8'} />}
            {spot.status === 'free' && <ICar size={24} stroke="#22C55E" />}
            <span className="spot-label" style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 10, opacity: 0.6 }}>{spot.label}</span>
          </button>
        ))}
      </div>
      <div className="lot-spacer" style={{ height: 28, background: 'repeating-linear-gradient(to right, #64748B 0, #64748B 12px, transparent 12px, transparent 22px)', borderRadius: 4, margin: '16px 0', opacity: 0.5 }} />
      <div className="lot-row" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {row2.map(spot => (
          <button
            key={spot.id}
            className="spot"
            data-status={selectedId === spot.id ? 'selected' : spot.status}
            onClick={() => onSelect && spot.status === 'free' && onSelect(spot.id)}
            style={{
              flex: 'none', width: 80, height: 110, borderRadius: 10, border: '2px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 800,
              borderColor: spot.status === 'free' ? '#22C55E' : (spot.status === 'reserved' ? '#F59E0B' : '#64748B'),
              background: spot.status === 'free' ? 'rgba(34,197,94,.12)' : (spot.status === 'reserved' ? 'rgba(245,158,11,.12)' : 'rgba(100,116,139,.15)'),
              color: spot.status === 'free' ? '#22C55E' : (spot.status === 'reserved' ? '#F59E0B' : '#94A3B8'),
              borderStyle: spot.status === 'free' ? 'dashed' : 'solid',
              cursor: spot.status === 'free' ? 'pointer' : 'default',
              position: 'relative'
            }}
          >
            {spot.status !== 'free' && <ICar size={28} stroke={spot.status === 'reserved' ? '#F59E0B' : '#94A3B8'} />}
            {spot.status === 'free' && <ICar size={24} stroke="#22C55E" />}
            <span className="spot-label" style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 10, opacity: 0.6 }}>{spot.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
