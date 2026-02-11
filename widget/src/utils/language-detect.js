export function detectPreferredLanguage(supportedLanguages) {
  const supported = supportedLanguages || ['uz', 'ru', 'en'];
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  const langCode = browserLang.split('-')[0];

  if (supported.includes(langCode)) return langCode;
  return supported[0] || 'en';
}
