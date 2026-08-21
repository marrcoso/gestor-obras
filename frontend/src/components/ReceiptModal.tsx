import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface ReceiptModalProps {
  url: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith('.pdf');
  const fullUrl = url.startsWith('http') ? url : `http://localhost:3001${url}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '700px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <h3 style={{ fontSize: '16px' }}>Comprovante Fiscal / Recibo</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              <ExternalLink size={14} /> Abrir Original
            </a>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
          {isPdf ? (
            <iframe src={fullUrl} style={{ width: '100%', height: '500px', border: 'none' }} title="PDF" />
          ) : (
            <img
              src={fullUrl}
              alt="Comprovante"
              style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
