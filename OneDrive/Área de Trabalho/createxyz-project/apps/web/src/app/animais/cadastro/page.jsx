import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PawPrint,
  ArrowLeft,
  Save,
  Upload,
  User,
  Calendar,
  Activity,
  Shield,
  Tag,
  FileText
} from "lucide-react";

export default function CadastroAnimal() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    id_proprietario: '',
    nome: '',
    tipo: 'cão',
    subtipo: '',
    raca: '',
    sexo: 'macho',
    idade: '',
    peso: '',
    porte: 'médio',
    cor_pelagem: '',
    castrado: false,
    vacinado: false,
    vermifugado: false,
    condicoes_especiais: '',
    veterinario_responsavel: '',
    microchip: '',
    registro_municipal: '',
    pedigree: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});
  const [searchProprietario, setSearchProprietario] = useState('');

  // Fetch proprietários for selection
  const { data: proprietarios = [] } = useQuery({
    queryKey: ['proprietarios', searchProprietario],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchProprietario) params.append('search', searchProprietario);
      
      const response = await fetch(`/api/proprietarios?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar proprietários');
      const data = await response.json();
      return data.proprietarios || [];
    },
    enabled: true
  });

  // Create animal mutation
  const createAnimalMutation = useMutation({
    mutationFn: async (animalData) => {
      const response = await fetch('/api/animais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animalData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao cadastrar animal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['animais']);
      queryClient.invalidateQueries(['dashboard-stats']);
      
      // Reset form
      setFormData({
        id_proprietario: '',
        nome: '',
        tipo: 'cão',
        subtipo: '',
        raca: '',
        sexo: 'macho',
        idade: '',
        peso: '',
        porte: 'médio',
        cor_pelagem: '',
        castrado: false,
        vacinado: false,
        vermifugado: false,
        condicoes_especiais: '',
        veterinario_responsavel: '',
        microchip: '',
        registro_municipal: '',
        pedigree: '',
        observacoes: ''
      });
      
      alert('Animal cadastrado com sucesso!');
    },
    onError: (error) => {
      alert(error.message || 'Erro ao cadastrar animal');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.id_proprietario) newErrors.id_proprietario = 'Proprietário é obrigatório';
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.tipo) newErrors.tipo = 'Tipo é obrigatório';
    if (!formData.sexo) newErrors.sexo = 'Sexo é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Convert string numbers to actual numbers
    const processedData = {
      ...formData,
      idade: formData.idade ? parseInt(formData.idade) : null,
      peso: formData.peso ? parseFloat(formData.peso) : null
    };
    
    createAnimalMutation.mutate(processedData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <div className="border-b border-[#EDEDED] bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft size={20} className="text-[#6A6F7B]" />
              </button>
              <div className="flex items-center">
                <PawPrint size={24} className="text-[#0066FF] mr-3" />
                <div>
                  <h1 className="text-lg font-semibold text-[#2B2B2B]">Cadastro de Animal</h1>
                  <p className="text-sm text-[#6A6F7B]">Preencha as informações do animal para registro</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={createAnimalMutation.isPending}
              className="h-10 px-6 bg-[#0066FF] text-white rounded-md text-sm font-medium flex items-center disabled:opacity-50"
            >
              {createAnimalMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {createAnimalMutation.isPending ? 'Salvando...' : 'Salvar Animal'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Proprietário Section */}
          <div className="bg-white border border-[#EDEDED] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <User size={20} className="text-[#0066FF] mr-2" />
              <h2 className="text-sm font-medium text-[#2B2B2B]">Proprietário</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Buscar Proprietário *
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome ou CPF do proprietário..."
                  value={searchProprietario}
                  onChange={(e) => setSearchProprietario(e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                />
              </div>
              
              {proprietarios.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                    Selecionar Proprietário *
                  </label>
                  <select
                    value={formData.id_proprietario}
                    onChange={(e) => handleInputChange('id_proprietario', e.target.value)}
                    className={`w-full h-10 px-3 border rounded-md text-sm ${
                      errors.id_proprietario ? 'border-red-500' : 'border-[#E2E3E7]'
                    }`}
                  >
                    <option value="">Selecione um proprietário</option>
                    {proprietarios.map(proprietario => (
                      <option key={proprietario.id_proprietario} value={proprietario.id_proprietario}>
                        {proprietario.nome_completo} - {proprietario.cpf}
                      </option>
                    ))}
                  </select>
                  {errors.id_proprietario && (
                    <p className="text-xs text-red-500 mt-1">{errors.id_proprietario}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="bg-white border border-[#EDEDED] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Tag size={20} className="text-[#0066FF] mr-2" />
              <h2 className="text-sm font-medium text-[#2B2B2B]">Informações Básicas</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Nome do Animal *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={`w-full h-10 px-3 border rounded-md text-sm ${
                    errors.nome ? 'border-red-500' : 'border-[#E2E3E7]'
                  }`}
                  placeholder="Digite o nome do animal"
                />
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                >
                  <option value="cão">Cão</option>
                  <option value="gato">Gato</option>
                  <option value="ave">Ave</option>
                  <option value="exótico">Exótico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Raça
                </label>
                <input
                  type="text"
                  value={formData.raca}
                  onChange={(e) => handleInputChange('raca', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="Digite a raça"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Sexo *
                </label>
                <select
                  value={formData.sexo}
                  onChange={(e) => handleInputChange('sexo', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                >
                  <option value="macho">Macho</option>
                  <option value="fêmea">Fêmea</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Idade (anos)
                </label>
                <input
                  type="number"
                  value={formData.idade}
                  onChange={(e) => handleInputChange('idade', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="0"
                  min="0"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="0.0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Porte
                </label>
                <select
                  value={formData.porte}
                  onChange={(e) => handleInputChange('porte', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                >
                  <option value="pequeno">Pequeno</option>
                  <option value="médio">Médio</option>
                  <option value="grande">Grande</option>
                  <option value="gigante">Gigante</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Cor da Pelagem
                </label>
                <input
                  type="text"
                  value={formData.cor_pelagem}
                  onChange={(e) => handleInputChange('cor_pelagem', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="Cor predominante"
                />
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className="bg-white border border-[#EDEDED] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield size={20} className="text-[#0066FF] mr-2" />
              <h2 className="text-sm font-medium text-[#2B2B2B]">Informações de Saúde</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.castrado}
                      onChange={(e) => handleInputChange('castrado', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#6A6F7B]">Castrado</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.vacinado}
                      onChange={(e) => handleInputChange('vacinado', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#6A6F7B]">Vacinado</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.vermifugado}
                      onChange={(e) => handleInputChange('vermifugado', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#6A6F7B]">Vermifugado</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Veterinário Responsável
                </label>
                <input
                  type="text"
                  value={formData.veterinario_responsavel}
                  onChange={(e) => handleInputChange('veterinario_responsavel', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="Nome do veterinário"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Microchip
                </label>
                <input
                  type="text"
                  value={formData.microchip}
                  onChange={(e) => handleInputChange('microchip', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="Número do microchip"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Condições Especiais
                </label>
                <textarea
                  value={formData.condicoes_especiais}
                  onChange={(e) => handleInputChange('condicoes_especiais', e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-[#E2E3E7] rounded-md text-sm resize-none"
                  placeholder="Descreva condições especiais de saúde..."
                />
              </div>
            </div>
          </div>

          {/* Identificação */}
          <div className="bg-white border border-[#EDEDED] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText size={20} className="text-[#0066FF] mr-2" />
              <h2 className="text-sm font-medium text-[#2B2B2B]">Identificação e Observações</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Registro Municipal
                </label>
                <input
                  type="text"
                  value={formData.registro_municipal}
                  onChange={(e) => handleInputChange('registro_municipal', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="Número do registro"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Pedigree
                </label>
                <input
                  type="text"
                  value={formData.pedigree}
                  onChange={(e) => handleInputChange('pedigree', e.target.value)}
                  className="w-full h-10 px-3 border border-[#E2E3E7] rounded-md text-sm"
                  placeholder="Número do pedigree"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#6A6F7B] mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-[#E2E3E7] rounded-md text-sm resize-none"
                  placeholder="Observações adicionais sobre o animal..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}