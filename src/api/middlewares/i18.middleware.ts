import i18next, { i18n } from 'i18next';
import i18nMiddleware from 'i18next-http-middleware';
import path from 'path';
import fs from 'fs';
import { Language } from '@config/app.constant';

let i18nInstance: i18n;

const LANGUAGES = [Language.EN, Language.VN];

export default {
    LANGUAGES,
    async getI18n(): Promise<i18n> {
        if (!i18nInstance) {
            const [enData, viData] = await Promise.all([
                fs.promises.readFile(path.join(__dirname, '../../../locales/en.json'), 'utf8'),
                fs.promises.readFile(path.join(__dirname, '../../../locales/vi.json'), 'utf8'),
            ]);

            await i18next.use(i18nMiddleware.LanguageDetector).init({
                preload: LANGUAGES,
                fallbackLng: Language.VN,
                resources: {
                    en: JSON.parse(enData),
                    vi: JSON.parse(viData),
                },
                detection: {
                    lookupQuerystring: 'lang',
                    lookupHeader: 'accept-language',
                },
                load: 'languageOnly',
            });
            i18nInstance = i18next;
        }
        return i18nInstance;
    },
};
