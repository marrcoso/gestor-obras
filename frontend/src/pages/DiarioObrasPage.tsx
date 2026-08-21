import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { DiarioFoto } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Camera,
  Plus,
  Calendar,
  Share2,
  Tag,
  Filter,
  CheckCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal.js';

export const DiarioObrasPage: React.FC = () => {
  const { selectedObra, obras, refreshObras } = useAuth();
  const [fotos, setFotos] = useState<DiarioFoto[]>([]);
  const [filtroEtapa, setFiltroEtapa] = useState('');
  const [loading, setLoading] = useState(true);

  // Modais
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
      ALVENARIA_VEDACAO: 'Alvenaria & Vedação',
      COBERTURA_TELHADO: 'Cobertura & Telhado',
      INSTALACOES_ELETRICA_HIDRAULICA: 'Instalações Elétricas & Hidráulicas',
      REVESTIMENTO_ACABAMENTO: 'Revestimentos & Acabamento',
      PINTURA_VIDROS: 'Pintura & Vidros',
      ENTREGA_LIMPEZA: 'Entrega & Limpeza Final',
      GERAL: 'Geral'
    };
    return map[et] || et;
  };

  return (
    <div className="page-body">
      <ReceiptModal url={selectedFotoPreview} onClose={() => setSelectedFotoPreview(null)} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">Diário de Canteiro</span>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
              {selectedObra ? selectedObra.nome : 'Galeria de Obras'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Registro visual da evolução física da obra por etapas construtivas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleAbrirRelatorio} className="btn btn-secondary">
            <Share2 size={16} /> Gerar Relatório p/ Cliente
          </button>
          <button onClick={() => setModalNovaFoto(true)} className="btn btn-primary">
            <Camera size={16} /> + Nova Foto de Campo
          </button>
        </div>
      </div>

      {/* Filtros por Etapa Construtiva */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => setFiltroEtapa('')}
          className={`btn ${filtroEtapa === '' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Todas as Etapas
        </button>
        <button
          onClick={() => setFiltroEtapa('FUNDACAO_ESTRUTURA')}
          className={`btn ${filtroEtapa === 'FUNDACAO_ESTRUTURA' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Fundação & Estrutura
        </button>
        <button
          onClick={() => setFiltroEtapa('ALVENARIA_VEDACAO')}
          className={`btn ${filtroEtapa === 'ALVENARIA_VEDACAO' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Alvenaria
        </button>
        <button
          onClick={() => setFiltroEtapa('INSTALACOES_ELETRICA_HIDRAULICA')}
          className={`btn ${filtroEtapa === 'INSTALACOES_ELETRICA_HIDRAULICA' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Instalações
        </button>
        <button
          onClick={() => setFiltroEtapa('REVESTIMENTO_ACABAMENTO')}
          className={`btn ${filtroEtapa === 'REVESTIMENTO_ACABAMENTO' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Acabamentos
        </button>
      </div>

      {/* Timeline Grid de Fotos */}
      {fotos.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <Camera size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '4px' }}>Nenhuma foto nesta etapa</h3>
          <p style={{ fontSize: '13px' }}>Clique em "+ Nova Foto de Campo" ou use o app mobile no canteiro.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {fotos.map((foto) => {
            const fullImgUrl = foto.foto_url.startsWith('http')
              ? foto.foto_url
              : `http://localhost:3001${foto.foto_url}`;

            return (
              <div
                key={foto.id}
                className="glass-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedFotoPreview(foto.foto_url)}
              >
                <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={fullImgUrl}
                    alt="Registro de Obra"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                  />
                  <span
                    className="badge badge-primary"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)'
                    }}
                  >
                    {formatEtapa(foto.etapa)}
                  </span>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Calendar size={13} />
                    <span>{foto.data_registro}</span>
                  </div>

                  <p style={{ fontSize: '13.5px', color: '#f1f5f9', lineHeight: 1.4, flex: 1 }}>
                    {foto.descricao || 'Sem anotações complementares.'}
                  </p>
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
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              <h3 style={{ fontSize: '16px' }}>Registrar Foto no Diário de Obra</h3>
              <button
                onClick={() => setModalNovaFoto(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarFoto} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Etapa Construtiva *</label>
                <select className="form-select" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
                  <option value="FUNDACAO_ESTRUTURA">Fundação & Estrutura</option>
                  <option value="ALVENARIA_VEDACAO">Alvenaria & Vedação</option>
                  <option value="COBERTURA_TELHADO">Cobertura & Telhado</option>
                  <option value="INSTALACOES_ELETRICA_HIDRAULICA">Instalações Elétricas & Hidráulicas</option>
                  <option value="REVESTIMENTO_ACABAMENTO">Revestimentos & Acabamento</option>
                  <option value="PINTURA_VIDROS">Pintura & Vidros</option>
                  <option value="ENTREGA_LIMPEZA">Entrega & Limpeza</option>
                  <option value="GERAL">Geral</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Capturar / Selecionar Foto *</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="form-input"
                  onChange={(e) => setArquivoFoto(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ou URL direta da imagem (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={fotoUrlManual}
                  onChange={(e) => setFotoUrlManual(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição / Ocorrência do Dia</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Concretagem das vigas concluída. Amostras enviadas para laboratório."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalNovaFoto(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="btn btn-primary">
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
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px' }}>Relatório Visual de Evolução (Visão do Cliente)</h3>
              </div>
              <button
                onClick={() => setModalRelatorioCliente(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-input)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--border)'
                }}
              >
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{relatorioData.obra.nome}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Proprietário: <strong>{relatorioData.obra.cliente_nome}</strong> | Construtora:{' '}
                  <strong>{relatorioData.construtora.nome}</strong>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Total de registros fotográficos: {relatorioData.total_fotos} fotos catalogadas
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {relatorioData.todas_fotos.map((f: DiarioFoto) => {
                  const url = f.foto_url.startsWith('http') ? f.foto_url : `http://localhost:3001${f.foto_url}`;
                  return (
                    <div key={f.id} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={url} style={{ width: '100%', height: '120px', objectFit: 'cover' }} alt="Obra" />
                      <div style={{ padding: '8px', backgroundColor: 'var(--bg-card)' }}>
                        <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700 }}>
                          {formatEtapa(f.etapa)}
                        </span>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{f.data_registro}</p>
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
                  className="btn btn-primary"
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
