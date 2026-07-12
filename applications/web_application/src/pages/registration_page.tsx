import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth_context';
import { ROLE_OPTIONS, type UserRole } from '../shared/role_access';

export default function RegistrationPage() {
  const { registerDemoProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('fleet_manager');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role) ?? ROLE_OPTIONS[0];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await registerDemoProfile({ fullName, email, role, demoEmail: selectedRole.demoEmail, demoPassword: selectedRole.demoPassword });
      navigate('/dashboard');
    } catch {
      setError('The demo workspace is unavailable. Make sure the Docker services are running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="registration-card">
        <div className="authentication-heading"><Link to="/" className="authentication-brand">TransitOps</Link><span className="demo-badge">Demo registration</span></div>
        <h1 className="login-title">Create your role workspace</h1>
        <p className="login-subtitle">Your profile is saved in this browser and connected to the selected seeded demo role.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label" htmlFor="registration-name">Full name</label><input id="registration-name" className="form-input" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></div>
            <div className="form-group"><label className="form-label" htmlFor="registration-email">Work email</label><input id="registration-email" className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          </div>
          <fieldset className="role-selection">
            <legend className="form-label">Choose your role</legend>
            <div className="role-option-grid">
              {ROLE_OPTIONS.map((option) => (
                <label className={`role-option${role === option.value ? ' selected' : ''}`} key={option.value}>
                  <input type="radio" name="role" value={option.value} checked={role === option.value} onChange={() => setRole(option.value)} />
                  <span className="role-option-title">{option.label}</span><span className="role-option-description">{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && <div className="form-error registration-error">{error}</div>}
          <button type="submit" className="button button-primary login-button" disabled={isSubmitting}>{isSubmitting ? 'Preparing workspace...' : `Register as ${selectedRole.label}`}</button>
        </form>
        <p className="authentication-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
