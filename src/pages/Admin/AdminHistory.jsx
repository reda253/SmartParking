import React from 'react';
import { IHistory, ICheck } from '../../utils/icons.jsx';

export default function AdminHistory({ CURRENCY }) {
  const history = [
    { id: 'R1004', date: '28 Avril 2026', time: '14:30 - 16:30', user: 'Omar B.', plate: 'PW-9920', spot: 'A02', duration: '2h', amount: 10, status: 'completed' },
    { id: 'R1003', date: '28 Avril 2026', time: '10:15 - 11:15', user: 'Sara M.', plate: 'KX-2310', spot: 'A04', duration: '1h', amount: 5, status: 'completed' },
    { id: 'R1002', date: '27 Avril 2026', time: '18:00 - 19:30', user: 'Yassine K.', plate: 'AL-4821', spot: 'A01', duration: '1.5h', amount: 7.5, status: 'completed' },
    { id: 'R1001', date: '27 Avril 2026', time: '09:00 - 10:00', user: 'Lina T.', plate: 'BM-6611', spot: 'A03', duration: '1h', amount: 5, status: 'cancelled' },
    { id: 'R1000', date: '26 Avril 2026', time: '14:00 - 18:00', user: 'Mehdi A.', plate: 'NS-8844', spot: 'A02', duration: '4h', amount: 20, status: 'completed' },
  ];

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Historique global des réservations</span>
        <button className="btn btn-ghost" style={{ height: 36, fontSize: 13, padding: '0 16px' }}>
          <IHistory size={16} style={{ marginRight: 8 }} />
          Exporter CSV
        </button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date & Heure</th>
              <th>Client</th>
              <th>Plaque</th>
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
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{item.time} ({item.duration})</div>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{item.user}</div>
                </td>
                <td>
                  <div className="badge badge-gray" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{item.plate}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 800 }}>{item.spot}</span>
                </td>
                <td style={{ fontWeight: 800, color: 'var(--ink-900)' }}>
                  {item.amount.toFixed(2)} {CURRENCY}
                </td>
                <td>
                  {item.status === 'completed' ? (
                    <span className="badge" style={{ background: 'var(--green-50)', color: 'var(--green-700)' }}>
                      <ICheck size={12} style={{ marginRight: 4 }} />
                      Terminée
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
      </div>
    </div>
  );
}
