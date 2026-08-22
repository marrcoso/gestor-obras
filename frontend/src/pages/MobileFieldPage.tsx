import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  Camera,
  Receipt,
  Check,
  Building2,
  WifiOff,
  Wifi,
  Sparkles,
  DollarSign,
  ArrowRight,
  Clock
} from 'lucide-react';
import { offlineQueue } from '../services/offlineQueue.js';

export const MobileFieldPage: React.FC = () => {
  const { selectedObra, obras, setSelectedObra, isOnline, user } = useAuth();

  // Active Flow: 'home' | 'despesa' | 'foto' | 'sucesso'
  const [activeFlow, setActiveFlow] = useState<'home' | 'despesa' | 'foto' | 'sucesso'>('home');
  const [sucessoMsg, setSucessoMsg] = useState('');

  // Form Despesa Rápida
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('MATERIAL_BASICO');
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [comprovantePreview, setComprovantePreview] = useState<string | null>(null);
  const [fornecedor, setFornecedor] = useState('');

  // Form Foto Diário Rápido
  const [etapa, setEtapa] = useState('FUNDACAO_ESTRUTURA');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [observacaoFoto, setObservacaoFoto] = useState('');

  const [enviando, setEnviando] = useState(false);

  const categoriasRapidas = [
    { id: 'MATERIAL_BASICO', label: '🧱 Material Básico' },
    { id: 'MATERIAL_ACABAMENTO', label: '🎨 Acabamento' },
    { id: 'MAO_DE_OBRA_DIARIA', label: '👷 Mão de Obra' },
    { id: 'EQUIPAMENTO_LOCACAO', label: '🚜 Locação Máq.' },
    { id: 'TRANSPORTE_FRETE', label: '🚚 Frete/Caçamba' },
    { id: 'ALIMENTACAO_CAMPO', label: '🍲 Almoço/Refeição' },
    { id: 'OUTROS', label: '📦 Outros' }
  ];

  const etapasRapidas = [
    { id: 'FUNDACAO_ESTRUTURA', label: '🏗️ Fundação & Estrutura' },
    { id: 'ALVENARIA_VEDACAO', label: '🧱 Alvenaria & Paredes' },
    { id: 'COBERTURA_TELHADO', label: '🏠 Telhado & Cobertura' },
    { id: 'INSTALACOES_ELETRICA_HIDRAULICA', label: '⚡ Elétrica & Hidráulica' },
    { id: 'REVESTIMENTO_ACABAMENTO', label: '✨ Acabamento & Piso' },
    { id: 'PINTURA_VIDROS', label: '🎨 Pintura' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isDespesa: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (isDespesa) {
        setComprovanteFile(file);
        setComprovantePreview(previewUrl);
      } else {
        setFotoFile(file);
        setFotoPreview(previewUrl);
      }
    }
  };

  const handleSalvarDespesaRapida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObra || !valor) return;

    setEnviando(true);
    try {
      let comprovanteUrl = undefined;
      if (comprovanteFile && isOnline) {
        try {
          const uploadRes = await api.uploadFile(comprovanteFile, 'comprovantes');
          comprovanteUrl = uploadRes.url;
        } catch (e) {
          console.warn('Upload online falhou, salvando payload offline.');
        }
      }

      await api.createTransacao({
        obraId: selectedObra.id,
        tipo: 'DESPESA',
        categoria,
        descricao: descricao || `Despesa de Canteiro - ${categoria.replace(/_/g, ' ')}`,
        valor: Number(valor),
        fornecedorBeneficiario: fornecedor,
        comprovanteUrl: comprovanteUrl || comprovantePreview || undefined,
        origemLancamento: 'MOBILE',
        status: 'PAGO'
      });

      setSucessoMsg(isOnline ? 'Lançamento registrado com sucesso no caixa!' : 'Salvo no celular! Sincronizará quando houver sinal 3G/Wi-Fi.');
      setActiveFlow('sucesso');
      setValor('');
      setDescricao('');
      setComprovanteFile(null);
      setComprovantePreview(null);
      setFornecedor('');
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar');
    } finally {
      setEnviando(false);
    }
  };

  const handleSalvarFotoRapida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObra) return;

    setEnviando(true);
    try {
      let fotoUrl = fotoPreview || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80';

      if (fotoFile && isOnline) {
        try {
          const uploadRes = await api.uploadFile(fotoFile, 'diario');
          fotoUrl = uploadRes.url;
        } catch (e) {
          console.warn('Upload falhou, enfileirando foto local.');
        }
      }

      await api.createDiarioFoto({
        obraId: selectedObra.id,
        fotoUrl,
        etapa,
        descricao: observacaoFoto || 'Registro diário pelo mestre de obras'
      });

      setSucessoMsg(isOnline ? 'Foto registrada no Diário de Obra!' : 'Foto salva localmente! Sincronizará automaticamente com sinal.');
      setActiveFlow('sucesso');
      setFotoFile(null);
      setFotoPreview(null);
      setObservacaoFoto('');
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar foto');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px 12px' }}>
      {/* Banner Superior de Conexão */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
          borderRadius: '10px',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOnline ? <Wifi size={16} color="var(--success)" /> : <WifiOff size={16} color="var(--danger)" />}
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: isOnline ? 'var(--success)' : 'var(--danger)' }}>
            {isOnline ? 'Sinal 4G Conectado' : 'Sem Sinal (Modo Offline Ativo)'}
          </span>
        </div>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
          {user?.nome ? `👷 ${user.nome.split(' ')[0]}` : ''}
        </span>
      </div>

      {/* Seletor Rápido de Obra */}
      <div className="glass-card" style={{ padding: '14px', marginBottom: '16px' }}>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
          Você está no Canteiro:
        </span>
        <select
          className="form-select"
          style={{ marginTop: '6px', fontWeight: 700, fontSize: 'var(--text-base)' }}
          value={selectedObra?.id || ''}
          onChange={(e) => {
            const f = obras.find((o) => o.id === e.target.value);
            if (f) setSelectedObra(f);
          }}
        >
          {obras.map((o) => (
            <option key={o.id} value={o.id}>
              🏗️ {o.nome}
            </option>
          ))}
        </select>
      </div>

      {/* TELA INICIAL: BOTÕES TÁTEIS GIGANTES */}
      {activeFlow === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => setActiveFlow('despesa')}
            className="btn-field-action"
            style={{
              backgroundColor: '#dc2626',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            }}
          >
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '16px', borderRadius: '50%' }}>
              <Receipt size={36} />
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Lançar Cupom / Despesa</span>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 400, opacity: 0.9, marginTop: '2px' }}>
                Foto do recibo + valor em 3 toques
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveFlow('foto')}
            className="btn-field-action"
            style={{
              backgroundColor: '#2563eb',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            }}
          >
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '16px', borderRadius: '50%' }}>
              <Camera size={36} />
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Tirar Foto da Evolução</span>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 400, opacity: 0.9, marginTop: '2px' }}>
                Salvar avanço no Diário da Obra
              </p>
            </div>
          </button>
        </div>
      )}

      {/* FLUXO: LANÇAR DESPESA RÁPIDA */}
      {activeFlow === 'despesa' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>🧾 Lançamento Rápido</h3>
            <button
              onClick={() => setActiveFlow('home')}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
            >
              Voltar
            </button>
          </div>

          <form onSubmit={handleSalvarDespesaRapida}>
            {/* Foto do Cupom */}
            <div className="form-group">
              <label className="form-label">1. Foto do Cupom / Recibo:</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="form-input"
                onChange={(e) => handleFileChange(e, true)}
              />
              {comprovantePreview && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  <img
                    src={comprovantePreview}
                    alt="Preview"
                    style={{ maxHeight: '140px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>

            {/* Campo Gigante de Valor */}
            <div className="form-group">
              <label className="form-label">2. Valor Pago (R$) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, textAlign: 'center', padding: '14px' }}
                placeholder="R$ 0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Chips de Categorias Rápidas */}
            <div className="form-group">
              <label className="form-label">3. Categoria:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {categoriasRapidas.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoria(cat.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      border: `1px solid ${categoria === cat.id ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: categoria === cat.id ? 'var(--primary-light)' : 'var(--bg-input)',
                      color: categoria === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição Opcional */}
            <div className="form-group">
              <label className="form-label">4. Descrição (opcional):</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: 50 sacos de areia grossa"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={enviando || !valor}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '12px', fontWeight: 800 }}
            >
              {enviando ? 'Gravando...' : '💾 Salvar Lançamento'}
            </button>
          </form>
        </div>
      )}

      {/* FLUXO: FOTO DIÁRIO RÁPIDO */}
      {activeFlow === 'foto' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>📸 Foto do Diário</h3>
            <button
              onClick={() => setActiveFlow('home')}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
            >
              Voltar
            </button>
          </div>

          <form onSubmit={handleSalvarFotoRapida}>
            <div className="form-group">
              <label className="form-label">1. Câmera / Selecionar Imagem *</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="form-input"
                onChange={(e) => handleFileChange(e, false)}
                required
              />
              {fotoPreview && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">2. Etapa Atual:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {etapasRapidas.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => setEtapa(et.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      border: `1px solid ${etapa === et.id ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: etapa === et.id ? 'var(--primary-light)' : 'var(--bg-input)',
                      color: etapa === et.id ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {et.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">3. Observação do Dia (opcional):</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Ex: Concluída concretagem dos pilares do térreo."
                value={observacaoFoto}
                onChange={(e) => setObservacaoFoto(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '12px', fontWeight: 800 }}
            >
              {enviando ? 'Gravando...' : '📷 Salvar Foto'}
            </button>
          </form>
        </div>
      )}

      {/* FLUXO: SUCESSO */}
      {activeFlow === 'sucesso' && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
          >
            <Check size={36} color="#10b981" />
          </div>

          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Registro Concluído!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '24px' }}>{sucessoMsg}</p>

          <button
            onClick={() => setActiveFlow('home')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontWeight: 700 }}
          >
            Fazer Novo Registro
          </button>
        </div>
      )}
    </div>
  );
};
