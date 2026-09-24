import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { list, save, canAccess, importFolder, removeDocument } from '../lib/localStore';
import Modal from '../components/Modal';
export default function FolderForm({ user, users, close, run, refresh }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState([]);
  return <Modal title="Importar pasta" close={() => !busy && close()}><form onSubmit={e => {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true); run(async () => { await importFolder({ title: data.title.trim(), patient: data.patient.trim(), reference: data.reference.trim(), members }, files, user); await refresh(); close(); }).finally(() => setBusy(false));
  }}><label>Nome da pasta<input name="title" required maxLength={150} /></label><div className="columns"><label>Paciente<input name="patient" required maxLength={150} /></label><label>Referência<input name="reference" maxLength={80} /></label></div>{user.role === 'admin' && <fieldset><legend>Profissionais autorizados</legend>{users.filter(u => u.id !== user.id).map(u => <label className="check" key={u.id}><input type="checkbox" checked={members.includes(u.id)} onChange={e => setMembers(e.target.checked ? [...members, u.id] : members.filter(id => id !== u.id))} />{u.name}</label>)}</fieldset>}<label>Selecionar arquivos<input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} /></label><label>Ou selecionar uma pasta<input type="file" multiple webkitdirectory="" onChange={e => setFiles(Array.from(e.target.files))} /></label><p>{files.length} arquivos selecionados</p><button className="primary" disabled={busy || !files.length}>{busy ? 'Importando…' : 'Criar pasta e importar'}</button></form></Modal>;
}
