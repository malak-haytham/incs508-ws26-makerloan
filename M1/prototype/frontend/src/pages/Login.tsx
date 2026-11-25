import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('student@giu-uni.de');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(email, password); nav('/'); } catch (err) { setError(errorMessage(err)); }
  };
  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: '80px auto', display: 'grid', gap: 8, fontFamily: 'system-ui' }}>
      <h2>MakerLoan login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button>Log in</button>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
}
