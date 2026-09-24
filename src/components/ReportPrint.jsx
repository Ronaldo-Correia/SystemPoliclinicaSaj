import React, { useEffect, useState } from 'react';
export function ReportImage({ image }) {
  const [url, setUrl] = useState('');
  useEffect(() => { const next = URL.createObjectURL(image.blob); setUrl(next); return () => URL.revokeObjectURL(next); }, [image.blob]);
  return <img src={url} alt={image.caption || image.name} />;
}
export default function ReportPrint({ report }) {
  const groups = [];
  for (let i = 0; i < report.images.length; i += 4) groups.push(report.images.slice(i, i+4));
  return <div className="print-document"><article className="paper"><header className="institution"><strong>RECONVALE</strong><div><h2>POLICLÍNICA</h2><span>REGIONAL DE SAÚDE · SAJ</span></div><strong>BAHIA<br /><small>Secretaria da Saúde</small></strong></header><div className="report-identification"><div><p><b>Executante:</b> {report.doctor.name}</p><p><b>Solicitante:</b> {report.requester || '—'}</p><p><b>Paciente:</b> {report.patient || '—'}</p><p><b>CNS:</b> {report.cns || '—'}</p></div><div><p><b>Nº do laudo:</b> {report.number}</p><p><b>Data do atendimento:</b> {report.date?.split('-').reverse().join('/')}</p></div></div><h2 className="exam-title">{report.exam} {report.specification && '· '+report.specification}</h2>{[['EQUIPAMENTO',report.equipment],['DESCRIÇÃO',report.description],['IMPRESSÃO DIAGNÓSTICA',report.impression]].map(([title,value]) => <section className="clinical-section" key={title}><h3>{title}</h3><p>{value || 'Não preenchido'}</p></section>)}<footer className="signature-area"><strong>{report.doctor.name}</strong><p>CRM {report.doctor.uf || '—'} {report.doctor.crm || '—'}</p><small>Documento sem assinatura digital · protótipo</small></footer></article>{groups.map((images,index) => <article className="paper annex" key={index}><header><h2>Imagens do exame · Anexo {index+1}/{groups.length}</h2><p>{report.patient} · {report.number} · {report.exam}</p></header><div className="annex-grid">{images.map((image,i) => <figure key={image.id}><ReportImage image={image} /><figcaption>{index*4+i+1}. {image.caption || image.name}</figcaption></figure>)}</div></article>)}</div>;
}
