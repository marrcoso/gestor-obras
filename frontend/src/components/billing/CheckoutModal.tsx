import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { FormInput } from '../ui/Input.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatBRL } from '../../utils/formatters.js';
import {
  QrCode,
  CreditCard,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  ciclo: 'MENSAL' | 'ANUAL';
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  ciclo,
  onSuccess
}) => {
  const { user, tenant, refreshBilling } = useAuth();
  const [formaPagamento, setFormaPagamento] = useState<'PIX' | 'CARTAO'>('PIX');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados de PIX Gerado
  const [pixData, setPixData] = useState<{
    qrCodeImage?: string;
    copiaECola?: string;
    invoiceId?: string;
  } | null>(null);

  // Estados do Formulário de Cartão
  const [cardHolder, setCardHolder] = useState(user?.nome || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState(tenant?.cnpj || '');

  // Estado de Sucesso
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Máscaras de entrada
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatCardExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 4);
    if (digits.length >= 3) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    return digits;
  };

  const formatCpfCnpj = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 14);
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const planPrices: Record<string, { mensal: number; anual: number; nome: string }> = {
    STARTER: { mensal: 97, anual: 924, nome: 'Starter / Autônomo' },
    PRO: { mensal: 247, anual: 2364, nome: 'Construtora / Pro' },
    ENTERPRISE: { mensal: 497, anual: 4764, nome: 'Escala / Enterprise' }
  };

  const plan = planPrices[selectedPlan] || planPrices.PRO;
  const totalValue = ciclo === 'ANUAL' ? plan.anual : plan.mensal;

  useEffect(() => {
    if (isOpen) {
      setPixData(null);
      setIsSuccess(false);
      setErrorMsg(null);
      setFormaPagamento('PIX');
    }
  }, [isOpen, selectedPlan, ciclo]);

  // Polling em tempo real do status do PIX a cada 3 segundos
  useEffect(() => {
    let interval: any = null;

    if (isOpen && pixData?.invoiceId && !isSuccess) {
      interval = setInterval(async () => {
        try {
          const res = await api.getInvoiceStatus(pixData.invoiceId!);
          if (res.isPaid || res.invoice?.status === 'PAGO' || res.subscription?.status === 'ACTIVE') {
            setIsSuccess(true);
            await refreshBilling();
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2500);
          }
        } catch {
          // Ignora erros temporários de conexão durante polling
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, pixData?.invoiceId, isSuccess, refreshBilling, onSuccess, onClose]);

  const handleGeneratePix = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.checkoutSubscription({
        plano: selectedPlan,
        ciclo,
        formaPagamento: 'PIX'
      });

      setPixData({
        qrCodeImage: res.pix?.qrCodeImage,
        copiaECola: res.pix?.copiaECola,
        invoiceId: res.invoice?.id
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao gerar cobrança PIX');
    } finally {
      setLoading(false);
    }
  };

  const handlePayCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const [expiryMonth, expiryYear] = cardExpiry.split('/').map((s) => s.trim());

    try {
      const res = await api.checkoutSubscription({
        plano: selectedPlan,
        ciclo,
        formaPagamento: 'CARTAO',
        creditCard: {
          holderName: cardHolder,
          number: cardNumber.replace(/\D/g, ''),
          expiryMonth: expiryMonth || '12',
          expiryYear: expiryYear?.length === 2 ? `20${expiryYear}` : expiryYear || '2028',
          ccv: cardCvv
        },
        creditCardHolderInfo: {
          name: cardHolder,
          email: user?.email || tenant?.email_contato || 'cliente@gestorobras.com',
          cpfCnpj: cardCpf.replace(/\D/g, '') || '00000000000'
        }
      });

      if (res.success) {
        setIsSuccess(true);
        await refreshBilling();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2500);
      } else {
        setErrorMsg(res.message || 'Pagamento não autorizado pela operadora.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar pagamento com cartão');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateInstantPayment = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.simulatePayment({
        invoiceId: pixData?.invoiceId,
        plano: selectedPlan,
        ciclo
      });

      setIsSuccess(true);
      await refreshBilling();
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao simular aprovação');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.copiaECola) {
      navigator.clipboard.writeText(pixData.copiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col">
          <span>{isSuccess ? 'Pagamento Confirmado!' : `Ativar Plano ${plan.nome}`}</span>
          <span className="text-xs font-normal text-content-muted mt-0.5">
            {isSuccess
              ? 'Sua assinatura foi ativada com sucesso!'
              : `Cobrança ${ciclo === 'ANUAL' ? 'Anual' : 'Mensal'} • Total: ${formatBRL(totalValue)}`}
          </span>
        </div>
      }
      size="md"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-status-late/15 border border-status-late/30 rounded-xl text-xs text-status-late font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-status-paid/20 text-status-paid flex items-center justify-center border-2 border-status-paid/40 animate-scaleUp">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold font-headline text-content-main">
              Parabéns! Sua construtora está no Plano {plan.nome}
            </h3>
            <p className="text-xs text-content-muted max-w-sm">
              Todos os recursos foram desbloqueados. Sua fatura foi quitada e seu limite de obras já está ativo.
            </p>
          </div>
        ) : (
          <>
            {/* Payment Method Selector Tabs */}
            {!pixData && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormaPagamento('PIX')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    formaPagamento === 'PIX'
                      ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/20'
                      : 'border-border bg-surface-low text-content-muted hover:border-brand/40'
                  }`}
                >
                  <QrCode size={18} />
                  <span>PIX Instantâneo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormaPagamento('CARTAO')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    formaPagamento === 'CARTAO'
                      ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/20'
                      : 'border-border bg-surface-low text-content-muted hover:border-brand/40'
                  }`}
                >
                  <CreditCard size={18} />
                  <span>Cartão de Crédito</span>
                </button>
              </div>
            )}

            {/* PIX TAB CONTENT */}
            {formaPagamento === 'PIX' && (
              <div className="flex flex-col gap-4">
                {!pixData ? (
                  <div className="flex flex-col gap-4 text-center py-2">
                    <div className="bg-surface-low border border-border rounded-xl p-4 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                        <QrCode size={24} />
                      </div>
                      <span className="text-sm font-bold text-content-main">
                        Pagamento Rápido via PIX
                      </span>
                      <p className="text-xs text-content-muted max-w-xs">
                        Gere o QR Code agora para pagar em qualquer aplicativo de banco com liberação imediata.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full"
                      isLoading={loading}
                      onClick={handleGeneratePix}
                    >
                      GERAR QR CODE PIX • {formatBRL(totalValue)}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center bg-surface-low border border-border p-4 rounded-xl gap-3">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-border">
                        {pixData.qrCodeImage ? (
                          <img
                            src={pixData.qrCodeImage}
                            alt="QR Code PIX"
                            className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 object-contain"
                          />
                        ) : (
                          <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 flex items-center justify-center bg-gray-100 text-gray-500 font-mono text-xs text-center p-2">
                            QR Code PIX
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-content-dim">
                        <Clock size={13} className="text-brand" />
                        <span>Válido por 24 horas</span>
                      </div>
                    </div>

                    {/* Copia e Cola */}
                    {pixData.copiaECola && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-content-main">
                          Código PIX Copia e Cola:
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pixData.copiaECola}
                            className="w-full bg-surface-low border border-border rounded-lg px-3 py-2 text-xs font-mono text-content-muted focus:outline-none select-all truncate"
                          />
                          <Button
                            type="button"
                            variant={copied ? 'secondary' : 'primary'}
                            size="sm"
                            icon={copied ? Check : Copy}
                            onClick={handleCopyPix}
                          >
                            {copied ? 'Copiado!' : 'Copiar'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Bar with Sandbox Simulation Option */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        variant="tech-blue"
                        className="flex-1"
                        icon={Sparkles}
                        isLoading={loading}
                        onClick={handleSimulateInstantPayment}
                      >
                        SIMULAR PAGAMENTO APROVADO
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setPixData(null)}
                      >
                        <ArrowLeft size={14} />
                        <span>Voltar</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CARTAO TAB CONTENT */}
            {formaPagamento === 'CARTAO' && (
              <form onSubmit={handlePayCard} className="flex flex-col gap-3">
                <FormInput
                  label="Nome Impresso no Cartão"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Ex: CARLOS E SILVA"
                  required
                />

                <FormInput
                  label="Número do Cartão"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Validade"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                  <FormInput
                    label="CVV"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>

                <FormInput
                  label="CPF ou CNPJ do Titular"
                  value={cardCpf}
                  onChange={(e) => setCardCpf(formatCpfCnpj(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={18}
                  required
                />

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/70 mt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-content-dim">
                    <ShieldCheck size={14} className="text-status-paid" />
                    <span>Ambiente Criptografado SSL</span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                  >
                    PAGAR {formatBRL(totalValue)}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
