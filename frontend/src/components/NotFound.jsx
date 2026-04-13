/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: 404 Catch-All Route Component.
*/
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
             <AlertTriangle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
