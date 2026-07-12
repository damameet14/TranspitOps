import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth_context';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (preset: { email: string; password: string }) => {
    setEmail(preset.email);
    setPassword(preset.password);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title" style={{ color: 'var(--accent)' }}>TransitOps</h1>
        <p className="login-subtitle">Smart transport operations platform</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fleet@transitops.io"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 'var(--space-3)' }}>{error}</div>}

          <button
            type="submit"
            className="button button-primary login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-caption)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>
            Quick access — demo credentials
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            {[
              { label: 'Fleet Manager', email: 'fleet@transitops.io', password: 'fleet123' },
              { label: 'Driver', email: 'driver@transitops.io', password: 'driver123' },
              { label: 'Safety Officer', email: 'safety@transitops.io', password: 'safety123' },
              { label: 'Finance', email: 'finance@transitops.io', password: 'finance123' },
            ].map((preset) => (
              <button
                key={preset.email}
                type="button"
                className="button button-secondary button-small"
                onClick={() => quickLogin(preset)}
                style={{ fontSize: 'var(--font-size-caption)' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
