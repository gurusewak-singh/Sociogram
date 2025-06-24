import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-6">Settings</h1>
          
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <p className="text-neutral-600 dark:text-neutral-300">Theme</p>
              <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-full ${theme === 'light' ? 'bg-white shadow' : ''}`}
                >
                  <FaSun className="text-yellow-500" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-full ${theme === 'dark' ? 'bg-neutral-800 shadow' : ''}`}
                >
                  <FaMoon className="text-neutral-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default SettingsPage;