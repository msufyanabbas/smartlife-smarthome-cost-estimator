// src/components/Layout/Footer.tsx
import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="relative bg-gray-900 text-white">
      <div className="container mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className={`flex items-center gap-2`}>
              <div className="w-15 h-15 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg"><img src='./smart-life.ico' alt='Smart Life' /></span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isRTL ? 'font-arabic' : ''}`}>{t('footer.company.name')}</h3>
                <p className={`text-gray-400 text-sm ${isRTL ? 'font-arabic' : ''}`}>
                  {t('footer.company.tagline')}
                </p>
              </div>
            </div>
            <p className={`text-gray-300 text-sm leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
              {t('footer.company.description')}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className={`text-lg font-semibold text-white ${isRTL ? 'font-arabic' : ''}`}>
              {t('footer.contact.title')}
            </h4>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 text-gray-300 ${
                isRTL ? 'font-arabic' : ''
              }`}>
                <FaPhone className="text-accent-400" />
                <span className={`isRTL ? "font-arabic"`}>{t('footer.contact.phone')}</span>
              </div>
              <div className={`flex items-center gap-3 text-gray-300 ${
                isRTL ? 'font-arabic' : ''
              }`}>
                <FaEnvelope className="text-accent-400" />
                <span className="text-sm">iot@smart-life.sa</span>
              </div>
              <div className={`flex items-center gap-3 text-gray-300 ${
                isRTL ? 'font-arabic' : ''
              }`}>
                <FaMapMarkerAlt className="text-accent-400" />
                <span className={`text-sm ${isRTL ? 'font-arabic' : ''}`}>
                  {t('footer.contact.location')}
                </span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className={`text-lg font-semibold text-white ${isRTL ? 'font-arabic' : ''}`}>
              {t('footer.services.title')}
            </h4>
            <div className="space-y-2">
              <a 
                href="#" 
                className={`block text-gray-300 hover:text-accent-400 transition-colors text-sm ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.services.security')}
              </a>
              <a 
                href="#" 
                className={`block text-gray-300 hover:text-accent-400 transition-colors text-sm ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.services.automation')}
              </a>
              <a 
                href="#" 
                className={`block text-gray-300 hover:text-accent-400 transition-colors text-sm ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.services.climate')}
              </a>
              <a 
                href="#" 
                className={`block text-gray-300 hover:text-accent-400 transition-colors text-sm ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.services.entertainment')}
              </a>
              <a 
                href="#" 
                className={`block text-gray-300 hover:text-accent-400 transition-colors text-sm ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.services.installation')}
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className={`text-lg font-semibold text-white ${isRTL ? 'font-arabic' : ''}`}>
              {t('footer.social.title')}
            </h4>
            <div className={`flex gap-4 ${isRTL ? 'font-arabic' : 'space-x-4'}`}>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-accent-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <FaFacebook className="text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-accent-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <FaTwitter className="text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-accent-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <FaLinkedin className="text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-accent-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <FaInstagram className="text-white" />
              </a>
            </div>
            <div className="mt-6">
              <h5 className={`text-sm font-semibold text-white mb-2 ${
                isRTL ? 'font-arabic' : ''
              }`}>
                {t('footer.showroom.title')}
              </h5>
              <p className={`text-gray-300 text-sm ${isRTL ? 'font-arabic' : ''}`}>
                {t('footer.showroom.description')}
              </p>
              <p className={`text-accent-400 text-sm mt-1 ${isRTL ? 'font-arabic' : ''}`}>
                {t('footer.showroom.hours')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`text-gray-400 text-sm ${isRTL ? 'font-arabic' : ''}`}>
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;