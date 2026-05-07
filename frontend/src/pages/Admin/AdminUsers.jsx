import React, { useState, useEffect } from 'react';
import { IClock } from '../../utils/icons.jsx';

const API_URL = 'http://127.0.0.1:8000/api';

export default function AdminUsers({ spots }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        const r = await fetch(`${API_URL}/users/`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (mounted) {
          setUsers(data);
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
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Gestion des Utilisateurs</span>
        <button className="btn btn-blue" style={{ height: 36, fontSize: 13, padding: '0 16px' }}>+ Nouvel Utilisateur</button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)' }}>Chargement des utilisateurs...</div>}
        {error && !loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--red-600)' }}>Erreur: {error}</div>}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Inscription</th>
                <th>Statut Actuel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const displayName = u.name || u.username || u.email;
                const spot = spots.find(s => s.userName === displayName);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{(displayName || '?').charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{displayName}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{u.email || u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="badge badge-gray" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        {u.telephone || '—'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Client'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ink-600)' }}>{formatDate(u.date_joined)}</td>
                    <td>
                      {spot ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: spot.status === 'reserved' ? 'var(--amber-600)' : 'var(--ink-700)' }}>
                          <IClock size={14} />
                          Place {spot.label} ({spot.status === 'reserved' ? 'Réservée' : 'Occupée'})
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost" style={{ height: 32, padding: '0 12px', fontSize: 12 }}>Modifier</button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)' }}>
                    Aucun utilisateur enregistré.
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
