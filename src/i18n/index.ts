export { default as nl } from './nl';
export { default as en } from './en';
export type { Translations } from './nl';

export type Lang = 'nl' | 'en';

import nl from './nl';
import en from './en';

export const translations = { nl, en } as const;
