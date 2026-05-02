import React, { useState, useEffect } from 'react';

export default function AdminSensors() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sensors from backend
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/sensors/');
        const data = await response.json();
        setSensors(data);
        setLoading(false);
      } catch (e) {
        console.error('Failed to fetch sensors', e);
        setLoading(false);
      }
    };
    
    fetchSensors();
    const interval = setInterval(fetchSensors, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement des états des capteurs...</div>;

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>État des Capteurs (Hardware)</h2>
        <p style={{ color: 'var(--ink-500)', fontSize: 13, marginTop: 4 }}>
          Surveillez l'état physique de l'Arduino et détectez les défaillances.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink-100)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--ink-500)' }}>ID Capteur</th>
              <th style={{ padding: '12px 16px', color: 'var(--ink-500)' }}>Statut Système</th>
              <th style={{ padding: '12px 16px', color: 'var(--ink-500)' }}>Valeur Détectée</th>
              <th style={{ padding: '12px 16px', color: 'var(--ink-500)' }}>Dernière Lecture</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map(sensor => (
              <tr key={sensor.id} style={{ borderBottom: '1px solid var(--ink-50)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>C-{sensor.id}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${sensor.statut === 'actif' ? 'badge-green' : 'badge-red'}`}>
                    {sensor.statut.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {sensor.valeur ? (
                    <span style={{ color: 'var(--red-600)', fontWeight: 600 }}>OBSTACLE (Occupé)</span>
                  ) : (
                    <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>VIDE (Libre)</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-500)' }}>
                  {new Date(sensor.derniere_lecture).toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
            {sensors.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)' }}>
                  Aucun capteur enregistré ou Arduino déconnecté.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
