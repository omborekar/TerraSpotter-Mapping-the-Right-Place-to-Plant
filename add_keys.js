const fs = require('fs');
const path = require('path');

const locales = path.join(__dirname, 'frontend/src/locales');

const newKeys = {
  en: {
    navbar:  { language: "Language", navigation: "Navigation", account: "Account" },
    landing: { page_title: "TerraSpotter \u2014 Land for Green Futures" },
    login:   { page_title: "TerraSpotter \u2014 Sign In", signing_in: "Signing in\u2026" },
    signup:  { page_title: "TerraSpotter \u2014 Sign up", resend_in: "Resend in", didnt_get: "Didn't get it?", resend_otp: "Resend OTP", back_edit: "Back to edit details" },
  },
  hi: {
    navbar:  { language: "\u092d\u093e\u0937\u093e", navigation: "\u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928", account: "\u0916\u093e\u0924\u093e" },
    landing: { page_title: "TerraSpotter \u2014 \u0939\u0930\u093f\u0924 \u092d\u0935\u093f\u0937\u094d\u092f \u0915\u0947 \u0932\u093f\u090f \u092d\u0942\u092e\u093f" },
    login:   { page_title: "TerraSpotter \u2014 \u0938\u093e\u0907\u0928 \u0907\u0928", signing_in: "\u0938\u093e\u0907\u0928 \u0907\u0928 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026" },
    signup:  { page_title: "TerraSpotter \u2014 \u0938\u093e\u0907\u0928 \u0905\u092a", resend_in: "\u092a\u0941\u0928\u0903 \u092d\u0947\u091c\u0947\u0902 \u0907\u0928", didnt_get: "\u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e?", resend_otp: "OTP \u092a\u0941\u0928\u0903 \u092d\u0947\u091c\u0947\u0902", back_edit: "\u0935\u093f\u0935\u0930\u0923 \u092e\u0947\u0902 \u092c\u0926\u0932\u093e\u0935 \u0915\u0930\u0947\u0902" },
  },
  mr: {
    navbar:  { language: "\u092d\u093e\u0937\u093e", navigation: "\u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928", account: "\u0916\u093e\u0924\u0947" },
    landing: { page_title: "TerraSpotter \u2014 \u0939\u0930\u093f\u0924 \u092d\u0935\u093f\u0937\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u091c\u092e\u0940\u0928" },
    login:   { page_title: "TerraSpotter \u2014 \u0938\u093e\u0907\u0928 \u0907\u0928", signing_in: "\u0938\u093e\u0907\u0928 \u0907\u0928 \u0939\u094b\u0924\u0902\u092f\u2026" },
    signup:  { page_title: "TerraSpotter \u2014 \u0928\u094b\u0902\u0926\u0923\u0940", resend_in: "\u092a\u0941\u0928\u094d\u0939\u093e \u092a\u093e\u0920\u0935\u093e", didnt_get: "\u092e\u093f\u0933\u093e\u0932\u0947 \u0928\u093e\u0939\u0940?", resend_otp: "OTP \u092a\u0941\u0928\u094d\u0939\u093e \u092a\u093e\u0920\u0935\u093e", back_edit: "\u0924\u092a\u0936\u0940\u0932 \u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u093e" },
  },
  es: {
    navbar:  { language: "Idioma", navigation: "Navegaci\u00f3n", account: "Cuenta" },
    landing: { page_title: "TerraSpotter \u2014 Tierra para un futuro verde" },
    login:   { page_title: "TerraSpotter \u2014 Iniciar sesi\u00f3n", signing_in: "Iniciando sesi\u00f3n\u2026" },
    signup:  { page_title: "TerraSpotter \u2014 Registrarse", resend_in: "Reenviar en", didnt_get: "\u00bfNo lo recibiste?", resend_otp: "Reenviar c\u00f3digo", back_edit: "Volver a editar datos" },
  },
  de: {
    navbar:  { language: "Sprache", navigation: "Navigation", account: "Konto" },
    landing: { page_title: "TerraSpotter \u2014 Land f\u00fcr eine gr\u00fcne Zukunft" },
    login:   { page_title: "TerraSpotter \u2014 Anmelden", signing_in: "Anmeldung l\u00e4uft\u2026" },
    signup:  { page_title: "TerraSpotter \u2014 Registrieren", resend_in: "Erneut senden in", didnt_get: "Nicht erhalten?", resend_otp: "Code erneut senden", back_edit: "Zur\u00fcck zur Bearbeitung" },
  },
};

for (const [lang, sections] of Object.entries(newKeys)) {
  const filePath = path.join(locales, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [section, keys] of Object.entries(sections)) {
    if (!data[section]) data[section] = {};
    Object.assign(data[section], keys);
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json`);
}
