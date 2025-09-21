// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <div className={inter.className}>
        <Component {...pageProps} />
      </div>
    </LanguageProvider>
  );
}