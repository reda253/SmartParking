import React, { useState, useEffect } from 'react';
import { IHistory, ICheck } from '../../utils/icons.jsx';

export default function UserHistory({ user, CURRENCY }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/reservations/?utilisateur_id=${user.id || 1}`);
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        
        const mapped = data.map(r => ({
          id: r.id,
          date: new Date(r.debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          time: `${new Date(r.debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${r.fin ? new Date(r.fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '...'}`,
          spot: `A${String(r.place_id % 100).padStart(2, '0')}`,
          amount: parseFloat(r.montant) || 0,
          status: r.statut
        }));
        // Sort descending by ID so newest is first
        setHistory(mapped.sort((a,b) => b.id - a.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-500)' }}>Chargement de l'historique...</div>;
  }

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Mes réservations passées</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {history.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-500)' }}>
            Aucun historique trouvé.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Heure</th>
                <th>Place</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: 'var(--ink-500)' }}>#{item.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{item.date}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.time}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800 }}>{item.spot}</span>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--ink-900)' }}>
                    {item.status === 'annulee' ? '-' : `${item.amount.toFixed(2)} ${CURRENCY}`}
                  </td>
                  <td>
                    {item.status === 'expiree' || item.status === 'completed' ? (
                      <span className="badge" style={{ background: 'var(--green-50)', color: 'var(--green-700)' }}>
                        <ICheck size={12} style={{ marginRight: 4 }} />
                        Terminée
                      </span>
                    ) : item.status === 'active' ? (
                        <span className="badge" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}>
                        En cours
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--red-50)', color: 'var(--red-700)' }}>
                        Annulée
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
