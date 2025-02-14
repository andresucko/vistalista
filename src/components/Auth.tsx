import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Globe } from 'lucide-react';

interface Translations {
  [key: string]: {
    signInTitle: string;
    signUpTitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    signInButton: string;
    signUpButton: string;
    needAccount: string;
    haveAccount: string;
    loading: string;
  };
}

const translations: Translations = {
  en: {
    signInTitle: 'Sign in to your account',
    signUpTitle: 'Create your account',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    signInButton: 'Sign in',
    signUpButton: 'Sign up',
    needAccount: 'Need an account? Sign up',
    haveAccount: 'Already have an account? Sign in',
    loading: 'Loading...',
  },
  es: {
    signInTitle: 'Iniciar sesión en tu cuenta',
    signUpTitle: 'Crear tu cuenta',
    emailPlaceholder: 'Correo electrónico',
    passwordPlaceholder: 'Contraseña',
    signInButton: 'Iniciar sesión',
    signUpButton: 'Registrarse',
    needAccount: '¿Necesitas una cuenta? Regístrate',
    haveAccount: '¿Ya tienes una cuenta? Inicia sesión',
    loading: 'Cargando...',
  },
};

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const t = translations[currentLanguage];

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md relative">
        {/* Language toggle button - Fixed position */}
        <button
          onClick={toggleLanguage}
          className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
          aria-label={currentLanguage === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
        >
          <Globe className="w-5 h-5" />
        </button>

        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? t.signInTitle : t.signUpTitle}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.emailPlaceholder}
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.passwordPlaceholder}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                t.loading
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  {t.signInButton}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.signUpButton}
                </>
              )}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isLogin ? t.needAccount : t.haveAccount}
          </button>
        </div>
      </div>
    </div>
  );
}