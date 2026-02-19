import { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { 
  PawPrint, 
  Plus,
  Search,
  Filter,
  Camera,
  Save,
  X,
  User,
  Shield,
  Tag
} from 'lucide-react-native';
import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';

export default function AnimaisScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id_proprietario: '',
    nome: '',
    tipo: 'cão',
    raca: '',
    sexo: 'macho',
    idade: '',
    peso: '',
    porte: 'médio',
    cor_pelagem: '',
    castrado: false,
    vacinado: false,
    vermifugado: false,
    observacoes: ''
  });

  const [searchProprietario, setSearchProprietario] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch animals
  const { data: animaisData, isLoading, refetch } = useQuery({
    queryKey: ['animais', searchTerm, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType !== 'all') params.append('tipo', selectedType);
      
      const response = await fetch(`/api/animais?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar animais');
      const data = await response.json();
      return data.animais || [];
    }
  });

  // Fetch proprietários for form
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
    enabled: showForm
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
      setShowForm(false);
      resetForm();
      Alert.alert('Sucesso', 'Animal cadastrado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao cadastrar animal');
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      id_proprietario: '',
      nome: '',
      tipo: 'cão',
      raca: '',
      sexo: 'macho',
      idade: '',
      peso: '',
      porte: 'médio',
      cor_pelagem: '',
      castrado: false,
      vacinado: false,
      vermifugado: false,
      observacoes: ''
    });
    setSearchProprietario('');
    setErrors({});
  };

  const handleSubmit = () => {
    // Basic validation
    const newErrors = {};
    if (!formData.id_proprietario) newErrors.id_proprietario = 'Proprietário é obrigatório';
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';

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

  const typeFilters = [
    { key: 'all', label: 'Todos' },
    { key: 'cão', label: 'Cães' },
    { key: 'gato', label: 'Gatos' },
    { key: 'ave', label: 'Aves' },
    { key: 'exótico', label: 'Exóticos' }
  ];

  if (showForm) {
    return (
      <KeyboardAvoidingAnimatedView style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }}>
        <StatusBar style="dark" />
        
        {/* Form Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => setShowForm(false)} 
              style={{ marginRight: 12 }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
              Cadastrar Animal
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createAnimalMutation.isPending}
            style={{
              backgroundColor: '#0066FF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              opacity: createAnimalMutation.isPending ? 0.5 : 1
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
              {createAnimalMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Proprietário Section */}
          <View style={{ margin: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <User size={20} color="#0066FF" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>
                Proprietário
              </Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                Buscar Proprietário *
              </Text>
              <TextInput
                value={searchProprietario}
                onChangeText={setSearchProprietario}
                placeholder="Digite o nome ou CPF..."
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: '#1F2937'
                }}
              />
            </View>

            {proprietarios.length > 0 && (
              <View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                  Selecionar Proprietário *
                </Text>
                <View style={{ maxHeight: 120 }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {proprietarios.map(proprietario => (
                      <TouchableOpacity
                        key={proprietario.id_proprietario}
                        onPress={() => setFormData(prev => ({ ...prev, id_proprietario: proprietario.id_proprietario }))}
                        style={{
                          padding: 12,
                          borderWidth: 1,
                          borderColor: formData.id_proprietario === proprietario.id_proprietario ? '#0066FF' : '#E5E7EB',
                          backgroundColor: formData.id_proprietario === proprietario.id_proprietario ? '#F0F7FF' : 'white',
                          borderRadius: 8,
                          marginBottom: 8
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                          {proprietario.nome_completo}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {proprietario.cpf}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                {errors.id_proprietario && (
                  <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>
                    {errors.id_proprietario}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Informações Básicas */}
          <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Tag size={20} color="#0066FF" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>
                Informações Básicas
              </Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                Nome do Animal *
              </Text>
              <TextInput
                value={formData.nome}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
                placeholder="Digite o nome"
                style={{
                  borderWidth: 1,
                  borderColor: errors.nome ? '#DC2626' : '#E5E7EB',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: '#1F2937'
                }}
              />
              {errors.nome && (
                <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>
                  {errors.nome}
                </Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                  Tipo *
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['cão', 'gato', 'ave', 'exótico'].map(tipo => (
                    <TouchableOpacity
                      key={tipo}
                      onPress={() => setFormData(prev => ({ ...prev, tipo }))}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: formData.tipo === tipo ? '#0066FF' : '#E5E7EB',
                        backgroundColor: formData.tipo === tipo ? '#F0F7FF' : 'white',
                        borderRadius: 6
                      }}
                    >
                      <Text style={{
                        fontSize: 12,
                        color: formData.tipo === tipo ? '#0066FF' : '#6B7280',
                        textTransform: 'capitalize'
                      }}>
                        {tipo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                  Raça
                </Text>
                <TextInput
                  value={formData.raca}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, raca: text }))}
                  placeholder="Digite a raça"
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: '#1F2937'
                  }}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                  Sexo *
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['macho', 'fêmea'].map(sexo => (
                    <TouchableOpacity
                      key={sexo}
                      onPress={() => setFormData(prev => ({ ...prev, sexo }))}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: formData.sexo === sexo ? '#0066FF' : '#E5E7EB',
                        backgroundColor: formData.sexo === sexo ? '#F0F7FF' : 'white',
                        borderRadius: 8,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{
                        fontSize: 12,
                        color: formData.sexo === sexo ? '#0066FF' : '#6B7280',
                        textTransform: 'capitalize'
                      }}>
                        {sexo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                  Idade (anos)
                </Text>
                <TextInput
                  value={formData.idade}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, idade: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: '#1F2937'
                  }}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                  Peso (kg)
                </Text>
                <TextInput
                  value={formData.peso}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, peso: text }))}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: '#1F2937'
                  }}
                />
              </View>
            </View>
          </View>

          {/* Saúde */}
          <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Shield size={20} color="#0066FF" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>
                Informações de Saúde
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {[
                { key: 'castrado', label: 'Castrado' },
                { key: 'vacinado', label: 'Vacinado' },
                { key: 'vermifugado', label: 'Vermifugado' }
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setFormData(prev => ({ ...prev, [key]: !prev[key] }))}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: formData[key] ? '#0066FF' : '#D1D5DB',
                    borderRadius: 4,
                    backgroundColor: formData[key] ? '#0066FF' : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData[key] && (
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>✓</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: '#374151' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 6 }}>
                Observações
              </Text>
              <TextInput
                value={formData.observacoes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, observacoes: text }))}
                placeholder="Observações sobre o animal..."
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: '#1F2937',
                  textAlignVertical: 'top'
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PawPrint size={24} color="#0066FF" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>
              Animais
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={{
              backgroundColor: '#0066FF',
              borderRadius: 8,
              padding: 8
            }}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ marginBottom: 12 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            paddingHorizontal: 12
          }}>
            <Search size={16} color="#6B7280" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Buscar animais..."
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                fontSize: 14,
                color: '#1F2937'
              }}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {typeFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedType(filter.key)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: selectedType === filter.key ? '#0066FF' : '#E5E7EB',
                  backgroundColor: selectedType === filter.key ? '#F0F7FF' : 'white'
                }}
              >
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: selectedType === filter.key ? '#0066FF' : '#6B7280'
                }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Animals List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Carregando animais...</Text>
          </View>
        ) : animaisData && animaisData.length > 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            {animaisData.map((animal, index) => (
              <View
                key={animal.id_animal}
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>
                      {animal.nome}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', textTransform: 'capitalize' }}>
                      {animal.tipo} • {animal.raca || 'SRD'} • {animal.sexo}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: animal.status === 'ativo' ? '#D1FAE5' : '#FEE2E2',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4
                  }}>
                    <Text style={{
                      fontSize: 10,
                      fontWeight: '500',
                      color: animal.status === 'ativo' ? '#065F46' : '#991B1B',
                      textTransform: 'capitalize'
                    }}>
                      {animal.status}
                    </Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <User size={14} color="#6B7280" />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>
                    {animal.proprietario_nome}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {animal.idade && (
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                      {animal.idade} {animal.idade === 1 ? 'ano' : 'anos'}
                    </Text>
                  )}
                  {animal.peso && (
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                      {animal.peso}kg
                    </Text>
                  )}
                  {animal.vacinado && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Shield size={12} color="#16A34A" />
                      <Text style={{ fontSize: 12, color: '#16A34A', marginLeft: 2 }}>
                        Vacinado
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <PawPrint size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12, textAlign: 'center' }}>
              Nenhum animal encontrado
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' }}>
              Cadastre o primeiro animal para começar
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}