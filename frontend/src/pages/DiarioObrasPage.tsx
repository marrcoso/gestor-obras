import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { DiarioFoto } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Camera,
  Plus,
  Calendar,
  Share2,
  Filter,
  Building2,
  Maximize2,
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal.js';

export const DiarioObrasPage: React.FC = () => {
  const { selectedObra, refreshObras } = useAuth();
  const [fotos, setFotos] = useState<DiarioFoto[]>([]);
  const [filtroEtapa, setFiltroEtapa] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalNovaFoto, setModalNovaFoto] = useState(false);
  const [modalRelatorioCliente, setModalRelatorioCliente] = useState(false);
  const [relatorioData, setRelatorioData] = useState<any>(null);
  const [selectedFotoPreview, setSelectedFotoPreview] = useState<string | null>(null);

  // Form State
  const [etapa, setEtapa] = useState('FUNDACAO_ESTRUTURA');
  const [descricao, setDescricao] = useState('');
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [fotoUrlManual, setFotoUrlManual] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregarFotos = async () => {
    if (!selectedObra) return;
    setLoading(true);
    try {
      const data = await api.getDiarioFotos(selectedObra.id, filtroEtapa || undefined);
      setFotos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFotos();
  }, [selectedObra, filtroEtapa]);

  const handleSalvarFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObra) return;

    setSalvando(true);
    try {
      let fotoUrl = fotoUrlManual;
      if (arquivoFoto) {
        const uploadRes = await api.uploadFile(arquivoFoto, 'diario');
        fotoUrl = uploadRes.url;
      }

      if (!fotoUrl) {
        alert('Selecione uma imagem ou informe uma URL');
        return;
      }

      await api.createDiarioFoto({
        obraId: selectedObra.id,
        fotoUrl,
        etapa,
        descricao,
        dataRegistro: new Date().toISOString().split('T')[0]
      });

      setModalNovaFoto(false);
      setDescricao('');
      setArquivoFoto(null);
      setFotoUrlManual('');
      await carregarFotos();
      await refreshObras();
    } catch (e: any) {
      alert(e.message || 'Erro ao enviar foto');
    } finally {
      setSalvando(false);
    }
  };

  const handleAbrirRelatorio = async () => {
    if (!selectedObra) return;
    try {
      const data = await api.getClientReport(selectedObra.id);
      setRelatorioData(data);
      setModalRelatorioCliente(true);
    } catch (e) {
      console.error(e);
    }
  };

  const formatEtapa = (et: string) => {
    const map: Record<string, string> = {
      SERVICOS_PRELIMINARES: 'Serviços Preliminares',
      FUNDACAO_ESTRUTURA: 'Fundação & Estrutura',
      ALVENARIA_VEDACAO: 'Alvenaria',
      COBERTURA_TELHADO: 'Cobertura & Telhado',
      INSTALACOES_ELETRICA_HIDRAULICA: 'Instalações',
      REVESTIMENTO_ACABAMENTO: 'Acabamentos',
      PINTURA_VIDROS: 'Pintura & Vidros',
      ENTREGA_LIMPEZA: 'Entrega Final',
      GERAL: 'Geral'
    };
    return map[et] || et;
  };

  const etapasPills = [
    { key: '', label: 'Todas as Etapas' },
    { key: 'FUNDACAO_ESTRUTURA', label: 'Fundação & Estrutura' },
    { key: 'ALVENARIA_VEDACAO', label: 'Alvenaria' },
    { key: 'INSTALACOES_ELETRICA_HIDRAULICA', label: 'Instalações' },
    { key: 'REVESTIMENTO_ACABAMENTO', label: 'Acabamentos' },
    { key: 'ENTREGA_LIMPEZA', label: 'Entrega' }
  ];

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
      <ReceiptModal url={selectedFotoPreview} onClose={() => setSelectedFotoPreview(null)} />

      {/* Header Section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          paddingTop: '4px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="heading-page">
            Diário de Obras
          </h1>
          <p
            className="text-subtitle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={16} color="var(--technical-blue)" />
            {selectedObra ? selectedObra.nome : 'Galeria Geral de Obras'} • {fotos.length} registros catalogados
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleAbrirRelatorio}
            className="btn-constructo btn-tech-blue"
            style={{ gap: '6px' }}
          >
            <Share2 size={16} />
            <span className="text-mono-tag">Relatório p/ Cliente</span>
          </button>

          <button
            onClick={() => setModalNovaFoto(true)}
            className="btn-constructo btn-primary-orange"
            style={{ gap: '6px' }}
          >
            <Camera size={16} />
            <span className="text-mono-tag">Nova Foto</span>
          </button>
        </div>
      </section>

      {/* Phase Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        {etapasPills.map((p) => {
          const isActive = filtroEtapa === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setFiltroEtapa(p.key)}
              className={`pill-filter ${isActive ? 'active' : ''}`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Photo Grid */}
      {fotos.length === 0 ? (
        <div
          className="card-constructo"
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Camera size={44} style={{ opacity: 0.4 }} color="var(--technical-blue)" />
          <h3 className="heading-section">
            Nenhuma foto catalogada nesta etapa
          </h3>
          <p className="text-body-responsive" style={{ maxWidth: '400px' }}>
            Utilize o botão "+ Nova Foto" ou envie registros instantâneos pelo App do Canteiro do Mestre de Obras.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {fotos.map((foto) => {
            const fullImgUrl = foto.foto_url.startsWith('http')
              ? foto.foto_url
              : `http://localhost:3001${foto.foto_url}`;

            return (
              <div
                key={foto.id}
                className="card-constructo"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => setSelectedFotoPreview(foto.foto_url)}
              >
                {/* Image Container */}
                <div style={{ height: '230px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={fullImgUrl}
                    alt="Registro de Obra"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                  />

                  {/* Stage Badge on Top Left */}
                  <span
                    className="text-mono-tag"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#38bdf8',
                      fontSize: '10px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {formatEtapa(foto.etapa).toUpperCase()}
                  </span>

                  {/* Expand icon on Top Right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      padding: '6px',
                      borderRadius: '6px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Maximize2 size={14} />
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      lineHeight: '1.4',
                      flex: 1
                    }}
                  >
                    {foto.descricao || 'Registro fotográfico da evolução da etapa física.'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '10px',
                      fontSize: '11px',
                      color: 'var(--text-dim)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={13} color="var(--technical-blue)" />
                      <span>Mestre de Obras</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="font-data-tabular">
                      <Calendar size={13} />
                      <span>{foto.data_registro ? foto.data_registro.split('-').reverse().join('/') : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Foto */}
      {modalNovaFoto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Registrar Foto no Diário de Obra</h3>
              <button
                onClick={() => setModalNovaFoto(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarFoto} style={{ padding: '20px' }}>
              <div className="form-group-constructo">
                <label className="form-label-constructo">Etapa Construtiva *</label>
                <select
                  className="form-select-constructo"
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value)}
                >
                  <option value="FUNDACAO_ESTRUTURA">Fundação & Estrutura</option>
                  <option value="ALVENARIA_VEDACAO">Alvenaria & Vedação</option>
                  <option value="COBERTURA_TELHADO">Cobertura & Telhado</option>
                  <option value="INSTALACOES_ELETRICA_HIDRAULICA">Instalações Elétricas & Hidráulicas</option>
                  <option value="REVESTIMENTO_ACABAMENTO">Revestimentos & Acabamento</option>
                  <option value="PINTURA_VIDROS">Pintura & Vidros</option>
                  <option value="ENTREGA_LIMPEZA">Entrega & Limpeza Final</option>
                  <option value="GERAL">Geral</option>
                </select>
              </div>

              <div className="form-group-constructo">
                <label className="form-label-constructo">Capturar / Selecionar Foto *</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="form-input-constructo"
                  onChange={(e) => setArquivoFoto(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div className="form-group-constructo">
                <label className="form-label-constructo">Ou URL direta da imagem (opcional)</label>
                <input
                  type="text"
                  className="form-input-constructo"
                  value={fotoUrlManual}
                  onChange={(e) => setFotoUrlManual(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group-constructo">
                <label className="form-label-constructo">Descrição / Ocorrência do Dia</label>
                <textarea
                  className="form-input-constructo"
                  style={{ minHeight: '80px', padding: '10px' }}
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Concretagem das vigas e pilares do 2º pavimento concluída."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalNovaFoto(false)}
                  className="btn-constructo btn-secondary-slate"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="btn-constructo btn-primary-orange"
                >
                  {salvando ? 'Salvando...' : 'Salvar no Diário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Relatório do Cliente */}
      {modalRelatorioCliente && relatorioData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Relatório Visual de Evolução (Visão do Cliente)</h3>
              </div>
              <button
                onClick={() => setModalRelatorioCliente(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-low)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--border)'
                }}
              >
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {relatorioData.obra.nome}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Proprietário: <strong>{relatorioData.obra.cliente_nome}</strong> | Construtora:{' '}
                  <strong>{relatorioData.construtora.nome}</strong>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Total de registros fotográficos: {relatorioData.total_fotos} fotos catalogadas
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >
                {relatorioData.todas_fotos.map((f: DiarioFoto) => {
                  const url = f.foto_url.startsWith('http') ? f.foto_url : `http://localhost:3001${f.foto_url}`;
                  return (
                    <div
                      key={f.id}
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <img src={url} style={{ width: '100%', height: '120px', objectFit: 'cover' }} alt="Obra" />
                      <div style={{ padding: '8px' }}>
                        <span className="text-mono-tag" style={{ fontSize: '10px', color: 'var(--primary)' }}>
                          {formatEtapa(f.etapa).toUpperCase()}
                        </span>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {f.data_registro}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    alert('Link gerado e copiado! Você pode enviar no WhatsApp do proprietário.');
                    setModalRelatorioCliente(false);
                  }}
                  className="btn-constructo btn-primary-orange"
                >
                  <Share2 size={16} /> Compartilhar Link com Proprietário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

