import React, { useState, useEffect } from 'react';
import { ParkingLot, LegendDot, Modal } from '../../components/Shared.jsx';
import { ICar } from '../../utils/icons.jsx';

const API_URL = 'http://127.0.0.1:8000/api';

export default function AdminLiveMap({ spots, setSpots }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const selectedSpot = spots.find(s => s.id === selectedId);

  useEffect(() => {
    let mounted = true;
    const fetchSensors = () => {
      fetch(`${API_URL}/sensors/`)
        .then(r => r.json())
        .then(d => { if (mounted) setSensors(d); })
        .catch(() => {});
    };
    fetchSensors();
    const i = setInterval(fetchSensors, 3000);
    return () => { mounted = false; clearInterval(i); };
  }, []);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 2500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const sensorIdForSpot = (spot) => {
    if (!spot) return null;
    const match = sensors.find(sn => sn.id === spot.sensorId) || sensors[spots.findIndex(s => s.id === spot.id)];
    return match?.id ?? null;
  };

  const apiPost = async (path, body) => {
    setBusy(true);
    try {
      const r = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      return data;
    } finally {
      setBusy(false);
    }
  };

  const forceStatus = async (newStatut) => {
    if (!selectedSpot) return;
    try {
      await apiPost('/admin/force_status/', { place_id: selectedSpot.id, statut: newStatut });
      setSpots(prev => prev.map(s => s.id === selectedSpot.id ? {
        ...s,
        status: newStatut === 'libre' ? 'free' : (newStatut === 'reservee' ? 'reserved' : 'occupied'),
        plate: newStatut === 'libre' ? null : (s.plate || 'ADMIN-OVR'),
        userName: newStatut === 'libre' ? null : (s.userName || 'Admin Override'),
      } : s));
      setFeedback({ type: 'ok', msg: `Place ${selectedSpot.label} → ${newStatut}` });
      setSelectedId(null);
    } catch (e) {
      setFeedback({ type: 'err', msg: e.message });
    }
  };

  const clearReservation = async () => {
    if (!selectedSpot) return;
    try {
      const data = await apiPost('/admin/clear_reservation/', { place_id: selectedSpot.id });
      setSpots(prev => prev.map(s => s.id === selectedSpot.id ? {
        ...s, status: 'free', plate: null, userName: null, startedAt: null, until: null,
      } : s));
      setFeedback({ type: 'ok', msg: `${data.cancelled_reservations || 0} réservation(s) annulée(s)` });
      setSelectedId(null);
    } catch (e) {
      setFeedback({ type: 'err', msg: e.message });
    }
  };

  const toggleSensor = async () => {
    if (!selectedSpot) return;
    const sid = sensorIdForSpot(selectedSpot);
    if (!sid) {
      setFeedback({ type: 'err', msg: 'Aucun capteur lié à cette place' });
      return;
    }
    try {
      const data = await apiPost('/admin/toggle_sensor/', { sensor_id: sid });
      setSpots(prev => prev.map(s => s.id === selectedSpot.id ? { ...s, online: data.statut === 'actif' } : s));
      setFeedback({ type: 'ok', msg: `Capteur ${sid} → ${data.statut}` });
      setSelectedId(null);
    } catch (e) {
      setFeedback({ type: 'err', msg: e.message });
    }
  };

  const triggerGate = async (command) => {
    try {
      await apiPost('/manual_gate/', { command });
      setFeedback({ type: 'ok', msg: `Commande ${command} envoyée` });
    } catch (e) {
      setFeedback({ type: 'err', msg: e.message });
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
              <button className="btn btn-blue" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('ENTRY_OPEN')} disabled={busy}>Ouvrir</button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('ENTRY_CLOSE')} disabled={busy}>Fermer</button>
            </div>
          </div>
          <div style={{ border: '1px solid var(--red-200)', padding: 12, borderRadius: 8, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--red-700)' }}>Porte de Sortie</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-red" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('EXIT_OPEN')} disabled={busy}>Ouvrir</button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: 8 }} onClick={() => triggerGate('EXIT_CLOSE')} disabled={busy}>Fermer</button>
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
          <ParkingLot spots={spots} selectedId={selectedId} onSelect={id => setSelectedId(id)} selectableAll />
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
                disabled={busy}
                onClick={() => forceStatus(selectedSpot.status === 'free' ? 'occupee' : 'libre')}
              >
                {selectedSpot.status === 'free' ? 'Forcer Occupation' : 'Libérer Place'}
              </button>
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={toggleSensor}
                style={{ color: selectedSpot.online ? 'var(--red-600)' : 'var(--green-600)', borderColor: selectedSpot.online ? 'var(--red-200)' : 'var(--green-200)' }}
              >
                {selectedSpot.online ? 'Désactiver Capteur' : 'Activer Capteur'}
              </button>
              {selectedSpot.status === 'reserved' && (
                <button
                  className="btn btn-red"
                  style={{ gridColumn: '1 / -1' }}
                  disabled={busy}
                  onClick={clearReservation}
                >
                  Annuler Réservation Client
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {feedback && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: feedback.type === 'err' ? 'var(--red-600)' : 'var(--ink-900)',
          color: 'white', padding: '12px 22px', borderRadius: 999, fontSize: 13, fontWeight: 700, zIndex: 9999
        }}>
          {feedback.msg}
        </div>
      )}
    </>
  );
}
