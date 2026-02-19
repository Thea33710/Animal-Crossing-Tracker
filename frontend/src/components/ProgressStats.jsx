const CATEGORY_LABELS = {
  fish:         { label: 'Poissons',          emoji: '🐟', badgeClass: 'badge-fish' },
  bug:          { label: 'Insectes',          emoji: '🦋', badgeClass: 'badge-bug' },
  sea_creature: { label: 'Créatures marines', emoji: '🦀', badgeClass: 'badge-sea' },
}

export default function ProgressStats({ stats }) {
  if (!stats) return null

  return (
    <div style={styles.wrapper}>
      {/* Global */}
      <div className="card" style={styles.globalCard}>
        <h3 style={styles.cardTitle}>📊 Progression globale</h3>
        <div style={styles.bigPercent}>{stats.percentage}%</div>
        <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
          <div className="progress-bar__fill" style={{ width: `${stats.percentage}%` }} />
        </div>
        <p style={styles.subText}>
          {stats.collected} / {stats.total} créatures collectées
        </p>
      </div>

      {/* Per category */}
      {Object.entries(CATEGORY_LABELS).map(([cat, { label, emoji, badgeClass }]) => {
        const catStats = stats.by_category?.[cat]
        if (!catStats) return null
        return (
          <div key={cat} className="card" style={styles.catCard}>
            <div style={styles.catHeader}>
              <span className={`badge ${badgeClass}`}>{emoji} {label}</span>
              <span style={styles.catPercent}>{catStats.percentage}%</span>
            </div>
            <div className="progress-bar" style={{ margin: '0.6rem 0 0.4rem' }}>
              <div
                className="progress-bar__fill"
                style={{
                  width: `${catStats.percentage}%`,
                  background: cat === 'fish' ? '#1565C0' : cat === 'bug' ? '#6A1B9A' : '#006064'
                }}
              />
            </div>
            <p style={styles.subText}>{catStats.collected} / {catStats.total}</p>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  globalCard: {
    background: 'linear-gradient(135deg, #E8F5E9, #FFFFFF)',
    border: '2px solid #6BAE3C',
  },
  catCard: { padding: '1rem' },
  cardTitle: { fontSize: '0.95rem', color: '#424242', marginBottom: '0.5rem', fontWeight: 700 },
  bigPercent: { fontSize: '2.2rem', fontWeight: 800, color: '#3A7D44', lineHeight: 1.1 },
  catHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catPercent: { fontWeight: 800, color: '#3A7D44', fontSize: '1.1rem' },
  subText: { fontSize: '0.82rem', color: '#757575', marginTop: '0.2rem' },
}
