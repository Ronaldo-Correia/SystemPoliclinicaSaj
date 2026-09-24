import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { list, save, canAccess, importFolder, removeDocument } from '../lib/localStore';
import FolderForm from '../components/FolderForm';
export default function Home({ folders, users, user, run, refresh }) {
  const [search, setSearch] = useState(''); const [adding, setAdding] = useState(false);
  const visible = folders.filter(f => canAccess(user, f) && `${f.title} ${f.patient} ${f.reference}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  return <><div className="heading"><div><span className="eyebrow">ARQUIVO CLÍNICO</span><h1>Pastas médicas</h1><p>Exames e laudos organizados por paciente.</p></div><button className="primary" onClick={() => setAdding(true)}>+ Importar pasta</button></div><input className="search" aria-label="Buscar pastas" placeholder="Buscar paciente, pasta ou referência…" value={search} onChange={e => setSearch(e.target.value)} /><div className="grid">{visible.map(f => <Link className="card folder" to={'/pastas/' + f.id} key={f.id}><span className="folder-icon">▰</span><h2>{f.title}</h2><p>{f.patient}</p><p className="muted">{f.reference || 'Sem referência'}</p><footer>{f.count} arquivos <span>Abrir pasta →</span></footer></Link>)}</div>{!visible.length && <div className="empty"><h2>Nenhuma pasta encontrada</h2><p>{search ? 'Tente outro termo de busca.' : 'Importe arquivos fictícios para experimentar as telas.'}</p></div>}{adding && <FolderForm {...{ user, users, run, refresh }} close={() => setAdding(false)} />}</>;
}
