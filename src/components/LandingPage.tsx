import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle, Globe, Smartphone, ArrowRight } from 'lucide-react';

interface Translations {
  [key: string]: {
    login: string;
    getStarted: string;
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    startFree: string;
    features: {
      easyToUse: {
        title: string;
        description: string;
      };
      bilingual: {
        title: string;
        description: string;
      };
      mobile: {
        title: string;
        description: string;
      };
    };
    footer: {
      rights: string;
    };
  };
}

const translations: Translations = {
  en: {
    login: 'Login',
    getStarted: 'Get Started',
    heroTitle1: 'Smart Shopping Lists for',
    heroTitle2: 'Modern Shoppers',
    heroSubtitle: 'Organize your shopping experience with VistaList. Create, share, and manage your shopping lists effortlessly across all your devices.',
    startFree: 'Start for Free',
    features: {
      easyToUse: {
        title: 'Easy to Use',
        description: 'Simple and intuitive interface for managing your shopping lists efficiently.'
      },
      bilingual: {
        title: 'Bilingual Support',
        description: 'Full support for English and Spanish to serve a wider community.'
      },
      mobile: {
        title: 'Mobile Friendly',
        description: 'Access your lists from any device with our responsive design.'
      }
    },
    footer: {
      rights: 'All rights reserved.'
    }
  },
  es: {
    login: 'Iniciar Sesión',
    getStarted: 'Comenzar',
    heroTitle1: 'Listas de Compras Inteligentes para',
    heroTitle2: 'Compradores Modernos',
    heroSubtitle: 'Organiza tu experiencia de compras con VistaList. Crea, comparte y gestiona tus listas de compras sin esfuerzo en todos tus dispositivos.',
    startFree: 'Comienza Gratis',
    features: {
      easyToUse: {
        title: 'Fácil de Usar',
        description: 'Interfaz simple e intuitiva para gestionar tus listas de compras de manera eficiente.'
      },
      bilingual: {
        title: 'Soporte Bilingüe',
        description: 'Soporte completo en inglés y español para servir a una comunidad más amplia.'
      },
      mobile: {
        title: 'Compatible con Móviles',
        description: 'Accede a tus listas desde cualquier dispositivo con nuestro diseño responsive.'
      }
    },
    footer: {
      rights: 'Todos los derechos reservados.'
    }
  }
};

export function LandingPage() {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const t = translations[currentLanguage];

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VistaList</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle language"
              >
                <Globe className="h-5 w-5" />
              </button>
              <Link
                to="/auth"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t.login}
              </Link>
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
              {t.heroTitle1}
              <span className="block text-blue-600">{t.heroTitle2}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t.heroSubtitle}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {t.startFree} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t.features.easyToUse.title}</h3>
              <p className="mt-2 text-gray-600">
                {t.features.easyToUse.description}
              </p>
            </div>
            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-4">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t.features.bilingual.title}</h3>
              <p className="mt-2 text-gray-600">
                {t.features.bilingual.description}
              </p>
            </div>
            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-4">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t.features.mobile.title}</h3>
              <p className="mt-2 text-gray-600">
                {t.features.mobile.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-gray-900 font-semibold">VistaList</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} VistaList. {t.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}