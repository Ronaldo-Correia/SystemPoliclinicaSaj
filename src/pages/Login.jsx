import React, { useEffect, useState } from 'react';
import { login, needsSetup, setupAdmin } from '../lib/localStore';

export default function Login({ enter, refresh }) {
  const [setup, setSetup] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => { needsSetup().then(setSetup).catch(e => setError(e.message)).finally(() => setReady(true)); }, []);
  async function submit(event) {
    event.preventDefault();
    const { email, password, confirmation } = Object.fromEntries(new FormData(event.currentTarget));
    setError(''); setBusy(true);
    try {
      if (setup && password !== confirmation) throw new Error('As senhas não coincidem.');
      const id = await (setup ? setupAdmin(email, password) : login(email, password));
      await refresh(); enter(id);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="login"><section className="card">
    <span className="eyebrow">POLICLÍNICA REGIONAL DE SAJ</span><h1>Bem-vindo de volta</h1>
    <p>{setup ? 'Configure o acesso inicial do administrador.' : 'Entre na sua conta'}</p>
    <form onSubmit={submit}>
      <label>E-mail<input name="email" type="email" autoComplete="username" placeholder="seu@email.com" required /></label>
      <label>Senha<input name="password" type="password" autoComplete={setup ? 'new-password' : 'current-password'} minLength={8} required /></label>
      {setup && <label>Confirmar senha<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required /></label>}
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="primary" disabled={!ready || busy}>{busy ? 'Entrando…' : setup ? 'Definir acesso e entrar' : 'Entrar'}</button>
    </form>
    {!setup && <button className="text-button" onClick={() => setHelp(!help)}>Esqueceu a senha?</button>}
    {help && <p role="status">Solicite a redefinição de senha ao administrador da policlínica.</p>}
    <p className="muted">Acesso restrito a profissionais autorizados. Novos cadastros são feitos pelo administrador.</p>
  </section></main>;
}
