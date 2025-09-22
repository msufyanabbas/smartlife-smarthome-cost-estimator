// src/components/Layout/Header.tsx
import React from 'react';
import Image from 'next/image';
import { FaHome, FaRocket, FaCog } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';

const Header: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <header className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-primary-900" />
      
      {/* Language Switcher - Fixed position */}
      <div className={`absolute top-6 z-20 ${isRTL ? 'left-6' : 'right-6'}`}>
        <LanguageSwitcher />
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center">
          {/* Company Logo */}
          <div className="flex justify-center">
            <div>
              <div className="flex items-center gap-4">
                {/* Company Logo Image */}
                <div className="relative w-40 h-40 lg:w-40 lg:h-40">
                  {!isRTL ? <Image
                    src="/smart-life-logo-white-text.png"
                    alt="SmartLife Company Logo"
                    fill
                    className="object-contain"
                    priority
                  /> : <Image 
                  src="/smart-life.ico"
                    alt="Smart Life Company Logo"
                    fill
                    className='object-contain'
                    priority
                    />
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className={`text-4xl lg:text-6xl font-bold text-white mb-4 tracking-tight ${
            isRTL ? 'font-arabic' : ''
          }`}>
            {t('header.title')}
          </h1>
          
          {/* Subtitle */}
<p className={`text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto font-light leading-relaxed ${
  isRTL ? 'font-arabic text-center' : 'text-center'
}`}>
  {t('header.subtitle')}
</p>
          
          {/* Feature Pills */}
          <div className={`flex flex-wrap justify-center gap-4 mt-4 ${
            isRTL ? '' : ''
          }`}>
            <div className="glass px-6 py-3 rounded-full border border-white/30">
              <div className={`flex items-center gap-2 text-white ${
                isRTL ? '' : ''
              }`}>
                <FaRocket className={`${isRTL ? "-scale-x-100": ""}`} />
                <span className={`font-medium ${isRTL ? 'font-arabic' : ''}`}>
                  {t('header.features.aiPowered')}
                </span>
              </div>
            </div>
            <div className="glass px-6 py-3 rounded-full border border-white/30">
              <div className={`flex items-center gap-2 text-white ${
                isRTL ? '' : ''
              }`}>
                <FaCog  />
                <span className={`font-medium ${isRTL ? 'font-arabic' : ''}`}>
                  {t('header.features.professionalInstallation')}
                </span>
              </div>
            </div>
            <div className="glass px-6 py-3 rounded-full border border-white/30">
              <div className={`flex items-center gap-2 text-white ${
                isRTL ? '' : ''
              }`}>
                <FaHome  />
                <span className={`font-medium ${isRTL ? 'font-arabic' : ''}`}>
                  {t('header.features.warranty')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;