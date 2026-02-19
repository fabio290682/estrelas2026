import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { 
  PawPrint, 
  Users, 
  Shield, 
  TrendingUp, 
  Plus,
  RefreshCw,
  BarChart3,
  Calendar,
  MapPin
} from 'lucide-react-native';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard stats
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?periodo=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const periods = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mês' },
    { key: 'trimestre', label: 'Trimestre' },
    { key: 'ano', label: 'Ano' }
  ];

  const kpis = dashboardData?.kpis ? [
    {
      label: 'Total de Animais',
      value: dashboardData.kpis.total_animais?.toLocaleString() || '0',
      icon: PawPrint,
      color: '#2563eb'
    },
    {
      label: 'Proprietários',
      value: dashboardData.kpis.total_proprietarios?.toLocaleString() || '0',
      icon: Users,
      color: '#16a34a'
    },
    {
      label: 'Taxa de Vacinação',
      value: `${dashboardData.kpis.taxa_vacinacao || 0}%`,
      icon: Shield,
      color: '#9333ea'
    },
    {
      label: 'Animais/Região',
      value: dashboardData.kpis.animais_por_regiao?.toFixed(1) || '0',
      icon: TrendingUp,
      color: '#ea580c'
    }
  ] : [];

  const animalTypes = dashboardData?.animalTypes || [];
  const regionalData = dashboardData?.regionalDistribution || [];

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#dc2626', textAlign: 'center', marginBottom: 16 }}>
            Erro ao carregar dados do dashboard
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              backgroundColor: '#0066FF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
              Tentar Novamente
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
              Censo Animal
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh} disabled={isLoading}>
            <RefreshCw size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
          Dashboard de monitoramento
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Period Filter */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Período
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setSelectedPeriod(period.key)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: selectedPeriod === period.key ? '#0066FF' : '#E5E7EB',
                    backgroundColor: selectedPeriod === period.key ? '#F0F7FF' : 'white'
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: selectedPeriod === period.key ? '#0066FF' : '#6B7280'
                  }}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Carregando dados...</Text>
          </View>
        )}

        {/* KPI Cards */}
        {!isLoading && (
          <>
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {kpis.map((kpi, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 12,
                      padding: 16
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <kpi.icon size={20} color={kpi.color} />
                      <Text style={{ fontSize: 10, fontWeight: '500', color: '#16a34a' }}>+5%</Text>
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 }}>
                      {kpi.value}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B7280' }}>
                      {kpi.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Animal Types */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>
                Distribuição por Tipo
              </Text>
              <View style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                padding: 16
              }}>
                {animalTypes.length > 0 ? (
                  animalTypes.map((type, index) => (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                      borderBottomWidth: index < animalTypes.length - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: type.tipo === 'cão' ? '#2563eb' :
                                          type.tipo === 'gato' ? '#16a34a' :
                                          type.tipo === 'ave' ? '#dc2626' : '#ca8a04',
                          marginRight: 8
                        }} />
                        <Text style={{ fontSize: 14, color: '#374151', flex: 1 }}>
                          {type.tipo === 'cão' ? 'Cães' :
                           type.tipo === 'gato' ? 'Gatos' :
                           type.tipo === 'ave' ? 'Aves' : 'Exóticos'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                          {type.count}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {type.percentage?.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, paddingVertical: 20 }}>
                    Nenhum dado disponível
                  </Text>
                )}
              </View>
            </View>

            {/* Regional Distribution */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>
                Distribuição Regional
              </Text>
              <View style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                padding: 16
              }}>
                {regionalData.length > 0 ? (
                  regionalData.slice(0, 5).map((region, index) => (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                      borderBottomWidth: index < Math.min(regionalData.length, 5) - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <MapPin size={16} color="#6B7280" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 14, color: '#374151', flex: 1 }}>
                          {region.regiao}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                        {region.count}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, paddingVertical: 20 }}>
                    Nenhum dado disponível
                  </Text>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>
                Ações Rápidas
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#0066FF',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center'
                  }}
                >
                  <Plus size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '500', marginTop: 4 }}>
                    Novo Animal
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center'
                  }}
                >
                  <Users size={20} color="#374151" />
                  <Text style={{ color: '#374151', fontSize: 12, fontWeight: '500', marginTop: 4 }}>
                    Proprietário
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}