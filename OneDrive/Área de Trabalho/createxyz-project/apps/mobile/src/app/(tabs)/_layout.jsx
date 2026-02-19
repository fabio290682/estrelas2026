import { Tabs } from 'expo-router';
import { BarChart, PawPrint, Users, FileText, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderColor: '#E5E7EB',
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#6B6B6B',
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <BarChart color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="animais"
        options={{
          title: 'Animais',
          tabBarIcon: ({ color, size }) => (
            <PawPrint color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="proprietarios"
        options={{
          title: 'Proprietários',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}