import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Copy, Check } from 'lucide-react';
import { api } from '../services/api.js';
import { Modal } from './ui/Modal.js';
import { FormInput, FormTextarea } from './ui/Input.js';
import { Button } from './ui/Button.js';
import { LoadingState } from './ui/LoadingState.js';

interface WhatsAppModalProps {
  contaId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ contaId, onClose, onSuccess }) => {
  const [mensagem, setMensagem] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!contaId) return;

    api.getWhatsappCobrancaMessage(contaId)
      .then((data) => {
        setMensagem(data.mensagem);
        setTelefone(data.telefone || '');
      })
      .finally(() => setLoading(false));
  }, [contaId]);

  if (!contaId) return null;

  const handleSendWhatsApp = () => {
    const rawNumber = telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${rawNumber}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    onSuccess();
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mensagem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={!!contaId}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
            <MessageSquare size={16} />
          </div>
          <span>Lembrete de Cobrança WhatsApp</span>
        </div>
      }
      size="md"
    >
      {loading ? (
        <LoadingState message="Gerando mensagem de cobrança inteligente..." minHeight="180px" />
      ) : (
        <div className="flex flex-col gap-3.5">
          <FormInput
            label="Telefone WhatsApp do Cliente"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Ex: (11) 99999-9999"
          />

          <FormTextarea
            label="Texto da Mensagem"
            rows={5}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />

          <div className="flex gap-2.5 mt-2">
            <Button
              type="button"
              variant="secondary"
              icon={copied ? Check : Copy}
              onClick={handleCopy}
              className="flex-1"
            >
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </Button>

            <Button
              type="button"
              variant="whatsapp"
              icon={Send}
              onClick={handleSendWhatsApp}
              className="flex-[1.5]"
            >
              Enviar no WhatsApp
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
