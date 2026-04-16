import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group inline-block z-50 mt-1">
      <button className="flex items-center space-x-1 text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 font-medium transition-colors">
        <Globe className="w-5 h-5" />
        <span className="uppercase text-sm">{i18n.language?.split('-')[0] || 'en'}</span>
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-200 dark:border-slate-700">
        <ul className="py-1">
          <li>
            <button
              onClick={() => changeLanguage('en')}
              className={`block w-full text-left px-4 py-2 text-sm ${i18n.language?.startsWith('en') ? 'text-green-600 font-bold bg-green-50 dark:bg-green-900/20' : 'text-slate-700 dark:text-slate-300'} hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              English
            </button>
          </li>
          <li>
            <button
              onClick={() => changeLanguage('hi')}
              className={`block w-full text-left px-4 py-2 text-sm ${i18n.language?.startsWith('hi') ? 'text-green-600 font-bold bg-green-50 dark:bg-green-900/20' : 'text-slate-700 dark:text-slate-300'} hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              हिन्दी
            </button>
          </li>
          <li>
            <button
              onClick={() => changeLanguage('mr')}
              className={`block w-full text-left px-4 py-2 text-sm ${i18n.language?.startsWith('mr') ? 'text-green-600 font-bold bg-green-50 dark:bg-green-900/20' : 'text-slate-700 dark:text-slate-300'} hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              मराठी
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
