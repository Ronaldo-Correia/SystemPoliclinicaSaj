import { list, save } from './localStore.js';
export const examTypes = ['Ultrassonografia', 'Colonoscopia', 'Endoscopia', 'Ecocardiograma'];
export const statusLabels = { draft: 'Rascunho', ready: 'Revisado · sem assinatura digital', archived: 'Arquivado' };
export function assertReportEdit(user, report) {
  if (user.role === 'admin' || user.id !== report.doctorId) throw new Error('Somente o médico responsável pode editar o conteúdo clínico.');
  if (report.status !== 'draft') throw new Error('Este laudo está bloqueado para edição.');
}
export function validateReport(report) {
  for (const field of ['patient', 'date', 'exam', 'equipment', 'description', 'impression', 'assessment']) {
    if (!report[field]?.trim()) throw new Error('Preencha os campos obrigatórios antes de concluir a revisão.');
  }
  if (!report.doctor.crm || !report.doctor.uf) throw new Error('Preencha seu CRM e UF em Meu perfil.');
}
export async function saveReport(user, report, finish = false) {
  const previous = (await list('reports')).find(r => r.id === report.id);
  assertReportEdit(user, previous || report);
  if (finish) validateReport(report);
  await save('reports', { ...report, status: finish ? 'ready' : 'draft', updatedAt: new Date().toISOString() });
}
export async function archiveReport(user, report) {
  if (user.role !== 'admin') throw new Error('Apenas o administrador pode arquivar documentos.');
  await save('reports', { ...report, status: 'archived', previousStatus: report.status });
}
export function newReport(user) {
  const id = crypto.randomUUID();
  return { id, number: 'L-' + id.slice(0, 8).toUpperCase(), doctorId: user.id, doctor: { name: user.name, crm: user.crm || '', uf: user.uf || '' }, patient: '', cns: '', date: new Date().toLocaleDateString('en-CA'), requester: '', requesterCrm: '', requesterUf: '', procedure: '', exam: examTypes[0], specification: '', equipment: '', description: '', impression: '', assessment: '', justification: '', images: [], status: 'draft', updatedAt: new Date().toISOString() };
}
