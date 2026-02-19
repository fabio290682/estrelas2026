import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  FileText, 
  Download,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Shield,
  Users
} from 'lucide-react-native';

export default function RelatoriosScreen() {
  const insets = useSafeAreaInsets();

  const reportTypes = [
    {
      title: 'Relatório Geral',
      description: 'Estatísticas completas do censo animal',
      icon: BarChart3,
      color: '#0066FF'
    },
    {
      title: 'Relatório por Tipo',
      description: 'Distribuição de animais por espécie',
      icon: PieChart,
      color: '#16A34A'
    },
    {
      title: 'Relatório Regional',
      description: 'Dados agrupados por região/bairro',
      icon: MapPin,
      color: '#EA580C'
    },
    {
      title: 'Relatório de Vacinação',
      description: 'Status vacinal dos animais',
      icon: Shield,
      color: '#9333EA'
    },
    {
      title: 'Relatório de Proprietários',
      description: 'Lista completa de proprietários',
      icon: Users,
      color: '#DC2626'
    },
    {
      title: 'Relatório Mensal',
      description: 'Evolução dos dados no mês',
      icon: Calendar,
      color: '#059669'
    }
  ];

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FileText size={24} color="#0066FF" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>
            Relatórios
          </Text>
        </View>
        
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
          Gere e visualize relatórios do sistema
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Types */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            Tipos de Relatório
          </Text>
          
          <View style={{ gap: 12 }}>
            {reportTypes.map((report, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: `${report.color}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <report.icon size={24} color={report.color} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>
                    {report.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {report.description}
                  </Text>
                </View>
                
                <Download size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Export */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            Exportação Rápida
          </Text>
          
          <View style={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            padding: 16
          }}>
            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
              Exporte os dados atuais em diferentes formatos
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: '#DC2626',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                  PDF
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: '#16A34A',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                  Excel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: '#0066FF',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                  CSV
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
            Relatórios Recentes
          </Text>
          
          <View style={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            padding: 16
          }}>
            <Text style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, paddingVertical: 20 }}>
              Nenhum relatório gerado ainda
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}