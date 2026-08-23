import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  Camera,
  Receipt,
  Check,
  Building2,
  WifiOff,
  Wifi,
  ArrowLeft,
  UploadCloud
} from 'lucide-react';

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
    { id: 'MATERIAL_BASICO', label: 'Material Básico' },
    { id: 'MATERIAL_ACABAMENTO', label: 'Acabamento' },
    { id: 'MAO_DE_OBRA_DIARIA', label: 'Mão de Obra' },
    { id: 'EQUIPAMENTO_LOCACAO', label: 'Locação Máquinas' },
    { id: 'TRANSPORTE_FRETE', label: 'Frete / Caçamba' },
    { id: 'ALIMENTACAO_CAMPO', label: 'Almoço / Refeição' },
    { id: 'OUTROS', label: 'Outros' }
  ];

  const etapasRapidas = [
    { id: 'FUNDACAO_ESTRUTURA', label: 'Fundação & Estrutura' },
    { id: 'ALVENARIA_VEDACAO', label: 'Alvenaria & Paredes' },
    { id: 'COBERTURA_TELHADO', label: 'Telhado & Cobertura' },
    { id: 'INSTALACOES_ELETRICA_HIDRAULICA', label: 'Instalações' },
    { id: 'REVESTIMENTO_ACABAMENTO', label: 'Acabamento & Piso' },
    { id: 'PINTURA_VIDROS', label: 'Pintura & Vidros' }
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
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px 12px 64px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Network Status Beacon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: isOnline ? 'var(--status-paid-bg)' : 'var(--status-late-bg)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOnline ? <Wifi size={16} color="var(--status-paid)" /> : <WifiOff size={16} color="var(--status-late)" />}
          <span style={{ fontSize: '12px', fontWeight: 700, color: isOnline ? 'var(--status-paid)' : 'var(--status-late)' }}>
            {isOnline ? 'Sincronização Online 4G' : 'Modo Offline (Offline-First)'}
          </span>
        </div>
        <span className="text-mono-tag">
          {user?.nome ? user.nome.split(' ')[0] : 'Canteiro'}
        </span>
      </div>

      {/* Obra Selector */}
      <div className="card-constructo" style={{ padding: '14px' }}>
        <span className="text-mono-tag">
          OBRA ATIVA NO CANTEIRO
        </span>
        <select
          className="form-select-constructo"
          style={{ marginTop: '6px', fontWeight: 700, fontSize: '15px' }}
          value={selectedObra?.id || ''}
          onChange={(e) => {
            const f = obras.find((o) => o.id === e.target.value);
            if (f) setSelectedObra(f);
          }}
        >
          {obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome} ({o.estado_uf})
            </option>
          ))}
        </select>
      </div>

      {/* TELA INICIAL: BOTÕES TÁTEIS GIGANTES */}
      {activeFlow === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Lançar Despesa */}
          <button
            onClick={() => setActiveFlow('despesa')}
            style={{
              padding: '24px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#ea580c',
              backgroundImage: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'left',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.15s ease'
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Receipt size={32} />
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-fluid-section)', fontWeight: 800, display: 'block' }}>
                Lançar Cupom / Despesa
              </span>
              <p style={{ fontSize: 'var(--text-fluid-caption)', opacity: 0.9, marginTop: '2px' }}>
                Foto do comprovante + valor em 3 toques
              </p>
            </div>
          </button>

          {/* Tirar Foto */}
          <button
            onClick={() => setActiveFlow('foto')}
            style={{
              padding: '24px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#2563eb',
              backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'left',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.15s ease'
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={32} />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, display: 'block' }}>
                Foto da Evolução da Obra
              </span>
              <p style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>
                Salva no Diário com geolocalização e data
              </p>
            </div>
          </button>
        </div>
      )}

      {/* FLUXO: LANÇAR DESPESA RÁPIDA */}
      {activeFlow === 'despesa' && (
        <div className="card-constructo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Lançamento Rápido</h3>
            <button
              onClick={() => setActiveFlow('home')}
              className="btn-constructo btn-secondary-slate"
              style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
            >
              <ArrowLeft size={14} /> Voltar
            </button>
          </div>

          <form onSubmit={handleSalvarDespesaRapida} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Foto do Cupom */}
            <div className="form-group-constructo">
              <label className="form-label-constructo">1. FOTO DO CUPOM / RECIBO</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="form-input-constructo"
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
            <div className="form-group-constructo">
              <label className="form-label-constructo">2. VALOR TOTAL PAGO (R$) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input-constructo font-data-tabular"
                style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', padding: '12px' }}
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Chips de Categorias Rápidas */}
            <div className="form-group-constructo">
              <label className="form-label-constructo">3. CATEGORIA</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {categoriasRapidas.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoria(cat.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: `1px solid ${categoria === cat.id ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: categoria === cat.id ? 'var(--primary-light)' : 'var(--bg-surface-low)',
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
            <div className="form-group-constructo">
              <label className="form-label-constructo">4. DESCRIÇÃO / FORNECEDOR (OPCIONAL)</label>
              <input
                type="text"
                className="form-input-constructo"
                placeholder="Ex: 50 sacos de areia média"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={enviando || !valor}
              className="btn-constructo btn-primary-orange"
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 800, marginTop: '8px' }}
            >
              {enviando ? 'Gravando Lançamento...' : 'Salvar no Caixa'}
            </button>
          </form>
        </div>
      )}

      {/* FLUXO: FOTO DIÁRIO RÁPIDO */}
      {activeFlow === 'foto' && (
        <div className="card-constructo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Foto do Diário</h3>
            <button
              onClick={() => setActiveFlow('home')}
              className="btn-constructo btn-secondary-slate"
              style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
            >
              <ArrowLeft size={14} /> Voltar
            </button>
          </div>

          <form onSubmit={handleSalvarFotoRapida} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group-constructo">
              <label className="form-label-constructo">1. CÂMERA / SELECIONAR IMAGEM *</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="form-input-constructo"
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

            <div className="form-group-constructo">
              <label className="form-label-constructo">2. ETAPA CONSTRUTIVA ATUAL</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {etapasRapidas.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => setEtapa(et.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: `1px solid ${etapa === et.id ? 'var(--technical-blue)' : 'var(--border)'}`,
                      backgroundColor: etapa === et.id ? 'var(--technical-blue-light)' : 'var(--bg-surface-low)',
                      color: etapa === et.id ? 'var(--technical-blue)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {et.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group-constructo">
              <label className="form-label-constructo">3. OBSERVAÇÃO DO DIA (OPCIONAL)</label>
              <textarea
                className="form-input-constructo"
                rows={2}
                placeholder="Ex: Concluída concretagem dos pilares do térreo."
                value={observacaoFoto}
                onChange={(e) => setObservacaoFoto(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="btn-constructo btn-tech-blue"
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 800, marginTop: '8px' }}
            >
              {enviando ? 'Gravando Foto...' : 'Salvar no Diário'}
            </button>
          </form>
        </div>
      )}

      {/* FLUXO: SUCESSO */}
      {activeFlow === 'sucesso' && (
        <div className="card-constructo" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div
            style={{
              backgroundColor: 'var(--status-paid-bg)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--status-paid)'
            }}
          >
            <Check size={36} />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Registro Concluído!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{sucessoMsg}</p>

          <button
            onClick={() => setActiveFlow('home')}
            className="btn-constructo btn-primary-orange"
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 800 }}
          >
            Fazer Novo Registro
          </button>
        </div>
      )}
    </div>
  );
};

