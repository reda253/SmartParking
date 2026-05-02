import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Stat } from '../../components/Shared.jsx';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const API_BASE = 'http://localhost:8000/api';

// ── Données de démonstration (utilisées si l'API n'est pas disponible) ────────
function getMockData(spots) {
  const total = spots.length;
  const free = spots.filter(s => s.status === 'free').length;
  const occupied = spots.filter(s => s.status === 'occupied').length;
  const reserved = spots.filter(s => s.status === 'reserved').length;
  const occupancy_pct = Math.round(((occupied + reserved) / total) * 100);

  const labels_days = ['25/04', '26/04', '27/04', '28/04', '29/04', '30/04', '01/05'];
  return {
    spots: { total, free, occupied, reserved, occupancy_pct },
    revenue: { total: 12480, weekly: 4580, by_day: [420, 610, 530, 780, 650, 910, 680] },
    reservations: { total: 248, active: occupied + reserved, by_day: [12, 18, 15, 22, 19, 26, 21] },
    charts: {
      labels_days,
      labels_hours: ['00h','02h','04h','06h','08h','10h','12h','14h','16h','18h','20h','22h'],
      revenue_by_day: [420, 610, 530, 780, 650, 910, 680],
      reservations_by_day: [12, 18, 15, 22, 19, 26, 21],
      occupancy_by_hour: [0, 0, 0, 5, 30, 65, 75, 80, 90, 85, 70, 40],
    }
  };
}

// ── Options communes ──────────────────────────────────────────────────────────
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Plus Jakarta Sans, sans-serif' }, color: '#64748B' } },
    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11, family: 'Plus Jakarta Sans, sans-serif' }, color: '#64748B' } },
  },
};

export default function AdminOverview({ spots, CURRENCY }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/analytics/`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => {
        // API non disponible → données de démo
        setData(getMockData(spots));
        setLoading(false);
      });
  }, [spots]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: 'var(--ink-400)', fontWeight: 600 }}>
        <span style={{ fontSize: 22 }}>⏳</span> Chargement des statistiques…
      </div>
    );
  }

  const { spots: s, revenue, reservations, charts } = data;

  // ── Données Chart.js ──────────────────────────────────────────────────────

  const revenueChartData = {
    labels: charts.labels_days,
    datasets: [{
      label: `Revenus (${CURRENCY})`,
      data: charts.revenue_by_day,
      backgroundColor: 'rgba(37,99,235,0.12)',
      borderColor: '#2563EB',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2563EB',
      pointRadius: 4,
    }],
  };

  const reservationsChartData = {
    labels: charts.labels_days,
    datasets: [{
      label: 'Réservations',
      data: charts.reservations_by_day,
      backgroundColor: 'rgba(5,150,105,0.75)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const occupancyHourData = {
    labels: charts.labels_hours,
    datasets: [{
      label: "Taux d'occupation (%)",
      data: charts.occupancy_by_hour,
      backgroundColor: charts.occupancy_by_hour.map(v =>
        v >= 80 ? 'rgba(220,38,38,0.75)' : v >= 50 ? 'rgba(245,158,11,0.75)' : 'rgba(37,99,235,0.65)'
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const doughnutData = {
    labels: ['Libres', 'Occupées', 'Réservées'],
    datasets: [{
      data: [s.free, s.occupied, s.reserved],
      backgroundColor: ['rgba(5,150,105,0.85)', 'rgba(100,116,139,0.75)', 'rgba(245,158,11,0.85)'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12, family: 'Plus Jakarta Sans, sans-serif' }, color: '#475569', padding: 16, usePointStyle: true, pointStyleWidth: 10 }
      },
    },
    cutout: '68%',
  };

  const occupancyHourOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: { ...baseOptions.scales.y, max: 100, ticks: { ...baseOptions.scales.y.ticks, callback: v => `${v}%` } },
    },
  };

  return (
    <>
      {/* ── KPI Cards ── */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <Stat label="Taux d'occupation" value={`${s.occupancy_pct}%`} color="blue" />
        <Stat label="Places libres" value={s.free} color="green" />
        <Stat label="Places occupées" value={s.occupied} color="amber" />
        <Stat label={`Revenus (semaine)`} value={`${revenue.weekly.toLocaleString('fr-FR')} ${CURRENCY}`} color="green" />
      </div>

      {/* ── Ligne 1 : Revenus + Donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Graphique revenus 7j */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">💰 Revenus des 7 derniers jours</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--green-600)' }}>
              Total : {revenue.total.toLocaleString('fr-FR')} {CURRENCY}
            </span>
          </div>
          <div className="card-body" style={{ height: 220 }}>
            <Line data={revenueChartData} options={baseOptions} />
          </div>
        </div>

        {/* Donut occupation */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">🅿️ Répartition des places</span>
          </div>
          <div className="card-body" style={{ height: 220 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* ── Ligne 2 : Réservations + Occupation/heure ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Réservations par jour */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">📅 Réservations par jour</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--blue-600)' }}>
              Total : {reservations.total}
            </span>
          </div>
          <div className="card-body" style={{ height: 200 }}>
            <Bar data={reservationsChartData} options={baseOptions} />
          </div>
        </div>

        {/* Occupation par heure */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">⏰ Occupation par heure (aujourd'hui)</span>
          </div>
          <div className="card-body" style={{ height: 200 }}>
            <Bar data={occupancyHourData} options={occupancyHourOptions} />
          </div>
        </div>
      </div>

      {/* ── Résumé synthèse ── */}
      <div className="card">
        <div className="card-head">
          <span className="card-title">📊 Synthèse globale</span>
        </div>
        <div className="card-body">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <span style={{ fontWeight: 600 }}>Occupation globale</span>
            <span style={{ fontWeight: 800 }}>{s.occupancy_pct}%</span>
          </div>
          <div className="progress" style={{ height: 8, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{
              height: '100%',
              background: s.occupancy_pct >= 80 ? 'var(--red-500)' : s.occupancy_pct >= 50 ? 'var(--amber-500)' : 'var(--blue-600)',
              width: `${s.occupancy_pct}%`,
              transition: 'width .5s ease'
            }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
            {[
              { label: 'Total places', val: s.total, color: 'var(--ink-900)' },
              { label: 'Libres', val: s.free, color: 'var(--green-600)' },
              { label: 'Occupées', val: s.occupied, color: 'var(--ink-600)' },
              { label: 'Réservées', val: s.reserved, color: 'var(--amber-600)' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

