import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { turnipsApi } from '../api/client'
import TurnipChart from '../components/TurnipChart'

const PRICE_FIELDS = [
  { key: 'monday_am',    label: 'Lundi matin' },
  { key: 'monday_pm',    label: 'Lundi soir' },
  { key: 'tuesday_am',   label: 'Mardi matin' },
  { key: 'tuesday_pm',   label: 'Mardi soir' },
  { key: 'wednesday_am', label: 'Mercredi matin' },
  { key: 'wednesday_pm', label: 'Mercredi soir' },
  { key: 'thursday_am',  label: 'Jeudi matin' },
  { key: 'thursday_pm',  label: 'Jeudi soir' },
  { key: 'friday_am',    label: 'Vendredi matin' },
  { key: 'friday_pm',    label: 'Vendredi soir' },
  { key: 'saturday_am',  label: 'Samedi matin' },
  { key: 'saturday_pm',  label: 'Samedi soir' },
]

const PATTERN_LABELS = {
  decreasing:  { label: 'Décroissant', emoji: '📉', color: '#e53935' },
  small_spike: { label: 'Petit pic',   emoji: '📊', color: '#FB8C00' },
  large_spike: { label: 'Grand pic',   emoji: '📈', color: '#43A047' },
  random:      { label: 'Aléatoire',   emoji: '🎲', color: '#9C27B0' },
  unknown:     { label: 'Inconnu',     emoji: '❓', color: '#757575' },
}

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100)
  const color = pct >= 70 ? '#43A047' : pct >= 40 ? '#FB8C00' : '#e53935'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
      <div style={{ flex: 1, height: 5, background: '#eee', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: '0.72rem', color, fontWeight: 700, minWidth: 30 }}>{pct}%</span>
    </div>
  )
}

function SlotPredictionCard({ slot, label, actualPrice, prediction }) {
  if (!prediction) return null
  const isKnown = prediction.known

  return (
    <div style={{
      background: isKnown ? '#F1F8E9' : '#F3F3FF',
      border: `1.5px solid ${isKnown ? '#A5D6A7' : '#C5CAE9'}`,
      borderRadius: 10,
      padding: '0.6rem 0.75rem',
    }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555', marginBottom: 3 }}>{label}</div>
      {isKnown ? (
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2E7D32' }}>
          {actualPrice} 🔔
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '0.8rem', color: '#1565C0', fontWeight: 700 }}>{prediction.min}</span>
            <span style={{ fontSize: '0.7rem', color: '#999' }}>—</span>
            <span style={{ fontSize: '0.95rem', color: '#B71C1C', fontWeight: 800 }}>{prediction.max}</span>
            <span style={{ fontSize: '0.7rem', color: '#888' }}>🔔</span>
          </div>
          <ConfidenceBar value={prediction.confidence} />
        </>
      )}
    </div>
  )
}

export default function Turnips() {
  const { island } = useAuth()
  const navigate = useNavigate()

  const [purchasePrice, setPurchasePrice] = useState('')
  const [prices, setPrices] = useState({})
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!island) { navigate('/setup-island'); return }
    loadCurrentWeek()
  }, [island])

  const loadCurrentWeek = async () => {
    if (!island) return
    setLoading(true)
    try {
      const res = await turnipsApi.getCurrentWeek(island.id)
      setPurchasePrice(res.data.purchase_price || '')
      setPrices(res.data.prices || {})
      if (res.data.purchase_price) runPrediction()
    } catch (err) {
      if (err.response?.status !== 404) console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!purchasePrice || purchasePrice < 90 || purchasePrice > 110) {
      setError("Prix d'achat invalide (90–110 clochettes)")
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { island_id: island.id, purchase_price: parseInt(purchasePrice) }
      PRICE_FIELDS.forEach(({ key }) => {
        payload[key] = prices[key] ?? null
      })
await turnipsApi.savePrices(payload)
      await runPrediction()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const runPrediction = async () => {
    if (!island) return
    try {
      const res = await turnipsApi.predict(island.id)
      setPrediction(res.data.prediction)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePriceChange = (field, value) => {
    const num = value === '' ? null : parseInt(value)
    setPrices(prev => ({ ...prev, [field]: num }))
  }

  // Build a map slotIndex → prediction object
  const slotPredictionMap = {}
  if (prediction?.future_prices) {
    prediction.future_prices.forEach(p => { slotPredictionMap[p.slot] = p })
  }

  const knownCount = PRICE_FIELDS.filter(({ key }) => prices[key] != null).length
  const patternInfo = PATTERN_LABELS[prediction?.pattern] || PATTERN_LABELS.unknown

  return (
    <div className="page-container">
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>🥔 Marché aux navets</h1>
          <p style={styles.subtitle}>Prédiction IA des prix de la semaine</p>
        </div>
        {island && <span style={styles.islandBadge}>🏝️ {island.name}</span>}
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={styles.layout}>

          {/* ── Formulaire ── */}
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>📝 Saisie des prix</h3>
            {error && <div style={styles.errorBanner}>{error}</div>}

            <div className="form-group">
              <label style={{ fontWeight: 700, color: '#F9A825' }}>💰 Prix d'achat dimanche</label>
              <input
                type="number" min="90" max="110"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                placeholder="90-110 clochettes"
                style={styles.bigInput}
              />
              <small style={{ color: '#999', fontSize: '0.8rem' }}>Prix auquel vous avez acheté les navets chez Porcelette</small>
            </div>

            <hr style={{ border: 'none', borderTop: '2px solid #EEE', margin: '1rem 0' }} />

            <div style={styles.priceGrid}>
              {PRICE_FIELDS.map(({ key, label }) => (
                <div key={key} className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</label>
                  <input
                    type="number" min="0" max="660"
                    value={prices[key] ?? ''}
                    onChange={e => handlePriceChange(key, e.target.value)}
                    placeholder="—"
                    style={styles.priceInput}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !purchasePrice}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '1rem' }}
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder et prédire'}
            </button>
          </div>

          {/* ── Prédictions ── */}
          <div style={styles.predictionsCol}>
            {prediction ? (
              <>
                {/* Carte pattern */}
                <div className="card" style={{ ...styles.patternCard, borderLeft: `6px solid ${patternInfo.color}` }}>
                  <div style={styles.patternHeader}>
                    <div>
                      <div style={styles.patternEmoji}>{patternInfo.emoji}</div>
                      <h3 style={styles.patternLabel}>{patternInfo.label}</h3>
                      <p style={styles.confidenceText}>
                        Confiance globale : <strong>{Math.round(prediction.confidence * 100)}%</strong>
                        {' · '}
                        <span style={{ color: '#888' }}>{knownCount}/12 prix saisis</span>
                      </p>
                    </div>
                  </div>

                  {/* Probabilités des patterns */}
                  {prediction.pattern_probabilities && (
                    <div style={styles.patternProbs}>
                      {Object.entries(prediction.pattern_probabilities).map(([p, prob]) => (
                        <div key={p} style={styles.patternProbRow}>
                          <span style={{ fontSize: '0.78rem', color: '#555', minWidth: 90 }}>
                            {PATTERN_LABELS[p]?.emoji} {PATTERN_LABELS[p]?.label}
                          </span>
                          <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 99, overflow: 'hidden', margin: '0 8px' }}>
                            <div style={{
                              width: `${Math.round(prob * 100)}%`, height: '100%',
                              background: PATTERN_LABELS[p]?.color,
                              borderRadius: 99, transition: 'width .5s'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: PATTERN_LABELS[p]?.color, minWidth: 32 }}>
                            {Math.round(prob * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ ...styles.recommendation, background: `${patternInfo.color}15`, color: patternInfo.color }}>
                    {prediction.recommendation}
                  </div>
                  {prediction.peak_price && (
                    <p style={styles.peakInfo}>
                      📊 Pic prévu : <strong>{prediction.peak_price} 🔔</strong> ({prediction.peak_day})
                    </p>
                  )}
                </div>

                {/* Grille de prédictions par slot */}
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontWeight: 800, color: '#3A7D44', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    🔮 Prédictions par créneau
                  </h4>
                  <div style={styles.slotsGrid}>
                    {PRICE_FIELDS.map(({ key, label }, i) => (
                      <SlotPredictionCard
                        key={key}
                        slot={i}
                        label={label}
                        actualPrice={prices[key]}
                        prediction={slotPredictionMap[i]}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.75rem' }}>
                    🟢 Prix saisis · Fourchette <span style={{ color: '#1565C0', fontWeight: 700 }}>min</span>–<span style={{ color: '#B71C1C', fontWeight: 700 }}>max</span> avec barre de fiabilité. Plus vous saisissez de prix, plus les fourchettes se resserrent.
                  </p>
                </div>

                {/* Graphique */}
                <TurnipChart
                  purchasePrice={parseInt(purchasePrice)}
                  currentPrices={prices}
                  prediction={prediction}
                />
              </>
            ) : (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🥔</div>
                <h3 style={{ fontWeight: 800, color: '#3A7D44', marginBottom: '0.5rem' }}>
                  Saisissez vos prix pour obtenir une prédiction
                </h3>
                <p style={{ color: '#757575', fontSize: '0.9rem' }}>
                  L'IA analysera vos prix et affinera ses prédictions au fur et à mesure que vous en saisissez.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#3A7D44' },
  subtitle: { color: '#757575', fontSize: '0.9rem', marginTop: '0.2rem' },
  islandBadge: { background: '#E8F5E9', color: '#3A7D44', borderRadius: 50, padding: '0.4rem 1rem', fontWeight: 700, fontSize: '0.88rem' },
  layout: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', alignItems: 'start' },
  formCard: { background: '#fff', borderRadius: 20, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#3A7D44', marginBottom: '1rem' },
  errorBanner: { background: '#FFEBEE', color: '#c62828', borderRadius: 10, padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 },
  bigInput: { fontSize: '1.25rem', fontWeight: 700, color: '#F9A825', textAlign: 'center', padding: '0.75rem' },
  priceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  priceInput: { fontSize: '0.95rem', padding: '0.5rem', textAlign: 'center' },
  predictionsCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  patternCard: { padding: '1.5rem' },
  patternHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  patternEmoji: { fontSize: '2.5rem', marginBottom: '0.25rem' },
  patternLabel: { fontSize: '1.3rem', fontWeight: 800, color: '#2D2D2D' },
  confidenceText: { fontSize: '0.85rem', color: '#757575', marginTop: '0.2rem' },
  patternProbs: { marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 6 },
  patternProbRow: { display: 'flex', alignItems: 'center' },
  recommendation: { padding: '0.75rem 1rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' },
  peakInfo: { fontSize: '0.85rem', color: '#757575', marginTop: '0.5rem' },
  slotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem' },
  emptyState: { textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
}
