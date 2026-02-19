import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  PawPrint,
  MapPin,
  Calendar,
  Plus,
  Search,
  Bell,
  ChevronDown,
  MoreVertical,
  Download,
  Filter,
  TrendingUp,
  Shield,
  Heart,
  Activity,
} from "lucide-react";

export default function AnimalCensusDashboard() {
  const [selectedFilter, setSelectedFilter] = useState("Mês");
  const [selectedRegion, setSelectedRegion] = useState("Todas");

  // Fetch dashboard stats
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-stats", selectedFilter.toLowerCase(), selectedRegion],
    queryFn: async () => {
      const params = new URLSearchParams({
        periodo: selectedFilter.toLowerCase(),
        ...(selectedRegion !== "Todas" && { regiao: selectedRegion }),
      });

      const response = await fetch(`/api/dashboard/stats?${params}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados do dashboard");
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
  });

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: PawPrint, label: "Animais", active: false },
    { icon: Users, label: "Proprietários", active: false },
    { icon: FileText, label: "Relatórios", active: false },
    { icon: MapPin, label: "Mapa", active: false },
    { icon: Settings, label: "Configurações", active: false },
  ];

  const filters = ["Hoje", "Semana", "Mês", "Trimestre", "Ano"];
  const regions = ["Todas", "Centro", "Norte", "Sul", "Leste", "Oeste"];

  // Prepare data from API response
  const kpis = dashboardData?.kpis
    ? [
        {
          label: "Total de Animais",
          value: dashboardData.kpis.total_animais?.toLocaleString() || "0",
          change: "+12%",
          icon: PawPrint,
          color: "text-blue-600",
        },
        {
          label: "Proprietários",
          value:
            dashboardData.kpis.total_proprietarios?.toLocaleString() || "0",
          change: "+8%",
          icon: Users,
          color: "text-green-600",
        },
        {
          label: "Taxa de Vacinação",
          value: `${dashboardData.kpis.taxa_vacinacao || 0}%`,
          change: "+3.2%",
          icon: Shield,
          color: "text-purple-600",
        },
        {
          label: "Animais/Região",
          value: dashboardData.kpis.animais_por_regiao?.toFixed(1) || "0",
          change: "+5%",
          icon: TrendingUp,
          color: "text-orange-600",
        },
      ]
    : [
        {
          label: "Total de Animais",
          value: "0",
          change: "0%",
          icon: PawPrint,
          color: "text-blue-600",
        },
        {
          label: "Proprietários",
          value: "0",
          change: "0%",
          icon: Users,
          color: "text-green-600",
        },
        {
          label: "Taxa de Vacinação",
          value: "0%",
          change: "0%",
          icon: Shield,
          color: "text-purple-600",
        },
        {
          label: "Animais/Região",
          value: "0",
          change: "0%",
          icon: TrendingUp,
          color: "text-orange-600",
        },
      ];

  // Animal types with colors
  const typeColors = {
    cão: "#2563eb",
    gato: "#16a34a",
    ave: "#dc2626",
    exótico: "#ca8a04",
  };

  const animalTypes =
    dashboardData?.animalTypes?.map((type) => ({
      type:
        type.tipo === "cão"
          ? "Cães"
          : type.tipo === "gato"
            ? "Gatos"
            : type.tipo === "ave"
              ? "Aves"
              : "Exóticos",
      count: type.count,
      percentage: type.percentage || 0,
      color: typeColors[type.tipo] || "#6b7280",
    })) || [];

  const regionalData =
    dashboardData?.regionalDistribution?.map((region, index) => ({
      region: region.regiao,
      animals: region.count,
      height: Math.max(
        30,
        Math.min(
          120,
          (region.count /
            Math.max(
              ...(dashboardData?.regionalDistribution?.map((r) => r.count) || [
                1,
              ]),
            )) *
            120,
        ),
      ),
    })) || [];

  const vaccinationData = dashboardData?.vaccinationTrend || [];

  const ageDistribution =
    dashboardData?.ageDistribution?.map((age) => ({
      age: age.age_group,
      count: age.count,
      height: Math.max(
        30,
        Math.min(
          140,
          (age.count /
            Math.max(
              ...(dashboardData?.ageDistribution?.map((a) => a.count) || [1]),
            )) *
            140,
        ),
      ),
    })) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Erro ao carregar dados do dashboard
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 w-60 h-full bg-white z-10 border-r border-[#EDEDED]">
        <div className="px-6 pt-8">
          {/* Logo and Menu Header */}
          <div className="flex items-center justify-between h-9 mb-8">
            <div className="flex items-center">
              <PawPrint size={24} className="text-[#0066FF]" />
              <span className="ml-3 text-sm font-semibold text-[#2B2B2B]">
                Censo Animal
              </span>
            </div>
            <Menu size={16} className="text-gray-700" />
          </div>

          {/* Primary Navigation */}
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <div key={index} className="flex items-center h-9 relative">
                {item.active && (
                  <div className="absolute left-0 w-2 h-2 bg-[#0066FF] rounded-sm"></div>
                )}
                <div
                  className={`flex items-center ml-${item.active ? "3" : "0"}`}
                >
                  <item.icon
                    size={18}
                    className={
                      item.active ? "text-[#0066FF]" : "text-[#9EA3AD]"
                    }
                  />
                  <span
                    className={`ml-3 text-xs ${
                      item.active
                        ? "text-[#0066FF] font-medium"
                        : "text-[#9EA3AD] font-normal"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mt-10 mb-4">
            <div className="h-px bg-[#E8E8E8]"></div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4">
            <h3 className="text-[11px] font-semibold text-[#9EA3AD] tracking-wider mb-4">
              AÇÕES RÁPIDAS
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center h-9 text-left">
                <Plus size={18} className="text-[#9EA3AD]" />
                <span className="ml-3 text-xs text-[#9EA3AD] font-normal">
                  Novo Animal
                </span>
              </button>
              <button className="w-full flex items-center h-9 text-left">
                <Users size={18} className="text-[#9EA3AD]" />
                <span className="ml-3 text-xs text-[#9EA3AD] font-normal">
                  Novo Proprietário
                </span>
              </button>
              <button className="w-full flex items-center h-9 text-left">
                <FileText size={18} className="text-[#9EA3AD]" />
                <span className="ml-3 text-xs text-[#9EA3AD] font-normal">
                  Gerar Relatório
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-60">
        {/* Top Bar */}
        <div
          className="fixed top-0 right-0 h-16 bg-white border-b border-[#EDEDED] z-10"
          style={{ left: "240px" }}
        >
          <div className="flex items-center justify-between h-full px-6">
            {/* Search */}
            <div className="relative w-[420px]">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A8D95]"
              />
              <input
                type="text"
                placeholder="Buscar animal, proprietário ou registro..."
                className="w-full h-9 pl-11 pr-4 border border-[#E2E3E7] rounded-md text-xs text-[#8A8D95] font-normal"
              />
            </div>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center">
                <div className="w-7 h-7 border-4 border-[#0066FF] rounded-full flex items-center justify-center">
                  <PawPrint size={14} className="text-[#0066FF]" />
                </div>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center">
              <Bell size={18} className="text-[#C5C8CF]" />
              <div className="ml-8 flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="Admin"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="ml-2 text-xs font-medium text-[#2B2B2B]">
                  Dr. Carlos Silva
                </span>
                <ChevronDown size={12} className="ml-3 text-[#2B2B2B]" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="pt-16 px-6">
          {/* Content Header */}
          <div className="flex items-center justify-between mt-8 mb-8">
            <div className="flex items-center">
              <h1 className="text-base font-semibold text-[#2B2B2B]">
                Dashboard Censo Animal
              </h1>
              <div className="ml-6 flex items-center space-x-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`h-8 px-4 rounded-md text-sm font-medium ${
                      selectedFilter === filter
                        ? "bg-[#F7F8FB] text-[#2B2B2B] border border-[#E5E6EC]"
                        : "border border-[#E5E6EC] text-[#6A6F7C]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-8 px-3 border border-[#E5E6EC] rounded-md text-xs font-medium text-[#2B2B2B]"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <button className="h-8 px-3.5 border border-[#E5E6EC] rounded-md flex items-center text-xs font-medium text-[#2B2B2B]">
                <Download size={14} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#6A6F7B]">Carregando dados...</p>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          {!isLoading && (
            <>
              <div className="grid grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, index) => (
                  <div
                    key={index}
                    className="bg-white border border-[#EDEDED] rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <kpi.icon size={20} className={kpi.color} />
                      <span className="text-xs font-medium text-green-600">
                        {kpi.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#2B2B2B] mb-1">
                      {kpi.value}
                    </div>
                    <div className="text-xs text-[#6A6F7B]">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Animal Distribution Pie Chart */}
                <div
                  className="bg-white border border-[#EDEDED] rounded-lg p-8"
                  style={{ height: "360px" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-medium text-[#6A6F7B]">
                      Distribuição por Tipo de Animal
                    </h3>
                    <MoreVertical size={18} className="text-[#C9CCD2]" />
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    {animalTypes.length > 0 ? (
                      <div className="w-48 h-48 relative">
                        <svg
                          width="192"
                          height="192"
                          viewBox="0 0 192 192"
                          className="transform -rotate-90"
                        >
                          {animalTypes.map((animal, index) => {
                            const offset = animalTypes
                              .slice(0, index)
                              .reduce(
                                (acc, curr) =>
                                  acc + (curr.percentage * 251.2) / 100,
                                0,
                              );
                            const circumference =
                              (animal.percentage * 251.2) / 100;
                            return (
                              <circle
                                key={index}
                                cx="96"
                                cy="96"
                                r="40"
                                fill="none"
                                stroke={animal.color}
                                strokeWidth="16"
                                strokeDasharray={`${circumference} 251.2`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-300"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold text-[#2B2B2B]">
                              {animalTypes.reduce(
                                (acc, curr) => acc + curr.count,
                                0,
                              )}
                            </div>
                            <div className="text-xs text-[#6A6F7B]">Total</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-[#6A6F7B]">
                        Nenhum dado disponível
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {animalTypes.map((animal, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: animal.color }}
                        ></div>
                        <span className="text-xs text-[#6A6F7B]">
                          {animal.type}: {animal.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regional Distribution */}
                <div
                  className="bg-white border border-[#EDEDED] rounded-lg p-8"
                  style={{ height: "360px" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-medium text-[#6A6F7B]">
                      Animais por Região
                    </h3>
                    <MoreVertical size={18} className="text-[#C9CCD2]" />
                  </div>
                  <div className="h-64 flex items-end justify-center space-x-4">
                    {regionalData.length > 0 ? (
                      regionalData.slice(0, 5).map((region, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="text-xs text-[#6A6F7B] mb-2">
                            {region.animals}
                          </div>
                          <div
                            className="w-12 bg-[#2563eb] rounded-t-md flex items-end justify-center"
                            style={{ height: `${region.height}px` }}
                          ></div>
                          <div className="text-xs text-[#6A6F7B] mt-2 transform rotate-45 origin-bottom-left w-16">
                            {region.region}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-[#6A6F7B]">
                        Nenhum dado disponível
                      </div>
                    )}
                  </div>
                </div>

                {/* Vaccination Trend */}
                <div
                  className="bg-white border border-[#EDEDED] rounded-lg p-8"
                  style={{ height: "360px" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-medium text-[#6A6F7B]">
                      Evolução da Vacinação
                    </h3>
                    <MoreVertical size={18} className="text-[#C9CCD2]" />
                  </div>
                  <div className="h-64 flex items-end justify-center space-x-3">
                    {vaccinationData.length > 0 ? (
                      vaccinationData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="flex flex-col items-center space-y-1">
                            <div
                              className="w-6 bg-[#e5e7eb] rounded-sm"
                              style={{
                                height: `${(data.total / Math.max(...vaccinationData.map((d) => d.total))) * 150}px`,
                              }}
                            ></div>
                            <div
                              className="w-6 bg-[#16a34a] rounded-sm"
                              style={{
                                height: `${(data.vaccinated / Math.max(...vaccinationData.map((d) => d.total))) * 150}px`,
                                marginTop: `-${(data.total / Math.max(...vaccinationData.map((d) => d.total))) * 150}px`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-[#6A6F7B] mt-2">
                            {data.month}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-[#6A6F7B]">
                        Nenhum dado disponível
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center mt-4 space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#16a34a] rounded mr-2"></div>
                      <span className="text-xs text-[#6A6F7B]">Vacinados</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#e5e7eb] rounded mr-2"></div>
                      <span className="text-xs text-[#6A6F7B]">Total</span>
                    </div>
                  </div>
                </div>

                {/* Age Distribution */}
                <div
                  className="bg-white border border-[#EDEDED] rounded-lg p-8"
                  style={{ height: "360px" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-medium text-[#6A6F7B]">
                      Distribuição Etária
                    </h3>
                    <MoreVertical size={18} className="text-[#C9CCD2]" />
                  </div>
                  <div className="h-64 flex items-end justify-center space-x-2">
                    {ageDistribution.length > 0 ? (
                      ageDistribution.map((ageGroup, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="text-xs text-[#6A6F7B] mb-2">
                            {ageGroup.count}
                          </div>
                          <div
                            className="w-8 bg-[#dc2626] rounded-t-md"
                            style={{ height: `${ageGroup.height}px` }}
                          ></div>
                          <div className="text-xs text-[#6A6F7B] mt-2">
                            {ageGroup.age}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-[#6A6F7B]">
                        Nenhum dado disponível
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-white border border-[#EDEDED] rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[#2B2B2B]">
                    Ações Rápidas
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button className="h-10 px-6 bg-[#0066FF] text-white rounded-md text-sm font-medium flex items-center">
                      <Plus size={16} className="mr-2" />
                      Cadastrar Animal
                    </button>
                    <button className="h-10 px-6 border border-[#E5E6EC] text-[#2B2B2B] rounded-md text-sm font-medium flex items-center">
                      <Users size={16} className="mr-2" />
                      Novo Proprietário
                    </button>
                    <button className="h-10 px-6 border border-[#E5E6EC] text-[#2B2B2B] rounded-md text-sm font-medium flex items-center">
                      <FileText size={16} className="mr-2" />
                      Relatório Completo
                    </button>
                    <button className="h-10 px-6 border border-[#E5E6EC] text-[#2B2B2B] rounded-md text-sm font-medium flex items-center">
                      <MapPin size={16} className="mr-2" />
                      Ver Mapa
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
