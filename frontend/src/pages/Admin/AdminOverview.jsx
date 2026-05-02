import React, { useState, useEffect } from 'react';
import { Stat, LegendDot, ParkingLot } from '../../components/Shared.jsx';

export default function AdminOverview({ spots, CURRENCY }) {
  const total = spots.length || 1;
  const free = spots.filter(s => s.status === 'free').length;
  const occupied = spots.filter(s => s.status === 'occupied').length;
  const reserved = spots.filter(s => s.status === 'reserved').length;
  const occupancy = Math.round(((occupied + reserved) / total) * 100);
  
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stats/')
      .then(r => r.json())
      .then(data => setRevenue(data.revenue || 0))
      .catch(e => console.error(e));
  }, []);

  return (
    <>
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <Stat label="Taux d'occupation" value={`${occupancy}%`} color="blue" />
        <Stat label="Places libres" value={free} color="green" />
        <Stat label="Places occupées" value={occupied} color="amber" />
        <Stat label="Revenus (semaine)" value={`${revenue} ${CURRENCY}`} color="green" />
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Synthèse du parking</span>
        </div>
        <div className="card-body">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <span>Occupation globale</span>
            <span style={{ fontWeight: 800 }}>{occupancy}%</span>
          </div>
          <div className="progress" style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--blue-600)', width: `${occupancy}%`, transition: 'width .4s' }} />
          </div>
          <div className="row-between" style={{ marginTop: 20 }}>
            <div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Libres</div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-600)' }}>{free}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Occupées</div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber-600)' }}>{occupied}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Réservées</div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue-600)' }}>{reserved}</div></div>
          </div>
        </div>
      </div>
    </>
  );
}
