/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: 404 page — dark-first Tailwind.
*/
import { useTranslation } from "react-i18next";
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { motion } from "framer-motion";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-primary/10 border border-primary/20 p-5 rounded-full">
            <AlertTriangle className="h-16 w-16 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            {t("auto.auto_247", "404 — Page Not Found")}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            {t("auto.auto_248", "Oops! The page you are looking for does not exist or has been moved.")}
          </p>
        </div>
        <div className="flex justify-center">
          <Link to="/"
            className="inline-flex items-center px-7 py-3.5 bg-primary text-primary-foreground text-[15px] font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5">
            {t("auto.auto_249", "Return Home")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
