import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertReportEdit, validateReport, newReport } from '../src/lib/reports.js';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const doctor = { id: 'doctor', name: 'Médico teste', role: 'user', crm: '1234', uf: 'BA' };
test('clinical content belongs only to the responsible doctor and is locked after review', () => {
  const report = newReport(doctor);
  assert.doesNotThrow(() => assertReportEdit(doctor, report));
  assert.throws(() => assertReportEdit({ id: 'admin', role: 'admin' }, report), /Somente/);
  assert.throws(() => assertReportEdit({ id: 'other', role: 'user' }, report), /Somente/);
  assert.throws(() => assertReportEdit(doctor, { ...report, status: 'ready' }), /bloqueado/);
});
test('review requires clinical fields and CRM, while draft can remain incomplete', () => {
  const report = newReport(doctor);
  assert.throws(() => validateReport(report), /obrigatórios/);
  Object.assign(report, { patient: 'Paciente fictício', equipment: 'Equipamento teste', description: 'Texto de teste', impression: 'Texto de teste', assessment: 'Adequado' });
  assert.doesNotThrow(() => validateReport(report));
  assert.throws(() => validateReport({ ...report, doctor: { ...doctor, crm: '' } }), /CRM/);
});
