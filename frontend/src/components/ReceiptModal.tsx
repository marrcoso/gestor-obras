import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Modal } from './ui/Modal.js';
import { Button } from './ui/Button.js';

interface ReceiptModalProps {
  url: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith('.pdf');
  const fullUrl = url;

  return (
    <Modal
      isOpen={!!url}
      onClose={onClose}
      title="Comprovante Fiscal / Recibo"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <a href={fullUrl} target="_blank" rel="noreferrer" className="no-underline">
            <Button variant="secondary" size="sm" icon={ExternalLink}>
              Abrir Original
            </Button>
          </a>
        </div>

        <div className="p-4 flex justify-center bg-surface-low rounded-lg border border-border">
          {isPdf ? (
            <iframe src={fullUrl} className="w-full h-[500px] border-none rounded" title="PDF" />
          ) : (
            <img
              src={fullUrl}
              alt="Comprovante"
              className="max-w-full max-h-[560px] object-contain rounded shadow-sm"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
