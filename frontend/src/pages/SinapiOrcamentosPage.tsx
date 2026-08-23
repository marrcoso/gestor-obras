import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { SinapiItem, Orcamento } from '../types/index.js';
import { api } from '../services/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Button } from '../components/ui/Button.js';
import { SinapiCatalog } from '../components/domain/orcamento/SinapiCatalog.js';
import { OrcamentoEditor } from '../components/domain/orcamento/OrcamentoEditor.js';
import { NewOrcamentoModal } from '../components/domain/orcamento/NewOrcamentoModal.js';
import { Plus } from 'lucide-react';

export const SinapiOrcamentosPage: React.FC = () => {
  const { selectedObra } = useAuth();

  // SINAPI Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUf, setSelectedUf] = useState('SP');
  const [sinapiResults, setSinapiResults] = useState<SinapiItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Orçamento State
  const [activeOrcamento, setActiveOrcamento] = useState<Orcamento | null>(null);
  const [bdi, setBdi] = useState<number>(20);
  const [loadingOrcamento, setLoadingOrcamento] = useState(false);

  // Modal Novo Orçamento
  const [modalNovoOrcamento, setModalNovoOrcamento] = useState(false);

  const buscarSinapi = async () => {
    setSearchLoading(true);
    try {
      const res = await api.searchSinapi(searchQuery, selectedUf);
      setSinapiResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const carregarOrcamentos = async () => {
    if (!selectedObra) return;
    setLoadingOrcamento(true);
    try {
      const list = await api.getOrcamentos(selectedObra.id);
      if (list.length > 0) {
        const full = await api.getOrcamentoById(list[0].id);
        setActiveOrcamento(full);
        setBdi(full.bdi_padrao_percentual || 20);
      } else {
        setActiveOrcamento(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrcamento(false);
    }
  };

  useEffect(() => {
    buscarSinapi();
  }, [selectedUf]);

  useEffect(() => {
    carregarOrcamentos();
  }, [selectedObra]);

  const handleCriarOrcamento = async (titulo: string) => {
    if (!selectedObra) return;

    try {
      await api.createOrcamento({
        obraId: selectedObra.id,
        titulo,
        bdiPadraoPercentual: bdi
      });
      setModalNovoOrcamento(false);
      await carregarOrcamentos();
    } catch (e: any) {
      alert(e.message || 'Erro ao criar orçamento');
    }
  };

  const handleAddItemToOrcamento = async (sinapiItem: SinapiItem, quantidade: number) => {
    if (!activeOrcamento) {
      alert('Selecione ou crie um orçamento primeiro para adicionar composições.');
      return;
    }

    try {
      await api.addOrcamentoItem(activeOrcamento.id, {
        sinapiItemId: sinapiItem.id,
        codigoItem: sinapiItem.codigo_sinapi,
        descricao: sinapiItem.descricao,
        unidade: sinapiItem.unidade,
        quantidade,
        precoUnitarioBase: sinapiItem.custo_nao_desonerado,
        bdiPercentual: bdi
      });

      const updated = await api.getOrcamentoById(activeOrcamento.id);
      setActiveOrcamento(updated);
    } catch (e: any) {
      alert(e.message || 'Erro ao adicionar item ao orçamento');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activeOrcamento) return;
    if (!window.confirm('Deseja remover este item da planilha orçamentária?')) return;

    try {
      const updatedItens = (activeOrcamento.itens || []).filter((i) => i.id !== itemId);
      setActiveOrcamento({
        ...activeOrcamento,
        itens: updatedItens,
        valor_total_orcado: updatedItens.reduce((acc, curr) => acc + curr.subtotal_total, 0)
      });
    } catch (e: any) {
      alert(e.message || 'Erro ao remover item');
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <NewOrcamentoModal
        isOpen={modalNovoOrcamento}
        onClose={() => setModalNovoOrcamento(false)}
        onSave={handleCriarOrcamento}
        bdiPadrao={bdi}
      />

      {/* Header Section */}
      <PageHeader
        title="Orçamentador Inteligente SINAPI"
        subtitle="Consulte o catálogo oficial Caixa Econômica Federal e estruture orçamentos executivos com BDI automático."
        actions={
          selectedObra && (
            <Button variant="primary" icon={Plus} onClick={() => setModalNovoOrcamento(true)}>
              Novo Orçamento
            </Button>
          )
        }
      />

      {/* Grid: Search Left vs Active Budget Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: SINAPI Search */}
        <SinapiCatalog
          items={sinapiResults}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={buscarSinapi}
          selectedUf={selectedUf}
          onUfChange={setSelectedUf}
          loading={searchLoading}
          onAddItem={handleAddItemToOrcamento}
          formatMoney={formatMoney}
        />

        {/* Right Column: Active Budget & BDI */}
        <OrcamentoEditor
          orcamento={activeOrcamento}
          bdi={bdi}
          onBdiChange={setBdi}
          onRemoveItem={handleRemoveItem}
          formatMoney={formatMoney}
          onNewOrcamentoClick={() => setModalNovoOrcamento(true)}
        />
      </div>
    </div>
  );
};
