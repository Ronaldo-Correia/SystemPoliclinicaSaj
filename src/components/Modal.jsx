import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { list, save, canAccess, importFolder, removeDocument } from '../lib/localStore';
export default function Modal({ title, close, children }) {
  const ref = React.useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} onCancel={close}><header><h2>{title}</h2><button aria-label="Fechar" onClick={close}>✕</button></header>{children}</dialog>;
}
