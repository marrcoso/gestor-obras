import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { NetworkBeacon } from '../components/domain/canteiro/NetworkBeacon.js';
import { TactileActionCard } from '../components/domain/canteiro/TactileActionCard.js';
import { FormInput, FormGroup, FormTextarea } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import {
  Camera,
  Receipt,
  Check,
  Building2,
  ArrowLeft
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
        etapa: etapa as any,
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
      <NetworkBeacon isOnline={isOnline} />

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
          <TactileActionCard
            icon={Receipt}
            title="Lançar Cupom / Despesa"
            subtitle="Foto do comprovante + valor em 3 toques"
            variant="orange"
            onClick={() => setActiveFlow('despesa')}
          />

          <TactileActionCard
            icon={Camera}
            title="Foto da Evolução da Obra"
            subtitle="Salva no Diário com geolocalização e data"
            variant="blue"
            onClick={() => setActiveFlow('foto')}
          />
        </div>
      )}

      {/* FLUXO: LANÇAR DESPESA RÁPIDA */}
      {activeFlow === 'despesa' && (
        <div className="card-constructo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="heading-card" style={{ fontSize: '18px' }}>Lançamento Rápido</h3>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setActiveFlow('home')}
            >
              Voltar
            </Button>
          </div>

          <form onSubmit={handleSalvarDespesaRapida} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Foto do Cupom */}
            <FormGroup label="1. FOTO DO CUPOM / RECIBO">
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
            </FormGroup>

            {/* Campo Gigante de Valor */}
            <FormInput
              label="2. VALOR TOTAL PAGO (R$) *"
              type="number"
              step="0.01"
              style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', padding: '12px' }}
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              autoFocus
            />

            {/* Chips de Categorias Rápidas */}
            <FormGroup label="3. CATEGORIA">
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
            </FormGroup>

            {/* Descrição Opcional */}
            <FormInput
              label="4. DESCRIÇÃO / FORNECEDOR (OPCIONAL)"
              placeholder="Ex: 50 sacos de areia média"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={enviando}
              disabled={!valor}
            >
              {enviando ? 'Gravando Lançamento...' : 'Salvar no Caixa'}
            </Button>
          </form>
        </div>
      )}

      {/* FLUXO: FOTO DIÁRIO RÁPIDO */}
      {activeFlow === 'foto' && (
        <div className="card-constructo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="heading-card" style={{ fontSize: '18px' }}>Foto do Diário</h3>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setActiveFlow('home')}
            >
              Voltar
            </Button>
          </div>

          <form onSubmit={handleSalvarFotoRapida} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormGroup label="1. CÂMERA / SELECIONAR IMAGEM *" required>
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
            </FormGroup>

            <FormGroup label="2. ETAPA CONSTRUTIVA ATUAL">
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
            </FormGroup>

            <FormTextarea
              label="3. OBSERVAÇÃO DO DIA (OPCIONAL)"
              placeholder="Ex: Concluída concretagem dos pilares do térreo."
              value={observacaoFoto}
              onChange={(e) => setObservacaoFoto(e.target.value)}
            />

            <Button
              type="submit"
              variant="tech-blue"
              size="lg"
              fullWidth
              isLoading={enviando}
            >
              {enviando ? 'Gravando Foto...' : 'Salvar no Diário'}
            </Button>
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

          <h3 className="heading-section" style={{ color: 'var(--text-main)', marginBottom: '8px' }}>
            Registro Concluído!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{sucessoMsg}</p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setActiveFlow('home')}
          >
            Fazer Novo Registro
          </Button>
        </div>
      )}
    </div>
  );
};
