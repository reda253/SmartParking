import React, { useState, useEffect } from 'react';
import { Stat } from '../../components/Shared.jsx';

const API_URL = 'http://127.0.0.1:8000/api';

export default function AdminOverview({ spots, CURRENCY }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchStats = () => {
      fetch(`${API_URL}/stats/`)
        .then(r => r.json())
        .then(data => { if (mounted) setStats(data); })
        .catch(e => console.error(e));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const total = stats?.total_places ?? (spots.length || 1);
  const free = stats?.free_places ?? spots.filter(s => s.status === 'free').length;
  const occupied = stats?.occupations ?? spots.filter(s => s.status === 'occupied').length;
  const reserved = stats?.reserved ?? spots.filter(s => s.status === 'reserved').length;
  const occupancy = stats?.occupancy_rate ?? Math.round(((occupied + reserved) / total) * 100);
  const revenue = stats?.revenue ?? 0;
  const revenueWeek = stats?.revenue_week ?? 0;
  const activeReservations = stats?.active_reservations ?? 0;
  const queueLength = stats?.queue_length ?? 0;

  return (
    <>
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <Stat label="Taux d'occupation" value={`${occupancy}%`} color="blue" />
        <Stat label="Places libres" value={free} color="green" />
        <Stat label="Places occupées" value={occupied} color="amber" />
        <Stat label="Revenus (semaine)" value={`${Number(revenueWeek).toFixed(2)} ${CURRENCY}`} color="green" />
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <Stat label="Réservations actives" value={activeReservations} color="blue" />
        <Stat label="File d'attente" value={queueLength} color="amber" />
        <Stat label="Revenus (total)" value={`${Number(revenue).toFixed(2)} ${CURRENCY}`} color="green" />
        <Stat label="Places réservées" value={reserved} color="amber" />
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
