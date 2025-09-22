// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import '@/styles/globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <Head>
        <link rel="icon" href="/smart-life.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/smart-life.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/smart-life.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/smart-life.ico" />
        <meta name="theme-color" content="#483C8E" />
      </Head>
      <div className={inter.className}>
        <Component {...pageProps} />
      </div>
    </LanguageProvider>
  );
}