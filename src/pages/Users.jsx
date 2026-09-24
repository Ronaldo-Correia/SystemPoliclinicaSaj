import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import { deleteUser } from '../lib/localStore';

export default function Users({ user, users, refresh }) {
  const [editing, setEditing] = useState(null), [pending, setPending] = useState(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  async function remove() {
    setBusy(true); setError('');
    try { await deleteUser(user, pending.id); await refresh(); setPending(null); setMessage('Usuário excluído.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <><Link to="/">← Voltar às pastas</Link><div className="heading"><div><h1>Usuários e acesso</h1><p>Cadastre, edite e exclua profissionais.</p></div><button className="primary" onClick={() => setEditing({})}>+ Novo usuário</button></div>
    {message && <p role="status">{message}</p>}
    <div className="grid">{users.map(u => <article className="card" key={u.id}><h2>{u.name}{u.id === user.id && ' (você)'}</h2><p>{u.email}</p><p className="muted">{u.role === 'admin' ? 'Administrador' : 'Profissional'} {u.specialty && '· ' + u.specialty}</p><div className="actions"><button onClick={() => setEditing(u)}>Editar</button><button className="danger" disabled={u.id === user.id} title={u.id === user.id ? 'A conta em uso não pode ser excluída' : 'Excluir usuário'} onClick={() => { setError(''); setPending(u); }}>Excluir</button></div></article>)}</div>
    {editing && <Modal title={editing.id ? 'Editar usuário' : 'Novo usuário'} close={() => setEditing(null)}><UserForm actor={user} record={editing.id ? editing : null} cancel={() => setEditing(null)} saved={async () => { await refresh(); setEditing(null); setMessage('Usuário salvo.'); }} /></Modal>}
    {pending && <Modal title="Excluir usuário?" close={() => !busy && setPending(null)}><p>Excluir {pending.name}? As pastas e os arquivos serão preservados. As pastas sob responsabilidade deste usuário passarão para você.</p>{error && <p role="alert" className="form-error">{error}</p>}<div className="actions"><button disabled={busy} onClick={() => setPending(null)}>Cancelar</button><button disabled={busy} className="danger" onClick={remove}>Confirmar exclusão</button></div></Modal>}
  </>;
}
