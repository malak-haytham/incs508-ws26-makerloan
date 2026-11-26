import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import './login.css';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('student@giu-uni.de');
  const [password, setPassword] = useState('Password123');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      nav('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-lockup"><span className="login-brand-mark">M</span><span>maker<span>loan</span></span></div>
        <div className="login-brand-message">
          <span className="login-eyebrow"><span /> GIU MAKERSPACE</span>
          <h1>Tools for the ideas you haven’t made yet.</h1>
          <p>One workspace for finding equipment, managing loans, and building with confidence.</p>
        </div>
        <div className="login-brand-visual" aria-hidden="true"><span className="login-visual-circle" /><span className="login-visual-square" /><span className="login-visual-line" /><span className="login-visual-dot" /></div>
        <div className="login-brand-footer"><span>MAKERLOAN</span><span>Equipment lending, organized.</span></div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-form-heading"><span className="login-mobile-mark">M</span><span className="login-form-eyebrow">WELCOME TO MAKERLOAN</span><h2>Sign in to your workspace</h2><p>Use your university account to continue.</p></div>
          <form className="login-form" onSubmit={submit}>
            <label htmlFor="login-email">University email</label>
            <input id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@giu-uni.de" required />
            <div className="login-password-label"><label htmlFor="login-password">Password</label></div>
            <div className="login-password-field">
              <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
              <button type="button" className="login-show-password" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {error && <div className="login-error" role="alert"><span aria-hidden="true">!</span>{error}</div>}
            <button className="login-submit" type="submit" disabled={busy}>{busy ? <><span className="login-spinner" /> Signing in…</> : <>Sign in <span aria-hidden="true">→</span></>}</button>
          </form>
          <div className="login-demo-note"><span className="login-demo-icon" aria-hidden="true">i</span><p><strong>Demo workspace</strong><br />Use the seeded account shown above, or another demo account from the project README.</p></div>
        </div>
        <div className="login-copyright">German International University <span>·</span> MakerLoan prototype</div>
      </section>
    </main>
  );
}
