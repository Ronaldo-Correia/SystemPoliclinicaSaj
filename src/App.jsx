import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { list, session } from './lib/localStore';
import Login from './pages/Login';
import Home from './pages/Home';
import FolderDetail from './pages/FolderDetail';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import ReportEditor from './pages/ReportEditor';
export default function App() {
  const [users, setUsers] = useState([]), [folders, setFolders] = useState([]), [userId, setUserId] = useState(session.get), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const refresh = async () => { const [u, f] = await Promise.all([list('users'), list('folders')]); setUsers(u); setFolders(f.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); };
  const run = async operation => { setError(''); try { await operation(); } catch (e) { setError(e.message || 'Não foi possível concluir a operação.'); } };
  useEffect(() => { run(refresh).finally(() => setLoading(false)); }, []);
  const user = users.find(u => u.id === userId);
  if (loading) return <main className="empty">Carregando…</main>;
  return <BrowserRouter>{error && <div className="error" role="alert">{error}<button onClick={() => run(refresh)}>Tentar novamente</button><button aria-label="Fechar mensagem" onClick={() => setError('')}>✕</button></div>}{!user ? <Login refresh={refresh} enter={id => { session.set(id); setUserId(id); }} /> : <><nav><Link className="brand" to="/">▰ MedArquivo<small>Policlínica Regional de SAJ</small></Link><div><Link to="/laudos">Laudos</Link><Link to="/pastas">Pastas e imagens</Link>{user.role === 'admin' && <Link to="/profissionais">Profissionais</Link>}<Link to="/perfil">Meu perfil · {user.name}</Link><button onClick={() => { session.clear(); setUserId(null); }}>Sair</button></div></nav><main className="container"><Routes><Route path="/" element={<Navigate to="/laudos" replace />} /><Route path="/laudos" element={<Reports user={user} />} /><Route path="/laudos/:id" element={<ReportEditor user={user} />} /><Route path="/pastas" element={<Home {...{ folders, users, user, run, refresh }} />} /><Route path="/pastas/:id" element={<FolderDetail key={user.id} {...{ folders, users, user, run, refresh }} />} /><Route path="/profissionais" element={<Users {...{ users, user, run, refresh }} />} /><Route path="/perfil" element={<Profile {...{ user, refresh }} />} /><Route path="/medicos" element={<Navigate to="/profissionais" replace />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main></>}</BrowserRouter>;
}
