import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { FormInput, FormSelect } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  HardHat,
  Database
} from 'lucide-react';

const ESTADOS_BRASIL = [
  { value: 'SP', label: 'São Paulo (SP)' },
  { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
  { value: 'MG', label: 'Minas Gerais (MG)' },
  { value: 'RS', label: 'Rio Grande do Sul (RS)' },
  { value: 'PR', label: 'Paraná (PR)' },
  { value: 'SC', label: 'Santa Catarina (SC)' },
  { value: 'BA', label: 'Bahia (BA)' },
  { value: 'PE', label: 'Pernambuco (PE)' },
  { value: 'CE', label: 'Ceará (CE)' },
  { value: 'GO', label: 'Goiás (GO)' },
  { value: 'DF', label: 'Distrito Federal (DF)' },
  { value: 'ES', label: 'Espírito Santo (ES)' },
  { value: 'MT', label: 'Mato Grosso (MT)' },
  { value: 'MS', label: 'Mato Grosso do Sul (MS)' },
  { value: 'AM', label: 'Amazonas (AM)' },
  { value: 'PA', label: 'Pará (PA)' },
  { value: 'RN', label: 'Rio Grande do Norte (RN)' },
  { value: 'PB', label: 'Paraíba (PB)' },
  { value: 'AL', label: 'Alagoas (AL)' },
  { value: 'SE', label: 'Sergipe (SE)' },
  { value: 'PI', label: 'Piauí (PI)' },
  { value: 'MA', label: 'Maranhão (MA)' },
  { value: 'TO', label: 'Tocantins (TO)' },
  { value: 'RO', label: 'Rondônia (RO)' },
  { value: 'AC', label: 'Acre (AC)' },
  { value: 'AP', label: 'Amapá (AP)' },
  { value: 'RR', label: 'Roraima (RR)' }
];

const SEGMENTOS_CONSTRUCAO = [
  { value: 'RESIDENCIAL_CASAS', label: 'Construção Residencial (Casas & Condomínios)' },
  { value: 'EDIFICACOES_INCORPORACAO', label: 'Edifícios & Incorporação Imobiliária' },
  { value: 'REFORMAS_INTERIORES', label: 'Reformas Comerciais & Residenciais' },
  { value: 'COMERCIAL_GALPOES', label: 'Obras Comerciais & Galpões Industriais' },
  { value: 'EMPREITEIRO_CANTEIRO', label: 'Empreiteiro / Prestador de Mão de Obra' },
  { value: 'ENGENHARIA_CONSULTORIA', label: 'Engenharia Civil & Gerenciamento de Projetos' }
];

// Helper para máscara de telefone/WhatsApp
const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Estados do formulário
  const [nomeConstrutora, setNomeConstrutora] = useState('');
  const [estadoUf, setEstadoUf] = useState('SP');
  const [segmentoAtuacao, setSegmentoAtuacao] = useState('RESIDENCIAL_CASAS');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [aceitouTermos, setAceitouTermos] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validações em tempo real
  const isPasswordValid = senha.length >= 6;
  const doPasswordsMatch = senha.length > 0 && senha === confirmarSenha;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefoneWhatsapp(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nomeConstrutora.trim()) {
      setError('Por favor, informe o nome da sua Construtora ou Empreiteira.');
      return;
    }

    if (!nomeUsuario.trim()) {
      setError('Por favor, informe o nome completo do responsável.');
      return;
    }

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail profissional.');
      return;
    }

    if (!isPasswordValid) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (!aceitouTermos) {
      setError('Você precisa concordar com os Termos de Uso para criar sua conta.');
      return;
    }

    setLoading(true);
    try {
      await register(
        {
          nomeConstrutora: nomeConstrutora.trim(),
          nomeUsuario: nomeUsuario.trim(),
          email: email.trim(),
          senha,
          telefoneWhatsapp: telefoneWhatsapp.trim() || undefined,
          estadoUf,
          segmentoAtuacao
        },
        rememberDevice
      );
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header do Card de Cadastro com Badge de Trial */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-xs">
            <Sparkles size={13} className="text-brand animate-pulse" />
            <span>7 Dias de Teste Grátis • Sem Cartão</span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-tech/10 text-tech flex items-center justify-center font-bold">
              <Building2 size={16} />
            </div>
            <h2 className="font-headline text-fluid-section font-bold text-content-main tracking-tight">
              Cadastre sua Construtora
            </h2>
          </div>
          <p className="font-body text-fluid-caption text-content-muted">
            Configure seu ambiente multi-tenant e gerencie obras, canteiro e SINAPI em minutos.
          </p>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="flex items-start gap-2.5 bg-status-late-bg text-status-late border border-status-late/30 p-3 rounded-lg text-xs font-medium mb-4 animate-modal-in">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário de Cadastro */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Seção 1: Dados da Construtora / Empresa */}
          <div>
            <span className="font-body text-[10px] font-bold text-content-dim uppercase tracking-wider block mb-2">
              1. DADOS DA CONSTRUTORA & REGIONAL
            </span>

            <FormInput
              label="Nome da Construtora / Empreiteira"
              type="text"
              value={nomeConstrutora}
              onChange={(e) => setNomeConstrutora(e.target.value)}
              placeholder="Ex: Alfa Engenharia & Construção"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FormSelect
                  label="UF Principal de Obras"
                  value={estadoUf}
                  onChange={(e) => setEstadoUf(e.target.value)}
                  options={ESTADOS_BRASIL}
                  required
                />
                <span className="text-[10px] text-tech font-medium flex items-center gap-1 -mt-2 mb-2">
                  <Database size={11} />
                  Calibra SINAPI para {estadoUf}
                </span>
              </div>

              <FormSelect
                label="Segmento de Atuação"
                value={segmentoAtuacao}
                onChange={(e) => setSegmentoAtuacao(e.target.value)}
                options={SEGMENTOS_CONSTRUCAO}
                required
              />
            </div>
          </div>

          {/* Seção 2: Dados do Responsável / Gestor */}
          <div className="pt-2.5 border-t border-border-light">
            <span className="font-body text-[10px] font-bold text-content-dim uppercase tracking-wider block mb-2">
              2. GESTOR ADMINISTRADOR DA CONTA
            </span>

            <FormInput
              label="Nome Completo do Responsável"
              type="text"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="Ex: Eng. Carlos Silva"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="E-mail Profissional"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@construtora.com"
                autoComplete="email"
                required
              />

              <FormInput
                label="WhatsApp com DDD"
                type="tel"
                value={telefoneWhatsapp}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                helperText="Para alertas e relatórios de canteiro"
                required
              />
            </div>
          </div>

          {/* Seção 3: Senha e Confirmação */}
          <div className="pt-2.5 border-t border-border-light">
            <span className="font-body text-[10px] font-bold text-content-dim uppercase tracking-wider block mb-2">
              3. SEGURANÇA DE ACESSO
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Senha de Acesso"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />

              <FormInput
                label="Confirmar Senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Checklist Visual de Validação de Senha */}
            <div className="flex items-center gap-4 text-[11px] -mt-1 mb-2 px-1">
              <span
                className={`flex items-center gap-1 font-medium ${
                  isPasswordValid ? 'text-status-paid' : 'text-content-dim'
                }`}
              >
                <CheckCircle2 size={12} className={isPasswordValid ? 'text-status-paid' : 'text-content-dim/50'} />
                Mínimo 6 dígitos
              </span>
              <span
                className={`flex items-center gap-1 font-medium ${
                  doPasswordsMatch ? 'text-status-paid' : 'text-content-dim'
                }`}
              >
                <CheckCircle2 size={12} className={doPasswordsMatch ? 'text-status-paid' : 'text-content-dim/50'} />
                Senhas conferem
              </span>
            </div>
          </div>

          {/* Destaques de Proposta de Valor do ERP */}
          <div className="bg-surface-low border border-border-light rounded-lg p-3 my-1 grid grid-cols-2 gap-2 text-[11px] text-content-muted">
            <div className="flex items-center gap-1.5">
              <HardHat size={14} className="text-brand flex-shrink-0" />
              <span>Até 3 obras ativas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone size={14} className="text-tech flex-shrink-0" />
              <span>Canteiro Mobile Offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database size={14} className="text-amber-500 flex-shrink-0" />
              <span>Base SINAPI Caixa Oficial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-status-paid flex-shrink-0" />
              <span>Multi-Tenant Isolado</span>
            </div>
          </div>

          {/* Opção Lembrar deste Dispositivo */}
          <label className="flex items-center gap-2 text-xs text-content-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="rounded border-border text-brand focus:ring-brand"
            />
            <span>Lembrar deste dispositivo para acessos rápidos futuros</span>
          </label>

          {/* Termos de Uso */}
          <label className="flex items-start gap-2 text-xs text-content-muted cursor-pointer my-1 select-none">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              className="mt-0.5 rounded border-border text-brand focus:ring-brand"
            />
            <span>
              Concordo com os Termos de Uso e Política de Privacidade da plataforma.
            </span>
          </label>

          {/* Botão de Criação de Conta */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="shadow-primary mt-1"
          >
            Criar Conta & Iniciar Teste Grátis
          </Button>
        </form>
      </div>

      {/* Link para Página de Login */}
      <div className="text-center pt-5 mt-5 border-t border-border-light">
        <p className="font-body text-fluid-caption text-content-muted">
          Já possui uma conta cadastrada?{' '}
          <Link
            to="/login"
            className="text-brand font-bold hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
          >
            Fazer Login
            <ArrowRight size={13} />
          </Link>
        </p>
      </div>
    </div>
  );
};
