import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { DiarioFoto } from '../types/index.js';
import { api } from '../services/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Button } from '../components/ui/Button.js';
import { PillFilter } from '../components/ui/PillFilter.js';
import { LoadingState } from '../components/ui/LoadingState.js';
import { PhotoGallery } from '../components/domain/diario/PhotoGallery.js';
import { UploadPhotoModal } from '../components/domain/diario/UploadPhotoModal.js';
import { ClientReportModal } from '../components/domain/diario/ClientReportModal.js';
import { ReceiptModal } from '../components/ReceiptModal.js';
import { Camera, Share2, Building2 } from 'lucide-react';

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

  const handleSalvarFoto = async (payload: {
    etapa: string;
    descricao: string;
    arquivoFoto: File | null;
    fotoUrlManual: string;
  }) => {
    if (!selectedObra) return;

    setSalvando(true);
    try {
      let fotoUrl = payload.fotoUrlManual;
      if (payload.arquivoFoto) {
        const uploadRes = await api.uploadFile(payload.arquivoFoto, 'diario');
        fotoUrl = uploadRes.url;
      }

      await api.createDiarioFoto({
        obraId: selectedObra.id,
        fotoUrl,
        etapa: payload.etapa as any,
        descricao: payload.descricao,
        dataRegistro: new Date().toISOString().split('T')[0]
      });

      setModalNovaFoto(false);
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

  const etapasPills = [
    { key: '', label: 'Todas as Etapas', count: fotos.length },
    { key: 'FUNDACAO_ESTRUTURA', label: 'Fundação & Estrutura' },
    { key: 'ALVENARIA_VEDACAO', label: 'Alvenaria' },
    { key: 'INSTALACOES_ELETRICA_HIDRAULICA', label: 'Instalações' },
    { key: 'REVESTIMENTO_ACABAMENTO', label: 'Acabamentos' },
    { key: 'ENTREGA_LIMPEZA', label: 'Entrega' }
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <ReceiptModal url={selectedFotoPreview} onClose={() => setSelectedFotoPreview(null)} />

      <UploadPhotoModal
        isOpen={modalNovaFoto}
        onClose={() => setModalNovaFoto(false)}
        onSave={handleSalvarFoto}
        saving={salvando}
      />

      <ClientReportModal
        isOpen={modalRelatorioCliente}
        onClose={() => setModalRelatorioCliente(false)}
        relatorioData={relatorioData}
        obraNome={selectedObra?.nome || 'Obra'}
      />

      {/* Header Section */}
      <PageHeader
        title="Diário de Obras"
        subtitle={
          <div className="flex items-center gap-1.5">
            <Building2 size={16} className="text-tech" />
            <span>{selectedObra ? selectedObra.nome : 'Galeria Geral de Obras'} • {fotos.length} registros catalogados</span>
          </div>
        }
        actions={
          <>
            <Button variant="tech-blue" icon={Share2} onClick={handleAbrirRelatorio}>
              Relatório p/ Cliente
            </Button>
            <Button variant="primary" icon={Camera} onClick={() => setModalNovaFoto(true)}>
              Nova Foto
            </Button>
          </>
        }
      />

      {/* Phase Filter Pills */}
      <PillFilter
        items={etapasPills}
        selectedKey={filtroEtapa}
        onSelect={setFiltroEtapa}
      />

      {/* Photo Gallery Grid */}
      {loading ? (
        <LoadingState message="Carregando galeria do diário de obra..." minHeight="300px" />
      ) : (
        <PhotoGallery fotos={fotos} onSelectPhoto={setSelectedFotoPreview} />
      )}
    </div>
  );
};
