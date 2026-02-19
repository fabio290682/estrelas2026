import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "@/utils/auth/useAuth";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Smartphone,
  HelpCircle,
  LogOut,
  LogIn,
  ChevronRight,
  Info,
} from "lucide-react-native";

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const { signIn, signOut, isReady, auth } = useAuth();

  const handleAuthAction = () => {
    if (auth) {
      signOut();
    } else {
      signIn();
    }
  };

  const settingSections = [
    {
      title: "Conta",
      items: auth
        ? [
            { icon: User, label: "Perfil do Usuário", hasArrow: true },
            { icon: Shield, label: "Segurança", hasArrow: true },
            {
              icon: LogOut,
              label: "Sair da Conta",
              hasArrow: true,
              onPress: handleAuthAction,
              textColor: "#dc2626",
            },
          ]
        : [
            {
              icon: LogIn,
              label: "Fazer Login",
              hasArrow: true,
              onPress: handleAuthAction,
              textColor: "#0066FF",
            },
          ],
    },
    {
      title: "Aplicativo",
      items: [
        {
          icon: Bell,
          label: "Notificações",
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
        {
          icon: Database,
          label: "Modo Offline",
          hasSwitch: true,
          switchValue: offlineMode,
          onSwitchChange: setOfflineMode,
        },
        {
          icon: Smartphone,
          label: "Biometria",
          hasSwitch: true,
          switchValue: biometricEnabled,
          onSwitchChange: setBiometricEnabled,
        },
      ],
    },
    {
      title: "Suporte",
      items: [
        { icon: HelpCircle, label: "Central de Ajuda", hasArrow: true },
        { icon: Info, label: "Sobre o App", hasArrow: true },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Settings size={24} color="#0066FF" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#1F2937",
              marginLeft: 8,
            }}
          >
            Configurações
          </Text>
        </View>

        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Gerencie suas preferências do aplicativo
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: auth ? "#0066FF" : "#6B7280",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {auth ? (
                <Text
                  style={{ fontSize: 18, fontWeight: "600", color: "white" }}
                >
                  {auth.user?.email?.charAt(0).toUpperCase() || "U"}
                </Text>
              ) : (
                <User size={24} color="white" />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
              >
                {auth ? auth.user?.email || "Usuário" : "Não conectado"}
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>
                {auth ? "Usuário autenticado" : "Faça login para sincronizar"}
              </Text>
            </View>

            <ChevronRight size={20} color="#6B7280" />
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            style={{ paddingHorizontal: 20, marginBottom: 24 }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 12,
              }}
            >
              {section.title}
            </Text>

            <View
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.onPress}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth:
                      itemIndex < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <item.icon size={20} color={item.textColor || "#6B7280"} />
                  <Text
                    style={{
                      fontSize: 14,
                      color: item.textColor || "#374151",
                      marginLeft: 12,
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </Text>

                  {item.hasSwitch && (
                    <Switch
                      value={item.switchValue}
                      onValueChange={item.onSwitchChange}
                      trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
                      thumbColor={item.switchValue ? "#0066FF" : "#F3F4F6"}
                    />
                  )}

                  {item.hasArrow && <ChevronRight size={16} color="#6B7280" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 8,
              }}
            >
              Sistema de Censo Animal
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
              Versão 1.0.0
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
              Desenvolvido para gestão de dados de animais domésticos
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              © 2024 Sistema de Censo Animal
            </Text>
          </View>
        </View>

        {/* Data Sync Status */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: auth ? "#F0F9FF" : "#F9FAFB",
              borderWidth: 1,
              borderColor: auth ? "#0EA5E9" : "#E5E7EB",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Database size={20} color={auth ? "#0EA5E9" : "#6B7280"} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#0F172A" }}
              >
                {auth ? "Dados Sincronizados" : "Sincronização Desabilitada"}
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B" }}>
                {auth
                  ? "Última sincronização: há 5 minutos"
                  : "Faça login para sincronizar dados"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
