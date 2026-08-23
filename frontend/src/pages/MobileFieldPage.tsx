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
  ArrowLeft
} from 'lucide-react';

export const MobileFieldPage: React.FC = () => {
  const { selectedObra, obras, setSelectedObra, isOnline } = useAuth();

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
    <div className="max-w-md mx-auto p-4 pb-20 flex flex-col gap-4">
      {/* Network Status Beacon */}
      <NetworkBeacon isOnline={isOnline} />

      {/* Obra Selector */}
      <div className="bg-card border border-border rounded-lg p-3.5 shadow-sm">
        <span className="font-body text-[10px] font-bold uppercase tracking-wider text-content-dim block">
          OBRA ATIVA NO CANTEIRO
        </span>
        <select
          className="bg-input border border-border rounded-md px-3 py-2 font-headline font-bold text-sm md:text-base text-content-main w-full mt-1.5 outline-none focus:border-tech"
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
        <div className="flex flex-col gap-4">
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
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-base md:text-lg font-bold text-content-main">
              Lançamento Rápido
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setActiveFlow('home')}
            >
              Voltar
            </Button>
          </div>

          <form onSubmit={handleSalvarDespesaRapida} className="flex flex-col gap-3.5">
            {/* Foto do Cupom */}
            <FormGroup label="1. FOTO DO CUPOM / RECIBO">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="bg-input border border-border rounded-md px-3.5 py-2 font-body text-xs text-content-main w-full cursor-pointer"
                onChange={(e) => handleFileChange(e, true)}
              />
              {comprovantePreview && (
                <div className="mt-2 text-center">
                  <img
                    src={comprovantePreview}
                    alt="Preview"
                    className="max-h-36 mx-auto rounded-md object-contain border border-border"
                  />
                </div>
              )}
            </FormGroup>

            {/* Campo Gigante de Valor */}
            <FormInput
              label="2. VALOR TOTAL PAGO (R$) *"
              type="number"
              step="0.01"
              className="text-2xl font-extrabold text-center py-3 font-headline tabular-nums"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              autoFocus
            />

            {/* Chips de Categorias Rápidas */}
            <FormGroup label="3. CATEGORIA">
              <div className="grid grid-cols-2 gap-2">
                {categoriasRapidas.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoria(cat.id)}
                    className={`p-2.5 rounded-md text-xs font-semibold text-center border transition-colors cursor-pointer ${
                      categoria === cat.id
                        ? 'bg-brand/15 border-brand text-brand font-bold'
                        : 'bg-surface-low border-border text-content-muted hover:bg-surface-container'
                    }`}
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
              className="mt-2"
            >
              {enviando ? 'Gravando Lançamento...' : 'Salvar no Caixa'}
            </Button>
          </form>
        </div>
      )}

      {/* FLUXO: FOTO DIÁRIO RÁPIDO */}
      {activeFlow === 'foto' && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-base md:text-lg font-bold text-content-main">
              Foto do Diário
            </h3>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setActiveFlow('home')}
            >
              Voltar
            </Button>
          </div>

          <form onSubmit={handleSalvarFotoRapida} className="flex flex-col gap-3.5">
            <FormGroup label="1. CÂMERA / SELECIONAR IMAGEM *" required>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="bg-input border border-border rounded-md px-3.5 py-2 font-body text-xs text-content-main w-full cursor-pointer"
                onChange={(e) => handleFileChange(e, false)}
                required
              />
              {fotoPreview && (
                <div className="mt-2 text-center">
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-md object-contain border border-border"
                  />
                </div>
              )}
            </FormGroup>

            <FormGroup label="2. ETAPA CONSTRUTIVA ATUAL">
              <div className="grid grid-cols-2 gap-2">
                {etapasRapidas.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => setEtapa(et.id)}
                    className={`p-2.5 rounded-md text-xs font-semibold text-center border transition-colors cursor-pointer ${
                      etapa === et.id
                        ? 'bg-tech/15 border-tech text-tech font-bold'
                        : 'bg-surface-low border-border text-content-muted hover:bg-surface-container'
                    }`}
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
              className="mt-2"
            >
              {enviando ? 'Gravando Foto...' : 'Salvar no Diário'}
            </Button>
          </form>
        </div>
      )}

      {/* FLUXO: SUCESSO */}
      {activeFlow === 'sucesso' && (
        <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-status-paid-bg text-status-paid flex items-center justify-center mx-auto mb-4">
            <Check size={36} />
          </div>

          <h3 className="font-headline text-lg md:text-xl font-bold text-content-main mb-2">
            Registro Concluído!
          </h3>
          <p className="text-sm text-content-muted mb-6">{sucessoMsg}</p>

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
