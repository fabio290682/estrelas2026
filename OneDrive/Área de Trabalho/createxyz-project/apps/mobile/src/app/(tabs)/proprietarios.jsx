import { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Plus,
  Search,
  Phone,
  MapPin,
  Mail
} from 'lucide-react-native';

export default function ProprietariosScreen() {
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch proprietários
  const { data: proprietariosData, isLoading, refetch } = useQuery({
    queryKey: ['proprietarios', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/proprietarios?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar proprietários');
      const data = await response.json();
      return data.proprietarios || [];
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
            <Users size={24} color="#0066FF" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>
              Proprietários
            </Text>
          </View>
          <TouchableOpacity
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

      {/* Search */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
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
            placeholder="Buscar proprietários..."
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

      {/* Proprietários List */}
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
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Carregando proprietários...</Text>
          </View>
        ) : proprietariosData && proprietariosData.length > 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            {proprietariosData.map((proprietario, index) => (
              <View
                key={proprietario.id_proprietario}
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                  {proprietario.nome_completo}
                </Text>
                
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                  CPF: {proprietario.cpf}
                </Text>

                <View style={{ gap: 4 }}>
                  {proprietario.telefone_principal && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Phone size={14} color="#6B7280" />
                      <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>
                        {proprietario.telefone_principal}
                      </Text>
                    </View>
                  )}
                  
                  {proprietario.email && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Mail size={14} color="#6B7280" />
                      <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>
                        {proprietario.email}
                      </Text>
                    </View>
                  )}
                  
                  {(proprietario.cidade || proprietario.bairro) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>
                        {proprietario.bairro}{proprietario.bairro && proprietario.cidade && ', '}{proprietario.cidade}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Users size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12, textAlign: 'center' }}>
              Nenhum proprietário encontrado
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' }}>
              Cadastre o primeiro proprietário para começar
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}