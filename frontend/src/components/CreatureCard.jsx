const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Juin','Jul','Aoû','Sep','Oct','Nov','Déc']

const CATEGORY_INFO = {
  fish:         { emoji: '🐟', label: 'Poisson',          badge: 'badge-fish' },
  bug:          { emoji: '🦋', label: 'Insecte',          badge: 'badge-bug' },
  sea_creature: { emoji: '🦀', label: 'Créature marine',  badge: 'badge-sea' },
}

export default function CreatureCard({ creature, onToggle }) {
  const info = CATEGORY_INFO[creature.category] || { emoji: '🐾', label: creature.category, badge: '' }

  return (
    <div
      style={{
        ...styles.card,
        border: creature.collected ? '2px solid #6BAE3C' : '2px solid #EEEEEE',
        opacity: creature.collected ? 1 : 0.85,
      }}
    >
      {/* Image */}
      <div style={styles.imgWrap}>
        {creature.icon_url || creature.image_url ? (
          <img
            src={creature.icon_url || creature.image_url}
            alt={creature.name_fr}
            style={styles.img}
            loading="lazy"
          />
        ) : (
          <div style={styles.imgPlaceholder}>{info.emoji}</div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.nameRow}>
          <span style={styles.name}>{creature.name_fr}</span>
          <span className={`badge ${info.badge}`}>{info.label}</span>
        </div>

        {creature.sell_price > 0 && (
          <p style={styles.meta}>🪙 {creature.sell_price.toLocaleString('fr-FR')} clochettes</p>
        )}
        {creature.location && (
          <p style={styles.meta}>📍 {creature.location}</p>
        )}
        {creature.hours_available && (
          <p style={styles.meta}>🕐 {creature.hours_available}</p>
        )}

        {/* Months */}
        {creature.months_available?.length > 0 && creature.months_available.length < 12 && (
          <div style={styles.months}>
            {MONTHS_FR.map((m, i) => (
              <span
                key={i}
                style={{
                  ...styles.monthBadge,
                  background: creature.months_available.includes(i + 1) ? '#6BAE3C' : '#EEEEEE',
                  color:      creature.months_available.includes(i + 1) ? '#fff' : '#999',
                }}
              >
                {m}
              </span>
            ))}
          </div>
        )}
        {(!creature.months_available || creature.months_available.length === 12) && (
          <p style={styles.meta}>📅 Disponible toute l'année</p>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => onToggle(creature.id, !creature.collected)}
        style={{
          ...styles.toggleBtn,
          background: creature.collected ? '#6BAE3C' : '#EEEEEE',
          color:      creature.collected ? '#fff' : '#757575',
        }}
        title={creature.collected ? 'Marquer non collecté' : 'Marquer collecté'}
      >
        {creature.collected ? '✓ Collecté' : '+ Collecter'}
      </button>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  imgWrap: {
    height: 100,
    background: '#F1F8E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: 80, height: 80, objectFit: 'contain' },
  imgPlaceholder: { fontSize: '2.5rem' },
  content: { padding: '0.75rem 0.9rem', flex: 1 },
  nameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.3rem',
    marginBottom: '0.4rem',
  },
  name: { fontWeight: 800, fontSize: '0.95rem', color: '#2D2D2D' },
  meta: { fontSize: '0.78rem', color: '#757575', margin: '0.15rem 0' },
  months: { display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: '0.4rem' },
  monthBadge: {
    fontSize: '0.65rem',
    padding: '1px 5px',
    borderRadius: 50,
    fontWeight: 700,
  },
  toggleBtn: {
    width: '100%',
    padding: '0.55rem',
    border: 'none',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
}
