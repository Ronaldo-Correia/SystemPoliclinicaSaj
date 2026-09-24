import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { list } from '../lib/localStore';
import { archiveReport, statusLabels } from '../lib/reports';
import Modal from '../components/Modal';
export default function Reports({ user }) {
  const [reports, setReports] = useState([]), [search, setSearch] = useState(''), [status, setStatus] = useState(''), [error, setError] = useState(''), [pending, setPending] = useState(null), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const load = async () => setReports((await list('reports')).filter(r => user.role === 'admin' || r.doctorId === user.id).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)));
  useEffect(() => { load().catch(e => setError(e.message)).finally(() => setLoading(false)); }, [user.id]);
  const visible = reports.filter(r => (!status || r.status === status) && `${r.patient} ${r.number} ${r.exam}`.toLowerCase().includes(search.toLowerCase()));
  return <><div className="heading"><div><span className="eyebrow">POLICLÍNICA REGIONAL DE SAJ</span><h1>Laudos médicos</h1><p>{user.role === 'admin' ? 'Gerencie os documentos e acompanhe os médicos responsáveis.' : 'Elabore laudos, organize imagens e revise o documento.'}</p></div>{user.role !== 'admin' && <Link className="button primary" to="/laudos/novo">+ Novo laudo</Link>}</div>
    {user.role === 'admin' && <section className="card"><strong>Você está no perfil administrador</strong><p>Este perfil consulta e arquiva laudos. Para preencher um novo laudo, entre com uma conta de médico.</p><Link className="button" to="/profissionais">Gerenciar usuários</Link></section>}
    <div className="report-stats">{Object.entries(statusLabels).map(([key,label]) => <div className="card" key={key}><strong>{reports.filter(r => r.status === key).length}</strong><span>{label}</span></div>)}</div>
    <div className="columns"><label>Buscar laudo<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Paciente, número ou exame" /></label><label>Situação<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todas</option>{Object.entries(statusLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <p>Carregando laudos…</p> : !visible.length ? <div className="empty"><h2>Nenhum laudo encontrado</h2><p>{user.role === 'admin' ? 'Os laudos elaborados pelos médicos aparecerão aqui.' : 'Comece um novo laudo usando os campos do modelo.'}</p></div> : visible.map(r => <article className="card document" key={r.id}><div><span className="eyebrow">{r.number} · {r.exam}</span><h2>{r.patient || 'Paciente não informado'}</h2><p className="muted">{r.doctor.name} · {statusLabels[r.status]}</p></div><Link className="button" to={'/laudos/'+r.id}>{user.role !== 'admin' && r.status === 'draft' ? 'Continuar preenchimento' : 'Visualizar'}</Link>{user.role === 'admin' && r.status !== 'archived' && <button onClick={() => setPending(r)}>Arquivar</button>}</article>)}
    {pending && <Modal title="Arquivar laudo?" close={() => !busy && setPending(null)}><p>O documento será preservado e ficará na situação Arquivado.</p><button disabled={busy} onClick={async () => { setBusy(true); try { await archiveReport(user, pending); await load(); setPending(null); } catch(e) { setError(e.message); setPending(null); } finally { setBusy(false); } }}>Confirmar arquivamento</button></Modal>}
  </>;
}
