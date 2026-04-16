/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: React app entry point with Google OAuth provider.
*/
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import "./i18n"; // Import i18n configuration

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </>
);
