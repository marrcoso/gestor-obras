import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { TeamMember, ActivityLog } from '../types/index.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Button } from '../components/ui/Button.js';
import { FormInput } from '../components/ui/Input.js';
import { Modal } from '../components/ui/Modal.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import {
  User as UserIcon,
  Shield,
  Building2,
  Users,
  History,
  Lock,
  Mail,
  Check,
  Plus,
  Crown,
  Key,
  Copy,
  CheckCircle2,
  XCircle,
  Download,
  BellRing,
  Layers,
  Sparkles
} from 'lucide-react';

export const UsuarioPage: React.FC = () => {
  const { user, tenant, updateUser, updateTenant, obras } = useAuth();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'COMPANY' | 'TEAM' | 'AUDIT'>('PROFILE');

  // Estados de Perfil
  const [nome, setNome] = useState(user?.nome || '');
  const [telefone, setTelefone] = useState(user?.telefone_whatsapp || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados de Segurança / Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados da Empresa / Construtora
  const [nomeFantasia, setNomeFantasia] = useState(tenant?.nome_fantasia || '');
  const [razaoSocial, setRazaoSocial] = useState(tenant?.razao_social || '');
  const [cnpj, setCnpj] = useState(tenant?.cnpj || '');
  const [telefoneEmpresa, setTelefoneEmpresa] = useState(tenant?.telefone || '');
  const [emailEmpresa, setEmailEmpresa] = useState(tenant?.email_contato || '');
  const [savingTenant, setSavingTenant] = useState(false);
  const [tenantMsg, setTenantMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados de Equipe
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [novoMembroNome, setNovoMembroNome] = useState('');
  const [novoMembroEmail, setNovoMembroEmail] = useState('');
  const [novoMembroSenha, setNovoMembroSenha] = useState('');
  const [novoMembroPerfil, setNovoMembroPerfil] = useState<'ADMIN' | 'ENGENHEIRO' | 'MESTRE_OBRA'>('ENGENHEIRO');
  const [novoMembroTelefone, setNovoMembroTelefone] = useState('');
  const [savingMember, setSavingMember] = useState(false);

  // Estados de Auditoria & Preferências
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [notifInadimplencia, setNotifInadimplencia] = useState(true);
  const [notifOrcamento, setNotifOrcamento] = useState(true);
  const [notifDiario, setNotifDiario] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setTelefone(user.telefone_whatsapp || '');
    }
  }, [user]);

  useEffect(() => {
    if (tenant) {
      setNomeFantasia(tenant.nome_fantasia);
      setRazaoSocial(tenant.razao_social || '');
      setCnpj(tenant.cnpj || '');
      setTelefoneEmpresa(tenant.telefone || '');
      setEmailEmpresa(tenant.email_contato || '');
    }
  }, [tenant]);

  useEffect(() => {
    if (activeTab === 'TEAM') {
      setLoadingTeam(true);
      api.getTeamMembers()
        .then(setTeamMembers)
        .catch(console.error)
        .finally(() => setLoadingTeam(false));
    } else if (activeTab === 'AUDIT') {
      setLoadingLogs(true);
      api.getActivityLogs()
        .then(setActivityLogs)
        .catch(console.error)
        .finally(() => setLoadingLogs(false));
    }
  }, [activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await api.updateProfile({ nome, telefone_whatsapp: telefone });
      updateUser(updated);
      setProfileMsg({ type: 'success', text: 'Dados de perfil atualizados com sucesso!' });
      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Erro ao atualizar perfil' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (novaSenha !== confirmaSenha) {
      setPasswordMsg({ type: 'error', text: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }
    if (novaSenha.length < 6) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve possuir ao menos 6 caracteres.' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changePassword(senhaAtual, novaSenha);
      setPasswordMsg({ type: 'success', text: res.message || 'Senha alterada com sucesso!' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaSenha('');
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Erro ao alterar senha' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTenant(true);
    setTenantMsg(null);
    try {
      const updated = await api.updateTenant({
        nome_fantasia: nomeFantasia,
        razao_social: razaoSocial,
        cnpj,
        telefone: telefoneEmpresa,
        email_contato: emailEmpresa
      });
      updateTenant(updated);
      setTenantMsg({ type: 'success', text: 'Dados da construtora salvos com sucesso!' });
      setTimeout(() => setTenantMsg(null), 4000);
    } catch (err: any) {
      setTenantMsg({ type: 'error', text: err.message || 'Erro ao atualizar dados da empresa' });
    } finally {
      setSavingTenant(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMember(true);
    try {
      const created = await api.createTeamMember({
        nome: novoMembroNome,
        email: novoMembroEmail,
        senha: novoMembroSenha,
        perfil: novoMembroPerfil,
        telefoneWhatsapp: novoMembroTelefone
      });
      setTeamMembers((prev) => [...prev, created]);
      setIsNewMemberModalOpen(false);
      setNovoMembroNome('');
      setNovoMembroEmail('');
      setNovoMembroSenha('');
      setNovoMembroTelefone('');
      alert('Colaborador adicionado à equipe com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar colaborador');
    } finally {
      setSavingMember(false);
    }
  };

  const handleToggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const updated = await api.updateTeamMemberStatus(memberId, !currentStatus);
      setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status do colaborador');
    }
  };

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleExportData = () => {
    const data = {
      tenant,
      user,
      obrasCount: obras.length,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_erp_obras_${tenant?.nome_fantasia.replace(/\s+/g, '_').toLowerCase() || 'empresa'}.json`;
    a.click();
  };

  const getPasswordStrength = () => {
    if (!novaSenha) return { label: 'Em branco', color: 'bg-border', pct: 0 };
    if (novaSenha.length < 6) return { label: 'Muito Fraca', color: 'bg-status-late', pct: 25 };
    if (novaSenha.length < 8) return { label: 'Média', color: 'bg-status-warning', pct: 50 };
    const hasNum = /\d/.test(novaSenha);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(novaSenha);
    if (hasNum && hasSpecial) return { label: 'Excelente', color: 'bg-status-paid', pct: 100 };
    return { label: 'Boa', color: 'bg-tech', pct: 75 };
  };

  const passwordStrength = getPasswordStrength();
  const obrasAtivasCount = obras.filter((o) => o.status === 'EM_ANDAMENTO').length || obras.length;
  const maxObras = tenant?.max_obras_ativas || 10;
  const obrasPct = Math.min(100, Math.round((obrasAtivasCount / maxObras) * 100));

  const tabs = [
    { key: 'PROFILE', label: 'Meu Perfil', icon: UserIcon },
    { key: 'SECURITY', label: 'Segurança & Senha', icon: Shield },
    { key: 'COMPANY', label: 'Dados da Construtora', icon: Building2 },
    { key: 'TEAM', label: 'Equipe & Acessos', icon: Users },
    { key: 'AUDIT', label: 'Auditoria & Preferências', icon: History }
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Área do Usuário & Construtora"
        subtitle="Gerenciamento de perfil pessoal, credenciais de acesso, dados corporativos, equipe e auditoria."
      />

      {/* User Hero Overview Card */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-tech/20 border-2 border-tech/40 flex items-center justify-center text-tech font-headline font-black text-2xl shadow-inner">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg md:text-xl font-bold font-headline text-content-main">
                {user?.nome}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-tech/15 text-tech border border-tech/30">
                <Crown size={12} />
                {user?.perfil === 'ADMIN'
                  ? 'Administrador & Dono'
                  : user?.perfil === 'ENGENHEIRO'
                  ? 'Engenheiro de Obras'
                  : 'Mestre de Obras'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-content-muted flex-wrap">
              <span className="flex items-center gap-1">
                <Mail size={13} className="text-content-dim" />
                {user?.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 size={13} className="text-content-dim" />
                {tenant?.nome_fantasia}
              </span>
            </div>
          </div>
        </div>

        {/* Quick User ID Pill */}
        <div className="flex items-center gap-2 bg-surface-low border border-border px-3 py-1.5 rounded-lg text-xs self-stretch md:self-auto justify-between md:justify-start">
          <span className="text-content-dim font-mono">ID: {user?.id.slice(0, 8)}...</span>
          <button
            onClick={handleCopyUserId}
            className="text-brand hover:text-brand-hover p-1 rounded transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            title="Copiar ID do usuário"
          >
            {copiedId ? (
              <>
                <Check size={13} className="text-status-paid" />
                <span className="text-status-paid text-[11px]">Copiado</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="text-[11px]">Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-brand text-brand font-bold bg-brand/5 rounded-t-lg'
                  : 'border-transparent text-content-muted hover:text-content-main hover:bg-surface-low'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-brand' : 'text-content-dim'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: MEU PERFIL */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold font-headline text-content-main mb-4 flex items-center gap-2">
              <UserIcon size={18} className="text-brand" />
              Informações Pessoais
            </h3>

            {profileMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-status-paid/15 text-status-paid border border-status-paid/30'
                    : 'bg-status-late/15 text-status-late border border-status-late/30'
                }`}
              >
                {profileMsg.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <FormInput
                label="Nome Completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos Silva"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="E-mail de Acesso (Não alterável)"
                  value={user?.email || ''}
                  disabled
                  helperText="Vinculado à credencial mestre do sistema"
                />

                <FormInput
                  label="Telefone / WhatsApp de Contato"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: 11987654321"
                  helperText="Utilizado para notificações e alertas urgentes"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" isLoading={savingProfile}>
                  SALVAR ALTERAÇÕES
                </Button>
              </div>
            </form>
          </div>

          {/* Side Info Card */}
          <div className="bg-surface-low border border-border rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-content-main uppercase tracking-wider">
              Resumo da Conta
            </span>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-content-muted">Função:</span>
                <span className="font-bold text-content-main">{user?.perfil}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-content-muted">Status:</span>
                <span className="font-bold text-status-paid flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ativo
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-content-muted">Construtora:</span>
                <span className="font-bold text-content-main truncate max-w-[140px]">
                  {tenant?.nome_fantasia}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-content-muted">Plano Atual:</span>
                <span className="font-bold text-brand uppercase">{tenant?.plano}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SEGURANÇA & SENHA */}
      {activeTab === 'SECURITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold font-headline text-content-main mb-4 flex items-center gap-2">
              <Lock size={18} className="text-tech" />
              Alterar Senha de Acesso
            </h3>

            {passwordMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-status-paid/15 text-status-paid border border-status-paid/30'
                    : 'bg-status-late/15 text-status-late border border-status-late/30'
                }`}
              >
                {passwordMsg.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <FormInput
                label="Senha Atual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Informe sua senha atual"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FormInput
                    label="Nova Senha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  {novaSenha && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-content-dim">
                        Força: <strong className="text-content-main">{passwordStrength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <FormInput
                  label="Confirmar Nova Senha"
                  type="password"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="tech-blue" icon={Key} isLoading={savingPassword}>
                  ATUALIZAR SENHA
                </Button>
              </div>
            </form>
          </div>

          {/* Security Best Practices */}
          <div className="bg-surface-low border border-border rounded-xl p-5 flex flex-col gap-3 text-xs">
            <span className="font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={15} className="text-status-paid" />
              Diretrizes de Segurança
            </span>
            <p className="text-content-muted leading-relaxed">
              Para garantir a proteção dos dados financeiros e orçamentos de obras da construtora:
            </p>
            <ul className="list-disc pl-4 text-content-muted space-y-1.5">
              <li>Utilize senhas com combinações de letras maiúsculas, minúsculas e números.</li>
              <li>Não compartilhe credenciais mestre com a equipe de canteiro. Crie usuários dedicados na aba Equipe.</li>
              <li>Todas as senhas são armazenadas com criptografia `bcrypt` de padrão industrial.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DADOS DA CONSTRUTORA & PLANO */}
      {activeTab === 'COMPANY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold font-headline text-content-main mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-brand" />
              Dados Cadastrais da Empresa
            </h3>

            {tenantMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
                  tenantMsg.type === 'success'
                    ? 'bg-status-paid/15 text-status-paid border border-status-paid/30'
                    : 'bg-status-late/15 text-status-late border border-status-late/30'
                }`}
              >
                {tenantMsg.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>{tenantMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveTenant} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Nome Fantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Ex: Alfa Engenharia & Construções"
                  required
                />
                <FormInput
                  label="Razão Social"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Ex: Alfa Engenharia e Construções Civis Ltda"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="CNPJ"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
                <FormInput
                  label="Telefone Corporativo"
                  value={telefoneEmpresa}
                  onChange={(e) => setTelefoneEmpresa(e.target.value)}
                  placeholder="(11) 98765-4321"
                />
                <FormInput
                  label="E-mail de Contato"
                  value={emailEmpresa}
                  onChange={(e) => setEmailEmpresa(e.target.value)}
                  placeholder="contato@empresa.com.br"
                  required
                />
              </div>

              {user?.perfil === 'ADMIN' ? (
                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" isLoading={savingTenant}>
                    ATUALIZAR DADOS DA EMPRESA
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-content-dim italic">
                  * Apenas administradores podem editar os dados cadastrais da empresa.
                </p>
              )}
            </form>
          </div>

          {/* Subscription Tier Card */}
          <div className="bg-card border-2 border-brand/30 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-dim uppercase tracking-wider">
                  Assinatura ERP
                </span>
                <span className="bg-brand text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full uppercase shadow-primary">
                  PLANO {tenant?.plano}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between text-xs font-semibold text-content-main">
                  <span>Limite de Obras Ativas</span>
                  <span>{obrasAtivasCount} de {maxObras} em andamento</span>
                </div>
                <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${obrasPct}%` }}
                  />
                </div>
                <span className="text-[11px] text-content-dim text-right font-mono">
                  {obrasPct}% da capacidade contratada
                </span>
              </div>

              <div className="border-t border-border pt-3 flex flex-col gap-2 text-xs text-content-muted">
                <span className="font-bold text-content-main">Recursos Liberados:</span>
                <div className="flex items-center gap-1.5 text-content-main">
                  <Check size={14} className="text-status-paid" />
                  <span>Base SINAPI Nacional Completa</span>
                </div>
                <div className="flex items-center gap-1.5 text-content-main">
                  <Check size={14} className="text-status-paid" />
                  <span>Cobrança Automatizada via WhatsApp</span>
                </div>
                <div className="flex items-center gap-1.5 text-content-main">
                  <Check size={14} className="text-status-paid" />
                  <span>Diário Fotográfico Offline-first</span>
                </div>
              </div>
            </div>

            <Button
              variant="tech-blue"
              size="sm"
              icon={Sparkles}
              onClick={() => alert('Para upgrades de plano corporativo ou aumento de obras ativas, entre em contato com nosso suporte executivo.')}
            >
              UPGRADE DE PLANO
            </Button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EQUIPE & COLABORADORES */}
      {activeTab === 'TEAM' && (
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold font-headline text-content-main flex items-center gap-2">
                  <Users size={18} className="text-brand" />
                  Colaboradores da Construtora
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Gerencie engenheiros, gestores e mestres de obra autorizados a acessar a plataforma.
                </p>
              </div>

              {user?.perfil === 'ADMIN' && (
                <Button
                  variant="primary"
                  icon={Plus}
                  size="sm"
                  onClick={() => setIsNewMemberModalOpen(true)}
                >
                  NOVO COLABORADOR
                </Button>
              )}
            </div>

            {loadingTeam ? (
              <LoadingState message="Carregando colaboradores..." minHeight="150px" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl border border-border bg-surface-low/60 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-tech/20 border border-tech/30 flex items-center justify-center text-tech font-bold text-sm flex-shrink-0">
                        {member.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-bold text-content-main truncate">
                          {member.nome}
                        </span>
                        <span className="text-xs text-content-dim truncate">
                          {member.email}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                            {member.perfil}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              member.ativo
                                ? 'bg-status-paid/15 text-status-paid'
                                : 'bg-status-late/15 text-status-late'
                            }`}
                          >
                            {member.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {user?.perfil === 'ADMIN' && member.id !== user.id && (
                      <div className="border-t border-border/60 pt-2.5 flex justify-end">
                        <button
                          onClick={() => handleToggleMemberStatus(member.id, member.ativo)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            member.ativo
                              ? 'text-status-late hover:bg-status-late/10'
                              : 'text-status-paid hover:bg-status-paid/10'
                          }`}
                        >
                          {member.ativo ? 'Desativar Acesso' : 'Reativar Acesso'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RBAC Matrix */}
          <div className="bg-surface-low border border-border rounded-xl p-5">
            <span className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Layers size={15} className="text-tech" />
              Matriz de Permissões RBAC (Controle por Perfil)
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-content-dim font-bold uppercase text-[10px]">
                    <th className="py-2 px-3">Módulo / Recurso</th>
                    <th className="py-2 px-3 text-center">ADMIN</th>
                    <th className="py-2 px-3 text-center">ENGENHEIRO</th>
                    <th className="py-2 px-3 text-center">MESTRE DE OBRA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-content-muted">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-content-main">Painel Executivo & KPIs</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center text-content-dim">Restrito</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-content-main">Fluxo de Caixa & Transações</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center text-content-dim">Apenas Despesas de Campo</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-content-main">Radar de Inadimplência & Cobrança</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center text-content-dim">Sem Acesso</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-content-main">Orçador SINAPI & BDI</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center text-content-dim">Leitura</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-content-main">Diário de Fotos & Canteiro Mobile</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total</td>
                    <td className="py-2.5 px-3 text-center font-bold text-status-paid">Total (Otimizado)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDITORIA & PREFERÊNCIAS */}
      {activeTab === 'AUDIT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline of activity */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold font-headline text-content-main flex items-center gap-2">
              <History size={18} className="text-tech" />
              Trilha de Auditoria & Atividades Recentes
            </h3>

            {loadingLogs ? (
              <LoadingState message="Carregando registros de auditoria..." minHeight="150px" />
            ) : activityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-content-dim">
                Nenhum log de auditoria registrado até o momento.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {activityLogs.map((log) => (
                  <div key={log.id} className="relative flex flex-col gap-1">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-tech border-2 border-card" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-content-main">
                        {log.user_nome}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-surface-low text-content-muted border border-border">
                        {log.acao}
                      </span>
                    </div>
                    <p className="text-xs text-content-muted">{log.detalhes}</p>
                    <span className="text-[10px] text-content-dim">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferences & Backup */}
          <div className="flex flex-col gap-5">
            {/* Toggles */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
              <span className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                <BellRing size={15} className="text-brand" />
                Preferências de Alertas
              </span>

              <div className="flex items-center justify-between py-2 border-b border-border/60 text-xs">
                <div>
                  <div className="font-semibold text-content-main">Alertas de Inadimplência</div>
                  <div className="text-[11px] text-content-dim">Avisar sobre parcelas vencidas</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifInadimplencia}
                  onChange={(e) => setNotifInadimplencia(e.target.checked)}
                  className="w-4 h-4 text-brand rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/60 text-xs">
                <div>
                  <div className="font-semibold text-content-main">Limite de Orçamento</div>
                  <div className="text-[11px] text-content-dim">Avisar acima de 85% de gasto</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifOrcamento}
                  onChange={(e) => setNotifOrcamento(e.target.checked)}
                  className="w-4 h-4 text-brand rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 text-xs">
                <div>
                  <div className="font-semibold text-content-main">Fotos do Canteiro</div>
                  <div className="text-[11px] text-content-dim">Avisos de novos uploads</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifDiario}
                  onChange={(e) => setNotifDiario(e.target.checked)}
                  className="w-4 h-4 text-brand rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Export Data */}
            <div className="bg-surface-low border border-border rounded-xl p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                <Download size={15} className="text-tech" />
                Exportação & Backup
              </span>
              <p className="text-xs text-content-muted leading-relaxed">
                Baixe um arquivo JSON com todos os dados da construtora para auditoria externa ou segurança.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExportData}
              >
                BAIXAR BACKUP DOS DADOS
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Colaborador */}
      <Modal
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
        title="Cadastrar Novo Colaborador"
        size="md"
      >
        <form onSubmit={handleCreateMember} className="flex flex-col gap-4">
          <FormInput
            label="Nome Completo"
            value={novoMembroNome}
            onChange={(e) => setNovoMembroNome(e.target.value)}
            placeholder="Ex: Roberto Almeida"
            required
          />

          <FormInput
            label="E-mail de Login"
            type="email"
            value={novoMembroEmail}
            onChange={(e) => setNovoMembroEmail(e.target.value)}
            placeholder="roberto@alfaengenharia.com"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Senha Provisória"
              type="password"
              value={novoMembroSenha}
              onChange={(e) => setNovoMembroSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Perfil de Acesso
              </label>
              <select
                value={novoMembroPerfil}
                onChange={(e) => setNovoMembroPerfil(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-input text-content-main text-xs font-semibold outline-none focus:border-brand transition-all"
              >
                <option value="ENGENHEIRO">ENGENHEIRO</option>
                <option value="MESTRE_OBRA">MESTRE DE OBRAS</option>
                <option value="ADMIN">ADMINISTRADOR</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Telefone / WhatsApp"
            value={novoMembroTelefone}
            onChange={(e) => setNovoMembroTelefone(e.target.value)}
            placeholder="11987654321"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewMemberModalOpen(false)}
            >
              CANCELAR
            </Button>
            <Button type="submit" variant="primary" isLoading={savingMember}>
              CRIAR COLABORADOR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
