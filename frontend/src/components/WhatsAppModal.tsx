import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Copy, Check } from 'lucide-react';
import { api } from '../services/api.js';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <MessageSquare size={18} color="#25D366" />
            </div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>Lembrete de Cobrança WhatsApp</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Gerando mensagem inteligente...</p>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Telefone WhatsApp do Cliente:</label>
                <input
                  type="text"
                  className="form-input"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Texto da Mensagem:</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="btn"
                  style={{
                    flex: 1.5,
                    backgroundColor: '#25D366',
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  <Send size={16} />
                  Enviar no WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
