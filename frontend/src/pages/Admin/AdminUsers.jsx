import React from 'react';
import { IUser, IClock } from '../../utils/icons.jsx';

export default function AdminUsers({ spots }) {
  const users = [
    { id: 1, name: 'Yassine K.', email: 'yassine@example.com', role: 'user', plate: 'AL-4821', registered: '12 Avril 2026' },
    { id: 2, name: 'Sara M.', email: 'sara@example.com', role: 'user', plate: 'KX-2310', registered: '14 Avril 2026' },
    { id: 3, name: 'Admin User', email: 'admin@parksense.com', role: 'admin', plate: 'XX-0000', registered: '1 Janvier 2026' },
    { id: 4, name: 'Omar B.', email: 'omar.b@example.com', role: 'user', plate: 'PW-9920', registered: '20 Avril 2026' }
  ];

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Gestion des Utilisateurs</span>
        <button className="btn btn-blue" style={{ height: 36, fontSize: 13, padding: '0 16px' }}>+ Nouvel Utilisateur</button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Plaque</th>
              <th>Rôle</th>
              <th>Statut Actuel</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const spot = spots.find(s => s.userName === u.name);
              return (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{u.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-gray" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{u.plate}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Client'}
                    </span>
                  </td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
