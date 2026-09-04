import {
  SupportedLanguage,
  LanguageMeta,
  FullTranslationDictionary,
} from './types';
import { en } from './en';
import { as } from './as';
import { bn } from './bn';
import { mni } from './mni';
import { brx } from './brx';
import { kh } from './kh';
import { lus } from './lus';
import { ne } from './ne';
import { hi } from './hi';
import { grt } from './grt';
import { nag } from './nag';

export * from './types';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', localName: 'English', region: 'National', displayName: 'English (National)' },
  { code: 'as', name: 'Assamese', localName: 'অসমীয়া', region: 'Assam', displayName: 'অসমীয়া (Assam)' },
  { code: 'bn', name: 'Bengali', localName: 'বাংলা', region: 'Tripura / Cachar', displayName: 'বাংলা (Tripura / Cachar)' },
  { code: 'mni', name: 'Meitei (Manipuri)', localName: 'মৈতৈলোন', region: 'Manipur', displayName: 'মৈতৈলোন (Manipur)' },
  { code: 'brx', name: 'Bodo', localName: 'बड़ो', region: 'BTR / Assam', displayName: 'बड़ो (BTR / Assam)' },
  { code: 'kh', name: 'Khasi', localName: 'Khasi', region: 'Meghalaya', displayName: 'Khasi (Meghalaya)' },
  { code: 'lus', name: 'Mizo', localName: 'Mizo', region: 'Mizoram', displayName: 'Mizo (Mizoram)' },
  { code: 'ne', name: 'Nepali', localName: 'नेपाली', region: 'Sikkim / Assam', displayName: 'नेपाली (Sikkim / Assam)' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी', region: 'National', displayName: 'हिन्दी (National)' },
  { code: 'grt', name: 'Garo', localName: 'A·chik', region: 'Meghalaya', displayName: 'A·chik (Meghalaya)' },
  { code: 'nag', name: 'Nagamese', localName: 'Nagamese', region: 'Nagaland', displayName: 'Nagamese (Nagaland)' },
];

export const translations: Record<SupportedLanguage, FullTranslationDictionary> = {
  en,
  as,
  bn,
  mni,
  brx,
  kh,
  lus,
  ne,
  hi,
  grt,
  nag,
};

export function getTranslation(language: SupportedLanguage = 'en'): FullTranslationDictionary {
  return translations[language] || translations.en;
}

export type TranslatorFunction = ((path: string, fallback?: string) => string) & FullTranslationDictionary;

export function createTranslator(language: SupportedLanguage = 'en'): TranslatorFunction {
  const dict = getTranslation(language);
  const fallbackDict = translations.en;

  const tFunc = function (path: string, fallback?: string): string {
    if (!path) return fallback || '';

    // Direct match on dict top-level
    if (typeof (dict as any)[path] === 'string') {
      return (dict as any)[path];
    }

    // Dot notation match (e.g. 'navigation.commandCenter')
    const parts = path.split('.');
    let cur: any = dict;
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = cur[part];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === 'string') return cur;

    // Fallback to English
    let fbCur: any = fallbackDict;
    for (const part of parts) {
      if (fbCur && typeof fbCur === 'object' && part in fbCur) {
        fbCur = fbCur[part];
      } else {
        fbCur = undefined;
        break;
      }
    }
    if (typeof fbCur === 'string') return fbCur;

    return fallback !== undefined ? fallback : path;
  };

  // Attach all properties from dict onto tFunc for backward compatibility
  Object.assign(tFunc, dict);

  return tFunc as TranslatorFunction;
}
