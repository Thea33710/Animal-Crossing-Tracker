import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const LABELS = [
  'Lun AM', 'Lun PM', 'Mar AM', 'Mar PM', 'Mer AM', 'Mer PM',
  'Jeu AM', 'Jeu PM', 'Ven AM', 'Ven PM', 'Sam AM', 'Sam PM'
]

export default function TurnipChart({ purchasePrice, currentPrices, prediction }) {
  // Build datasets
  const knownPrices = []
  const predictedMin = []
  const predictedMax = []

  prediction?.future_prices?.forEach((p, i) => {
    if (p.known) {
      knownPrices.push(p.min)
      predictedMin.push(null)
      predictedMax.push(null)
    } else {
      knownPrices.push(null)
      predictedMin.push(p.min)
      predictedMax.push(p.max)
    }
  })

  const data = {
    labels: LABELS,
    datasets: [
      {
        label: 'Prix d\'achat',
        data: Array(12).fill(purchasePrice),
        borderColor: '#F9A825',
        backgroundColor: 'rgba(249, 168, 37, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: 'Prix saisis',
        data: knownPrices,
        borderColor: '#6BAE3C',
        backgroundColor: '#6BAE3C',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Prédiction min',
        data: predictedMin,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Prédiction max',
        data: predictedMax,
        borderColor: '#E91E63',
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        borderWidth: 2,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: '-1',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Nunito', weight: '700' } } },
      tooltip: {
        backgroundColor: 'rgba(45, 45, 45, 0.95)',
        titleFont: { family: 'Nunito', weight: '700' },
        bodyFont: { family: 'Nunito' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { family: 'Nunito' } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { font: { family: 'Nunito', weight: '600' } },
        grid: { display: false },
      },
    },
  }

  return (
    <div style={{ height: 320, background: '#fff', padding: '1rem', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
      <Line data={data} options={options} />
    </div>
  )
}
