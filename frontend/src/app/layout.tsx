'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Listen for dark mode changes
    const handleDarkModeChange = () => {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(darkMode);
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    window.addEventListener('storage', handleDarkModeChange);
    // Custom event for same-page updates
    window.addEventListener('darkModeChange', handleDarkModeChange);

    return () => {
      window.removeEventListener('storage', handleDarkModeChange);
      window.removeEventListener('darkModeChange', handleDarkModeChange);
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
