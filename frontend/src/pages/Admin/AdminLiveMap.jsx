import React, { useState } from 'react';
import { ParkingLot, LegendDot, Modal } from '../../components/Shared.jsx';
import { IAlertTriangle, ICheck, ICog, ICar } from '../../utils/icons.jsx';

export default function AdminLiveMap({ spots, setSpots }) {
  const [selectedId, setSelectedId] = useState(null);
  const selectedSpot = spots.find(s => s.id === selectedId);

  const toggleStatus = () => {
    setSpots(prev => prev.map(s => {
      if (s.id === selectedId) {
        return {
          ...s,
          status: s.status === 'free' ? 'occupied' : 'free',
          plate: s.status === 'free' ? 'ADMIN-OVR' : null,
          userName: s.status === 'free' ? 'Admin Override' : null
        };
      }
      return s;
    }));
    setSelectedId(null);
  };

  const toggleSensor = () => {
    setSpots(prev => prev.map(s => {
      if (s.id === selectedId) {
        return { ...s, online: !s.online };
      }
      return s;
    }));
    setSelectedId(null);
  };

  const clearReservation = () => {
    setSpots(prev => prev.map(s => {
      if (s.id === selectedId) {
        return { ...s, status: 'free', plate: null, userName: null, startedAt: null, until: null };
      }
      return s;
    }));
    setSelectedId(null);
  };

  const triggerGate = async (command) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/manual_gate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      if (!response.ok) alert('Erreur serveur: Arduino hors ligne ?');
    } catch (e) {
      alert("Erreur de connexion au backend.");
    }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 24, padding: 20, background: 'var(--ink-50)', borderRadius: 'var(--r-md)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--ink-600)' }}>
          🕹️ Télécommande Barrières (Arduino Override)
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ border: '1px solid var(--blue-200)', padding: 12, borderRadius: 8, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--blue-700)' }}>Porte d'Entrée</div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn btn-blue" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('ENTRY_OPEN')}>Ouvrir</button>
               <button className="btn btn-secondary" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('ENTRY_CLOSE')}>Fermer</button>
            </div>
          </div>
          <div style={{ border: '1px solid var(--red-200)', padding: 12, borderRadius: 8, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--red-700)' }}>Porte de Sortie</div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button className="btn btn-red" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('EXIT_OPEN')}>Ouvrir</button>
               <button className="btn btn-secondary" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('EXIT_CLOSE')}>Fermer</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-title">Carte en direct - Contrôle Administrateur</span>
          <div className="row" style={{ gap: 12 }}>
            <LegendDot color="#22C55E" bg="rgba(34,197,94,.12)" label="Libre" />
            <LegendDot color="#64748B" bg="rgba(100,116,139,.15)" label="Occupée" />
            <LegendDot color="#F59E0B" bg="rgba(245,158,11,.12)" label="Réservée" />
          </div>
        </div>
        <div className="card-body">
          <ParkingLot spots={spots} selectedId={selectedId} onSelect={id => setSelectedId(id)} />
        </div>
      </div>

      {selectedSpot && (
        <Modal title={`Gestion de la place ${selectedSpot.label}`} onClose={() => setSelectedId(null)}>
          <div style={{ paddingBottom: 20 }}>
            <div className="row-between" style={{ background: 'var(--ink-50)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>Statut actuel</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: selectedSpot.status === 'free' ? 'var(--green-600)' : (selectedSpot.status === 'reserved' ? 'var(--amber-600)' : 'var(--ink-700)') }}>
                  {selectedSpot.status === 'free' ? 'Libre' : (selectedSpot.status === 'reserved' ? 'Réservée' : 'Occupée')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>Capteur Arduino</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedSpot.online ? 'var(--green-600)' : 'var(--red-600)' }}>
                  {selectedSpot.online ? 'En ligne' : 'Hors-ligne'}
                </div>
              </div>
            </div>

            {selectedSpot.status !== 'free' && selectedSpot.userName && (
              <div style={{ border: '1px solid var(--ink-200)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 8 }}>Informations du véhicule</div>
                <div className="row">
                  <ICar size={18} color="var(--ink-400)" />
                  <span style={{ fontWeight: 700 }}>{selectedSpot.plate || 'Inconnu'}</span>
                  <span style={{ color: 'var(--ink-400)', margin: '0 8px' }}>•</span>
                  <span style={{ fontWeight: 600 }}>{selectedSpot.userName}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              <button
                className="btn btn-secondary"
                onClick={toggleStatus}
              >
                {selectedSpot.status === 'free' ? 'Forcer Occupation' : 'Libérer Place'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={toggleSensor}
                style={{ color: selectedSpot.online ? 'var(--red-600)' : 'var(--green-600)', borderColor: selectedSpot.online ? 'var(--red-200)' : 'var(--green-200)' }}
              >
                {selectedSpot.online ? 'Désactiver Capteur' : 'Activer Capteur'}
              </button>
              {selectedSpot.status === 'reserved' && (
                <button
                  className="btn btn-red"
                  style={{ gridColumn: '1 / -1' }}
                  onClick={clearReservation}
                >
                  Annuler Réservation Client
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
