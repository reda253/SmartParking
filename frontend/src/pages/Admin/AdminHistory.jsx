import React, { useState, useEffect } from 'react';
import { IHistory, ICheck } from '../../utils/icons.jsx';

const API_URL = 'http://127.0.0.1:8000/api';

export default function AdminHistory({ CURRENCY }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchReservations = async () => {
      try {
        const r = await fetch(`${API_URL}/reservations/`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (mounted) {
          setReservations(data.sort((a, b) => new Date(b.debut) - new Date(a.debut)));
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    fetchReservations();
    const interval = setInterval(fetchReservations, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };
  const formatTimeRange = (debut, fin) => {
    if (!debut || !fin) return '—';
    try {
      const d = new Date(debut), f = new Date(fin);
      const t = (x) => x.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const ms = f - d;
      const h = ms / 3600000;
      const dur = h >= 1 ? `${h.toFixed(h % 1 === 0 ? 0 : 1)}h` : `${Math.round(ms / 60000)}min`;
      return { range: `${t(d)} - ${t(f)}`, duration: dur };
    } catch { return { range: '—', duration: '—' }; }
  };

  const exportCsv = () => {
    const header = ['ID', 'Date', 'Heure', 'Client', 'Email', 'Place', 'Montant', 'Statut'];
    const rows = reservations.map(r => {
      const t = formatTimeRange(r.debut, r.fin);
      return [r.id, formatDate(r.debut), t.range, r.user_name || '', r.user_email || '', `A${String((r.place_numero ?? 0) % 100).padStart(2, '0')}`, r.montant || 0, r.statut];
    });
    const csv = [header, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reservations_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statutBadge = (s) => {
    if (s === 'active') return <span className="badge" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}>Active</span>;
    if (s === 'expiree') return <span className="badge" style={{ background: 'var(--green-50)', color: 'var(--green-700)' }}><ICheck size={12} style={{ marginRight: 4 }} />Terminée</span>;
    if (s === 'annulee') return <span className="badge" style={{ background: 'var(--red-50)', color: 'var(--red-700)' }}>Annulée</span>;
    return <span className="badge badge-gray">{s}</span>;
  };

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Historique global des réservations</span>
        <button className="btn btn-ghost" style={{ height: 36, fontSize: 13, padding: '0 16px' }} onClick={exportCsv}>
          <IHistory size={16} style={{ marginRight: 8 }} />
          Exporter CSV
        </button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)' }}>Chargement de l'historique...</div>}
        {error && !loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--red-600)' }}>Erreur: {error}</div>}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Heure</th>
                <th>Client</th>
                <th>Place</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => {
                const t = formatTimeRange(r.debut, r.fin);
                const placeLabel = r.place_numero != null ? `A${String(r.place_numero % 100).padStart(2, '0')}` : `#${r.place_id}`;
                const amount = Number(r.montant || 0);
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--ink-500)' }}>#R{String(r.id).padStart(4, '0')}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{formatDate(r.debut)}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{t.range} ({t.duration})</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.user_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{r.user_email || ''}</div>
                    </td>
                    <td><span style={{ fontWeight: 800 }}>{placeLabel}</span></td>
                    <td style={{ fontWeight: 800, color: 'var(--ink-900)' }}>{amount.toFixed(2)} {CURRENCY}</td>
                    <td>{statutBadge(r.statut)}</td>
                  </tr>
                );
              })}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)' }}>
                    Aucune réservation enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
