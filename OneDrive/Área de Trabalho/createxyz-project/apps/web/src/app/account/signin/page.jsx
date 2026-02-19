import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { PawPrint, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        CredentialsSignin: "Email ou senha incorretos. Tente novamente.",
        AccessDenied: "Você não tem permissão para acessar o sistema.",
        OAuthSignin: "Erro no processo de login. Tente novamente.",
        Configuration: "Sistema temporariamente indisponível. Tente mais tarde.",
      };

      setError(
        errorMessages[err.message] || "Erro no login. Tente novamente."
      );
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
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form noValidate onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF] focus:ring-opacity-20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF] focus:ring-opacity-20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066FF] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <a
                  href={`/account/signup${
                    typeof window !== "undefined" ? window.location.search : ""
                  }`}
                  className="text-[#0066FF] hover:text-[#0052CC] font-medium"
                >
                  Cadastre-se
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Sistema desenvolvido para gestão de censo animal doméstico
          </p>
        </div>
      </div>
    </div>
  );
}