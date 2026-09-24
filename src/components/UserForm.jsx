import React, { useState } from 'react';
import { updateUser } from '../lib/localStore';

export default function UserForm({ actor, record, saved, cancel }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError('');
    try { await updateUser(actor, record?.id, data); await saved(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <form onSubmit={submit}>
    <label>Nome<input name="name" defaultValue={record?.name || ''} required maxLength={150} /></label>
    <label>E-mail<input name="email" type="email" defaultValue={record?.email || ''} required /></label>
    <label>Especialidade<input name="specialty" defaultValue={record?.specialty || ''} /></label>
    <div className="columns"><label>CRM<input name="crm" defaultValue={record?.crm || ''} /></label><label>UF do CRM<input name="uf" maxLength={2} defaultValue={record?.uf || ''} /></label></div>
    {actor.role === 'admin' && <label>Perfil<select name="role" defaultValue={record?.role || 'user'}><option value="user">Profissional</option><option value="admin">Administrador</option></select></label>}
    <label>{record?.credential ? 'Nova senha (opcional)' : 'Senha'}<input name="password" type="password" autoComplete="new-password" minLength={8} required={!record?.credential} /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="actions">{cancel && <button type="button" disabled={busy} onClick={cancel}>Cancelar</button>}<button className="primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar usuário'}</button></div>
  </form>;
}
