import { useState } from "react";
import useAuth from "@/utils/useAuth";
import useUser from "@/utils/useUser";
import { PawPrint, LogOut } from "lucide-react";

export default function LogoutPage() {
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();
  const { data: user } = useUser();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({
        callbackUrl: "/account/signin",
        redirect: true,
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0066FF] rounded-full mb-4">
            <PawPrint size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema de Censo Animal
          </h1>
          <p className="text-gray-600">
            Deseja sair do sistema?
          </p>
        </div>

        {/* Logout Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            {user && (
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <span className="text-xl font-medium text-gray-600">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Conectado como
                </p>
                <p className="font-medium text-gray-900">
                  {user.email}
                </p>
              </div>
            )}
            
            <LogOut size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Confirmar Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saindo...
                </div>
              ) : (
                "Sim, Sair do Sistema"
              )}
            </button>

            <a
              href="/"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all text-center"
            >
              Cancelar
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Você pode fazer login novamente a qualquer momento
          </p>
        </div>
      </div>
    </div>
  );
}