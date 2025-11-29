import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    
    const result = await login(formData);
    
    if (result.success) {
      toast.success('¡Bienvenido de vuelta!');
      navigate('/');
    } else {
      toast.error(result.error || 'Error al iniciar sesión');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            MyBudget
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="
                    w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="
                    w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full py-3.5 px-4 rounded-xl font-semibold text-white
                bg-gradient-to-r from-purple-600 to-indigo-600
                hover:from-purple-700 hover:to-indigo-700
                shadow-lg shadow-purple-500/30 dark:shadow-purple-900/30
                transition-all duration-200 transform hover:scale-[1.02]
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center gap-2
              "
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
