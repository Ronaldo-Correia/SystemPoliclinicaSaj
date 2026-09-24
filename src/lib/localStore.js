// Adapter for the browser prototype; replace with the future authenticated API.
const SESSION = 'policlinica-local-session-v2';
let connection;
export function database() {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open('policlinica-prototype', 2);
    request.onupgradeneeded = () => {
      const fresh = !request.result.objectStoreNames.contains('users');
      for (const name of ['users', 'folders', 'documents', 'reports']) {
        if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: 'id' });
      }
      if (fresh) request.transaction.objectStore('users').put({ id: 'admin', name: 'Administrador', email: 'admin@demo.local', role: 'admin' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { connection = null; reject(request.error); };
  });
  return connection;
}
export async function transaction(names, operation) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(names, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Operação cancelada.'));
    operation(tx);
  });
}
export async function list(name) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const req = db.transaction(name).objectStore(name).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export const save = (name, record) => transaction([name], tx => tx.objectStore(name).put(record));
export const session = { get: () => sessionStorage.getItem(SESSION), set: id => sessionStorage.setItem(SESSION, id), clear: () => sessionStorage.removeItem(SESSION) };
export const canAccess = (user, folder) => user.role === 'admin' || folder.owner === user.id || folder.members.includes(user.id);
export async function importFolder(data, files, user) {
  const id = crypto.randomUUID();
  const folder = { ...data, id, owner: user.id, createdAt: new Date().toISOString(), count: files.length, notes: '' };
  await transaction(['folders', 'documents'], tx => {
    tx.objectStore('folders').put(folder);
    for (const file of files) tx.objectStore('documents').put({ id: crypto.randomUUID(), folderId: id, name: file.name, path: file.webkitRelativePath || file.name, type: file.type, size: file.size, status: 'novo', blob: file });
  });
}
export async function removeDocument(document, folder) {
  await transaction(['documents', 'folders'], tx => {
    tx.objectStore('documents').delete(document.id);
    tx.objectStore('folders').put({ ...folder, count: Math.max(0, folder.count - 1) });
  });
}

// Browser-only credentials for UI development. Authorization belongs on the backend.
async function passwordRecord(password, salt = crypto.randomUUID()) {
  if (password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return { salt, hash: Array.from(new Uint8Array(bits), n => n.toString(16).padStart(2, '0')).join('') };
}
export async function needsSetup() {
  return !(await list('users')).some(u => u.credential);
}
export async function setupAdmin(email, password) {
  if (!(await needsSetup())) throw new Error('O administrador já foi configurado.');
  const users = await list('users');
  const admin = users.find(u => u.id === 'admin');
  if (!admin) throw new Error('Administrador inicial não encontrado.');
  if (users.some(u => u.id !== admin.id && u.email === email.trim().toLowerCase())) throw new Error('E-mail já cadastrado.');
  await save('users', { ...admin, email: email.trim().toLowerCase(), credential: await passwordRecord(password) });
  return admin.id;
}
export async function login(email, password) {
  const user = (await list('users')).find(u => u.email === email.trim().toLowerCase());
  if (!user?.credential || password.length < 8 || (await passwordRecord(password, user.credential.salt)).hash !== user.credential.hash) throw new Error('E-mail ou senha inválidos.');
  return user.id;
}
export async function updateUser(actor, id, data) {
  const users = await list('users');
  const current = users.find(u => u.id === id);
  if (actor.role !== 'admin' && actor.id !== id) throw new Error('Acesso não permitido.');
  if (!current && actor.role !== 'admin') throw new Error('Somente o administrador pode cadastrar usuários.');
  const name = data.name.trim(), email = data.email.trim().toLowerCase();
  if (!name || !email) throw new Error('Preencha nome e e-mail.');
  if (users.some(u => u.id !== id && u.email === email)) throw new Error('Este e-mail já está cadastrado.');
  const role = actor.role === 'admin' ? data.role : current.role;
  if (!['admin', 'user'].includes(role)) throw new Error('Perfil inválido.');
  if (current?.role === 'admin' && role !== 'admin' && users.filter(u => u.role === 'admin').length === 1) throw new Error('Mantenha pelo menos um administrador.');
  let credential = current?.credential;
  if (data.password) credential = await passwordRecord(data.password);
  if (!credential) throw new Error('Defina uma senha para este usuário.');
  await save('users', { id: id || crypto.randomUUID(), name, email, specialty: data.specialty.trim(), crm: data.crm?.trim() || current?.crm || '', uf: data.uf?.trim() || current?.uf || '', role, credential });
}
export async function deleteUser(actor, id) {
  if (actor.role !== 'admin') throw new Error('Acesso não permitido.');
  if (actor.id === id) throw new Error('Você não pode excluir a conta em uso.');
  const folders = await list('folders');
  await transaction(['users', 'folders'], tx => {
    tx.objectStore('users').delete(id);
    for (const folder of folders) {
      if (folder.owner === id || folder.members.includes(id)) tx.objectStore('folders').put({ ...folder, owner: folder.owner === id ? actor.id : folder.owner, members: folder.members.filter(member => member !== id) });
    }
  });
}
