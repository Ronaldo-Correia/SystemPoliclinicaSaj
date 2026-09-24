import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserForm from '../components/UserForm';
export default function Profile({ user, refresh }) {
  const [message, setMessage] = useState('');
  return <><Link to="/">← Voltar às pastas</Link><h1>Meu perfil</h1><section className="card profile">{message && <p role="status">{message}</p>}<UserForm key={JSON.stringify(user)} actor={user} record={user} saved={async () => { await refresh(); setMessage('Perfil atualizado com sucesso.'); }} /></section></>;
}
