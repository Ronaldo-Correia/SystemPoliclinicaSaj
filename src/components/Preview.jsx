import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { list, save, canAccess, importFolder, removeDocument } from '../lib/localStore';
import Modal from '../components/Modal';
export default function Preview({ document, close }) {
  const [url, setUrl] = useState('');
  const extension = document.name.split('.').pop().toLowerCase();
  const type = document.type || ({ pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }[extension] || 'application/octet-stream');
  useEffect(() => {
    if (!document.blob) return;
    const next = URL.createObjectURL(document.blob.slice(0, document.blob.size, type));
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [document, type]);
  const image = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(type);
  return <Modal title={document.name} close={close}>{!url ? <p>Arquivo indisponível.</p> : <><div className="preview">{type === 'application/pdf' ? <iframe title={document.name} src={url} /> : image ? <img src={url} alt={document.name} /> : <p>Este formato não possui prévia. Baixe o arquivo para abri-lo no programa adequado.</p>}</div><a className="button" href={url} download={document.name}>Baixar arquivo</a><p className="muted">Se a prévia não aparecer no seu navegador, use o download.</p></>}</Modal>;
}
