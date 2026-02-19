import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const { signup }                  = useAuth()
  const navigate                    = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères')
      return
    }

    setLoading(true)
    try {
      await signup(email, password)
      navigate('/setup-island')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2
    : 3

  const strengthLabels = ['', 'Faible', 'Correct', 'Fort']
  const strengthColors = ['', '#e53935', '#FB8C00', '#43A047']

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🏝️</div>
          <h1 style={styles.title}>Créer un compte</h1>
          <p style={styles.subtitle}>Rejoignez la communauté !</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
              required
            />
            {password && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{ height: 6, background: '#EEE', borderRadius: 50, overflow: 'hidden' }}>
                  <div style={{ width: `${(strength / 3) * 100}%`, height: '100%', background: strengthColors[strength], borderRadius: 50, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: strengthColors[strength], fontWeight: 700 }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
            {confirm && confirm !== password && (
              <p className="error-msg">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.footer}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: '#3A7D44' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 420,
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  icon: { fontSize: '3rem', marginBottom: '0.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#3A7D44', marginBottom: '0.25rem' },
  subtitle: { color: '#757575', fontSize: '0.95rem' },
  errorBanner: {
    background: '#FFEBEE',
    color: '#c62828',
    borderRadius: 10,
    padding: '0.65rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  footer: { textAlign: 'center', marginTop: '1.25rem', color: '#757575', fontSize: '0.9rem' },
}
