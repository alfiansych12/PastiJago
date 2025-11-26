// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { GroupProvider } from '@/contexts/GroupContext';
import { AIAssistantProvider } from '@/contexts/AIAssistantContext';
import AIAssistantButton from '@/components/AIAssistantButton';
import AIAssistant from '@/components/AIAssistant'; // IMPORT GLOBAL

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono'
});

export const metadata = {
  title: 'PastiJago - Belajar Programming Interaktif',
  description: 'Platform belajar programming melalui tantangan coding interaktif untuk SMK',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <GroupProvider>
            <AIAssistantProvider>
              <div className="page-background">
                <div className="bg-shapes">
                  <div className="shape-1"></div>
                  <div className="shape-2"></div>
                  <div className="shape-3"></div>
                </div>
              </div>
              <Navigation />
              
              {/* AI Assistant GLOBAL - akan muncul di semua halaman */}
              <AIAssistant />
              <AIAssistantButton />
              
              <main>{children}</main>
            </AIAssistantProvider>
          </GroupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}