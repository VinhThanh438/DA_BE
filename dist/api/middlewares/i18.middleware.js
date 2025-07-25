"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app_constant_1 = require("../../config/app.constant");
let i18nInstance;
const LANGUAGES = [app_constant_1.Language.EN, app_constant_1.Language.VN];
exports.default = {
    LANGUAGES,
    getI18n() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!i18nInstance) {
                const [enData, viData] = yield Promise.all([
                    fs_1.default.promises.readFile(path_1.default.join(__dirname, '../../../locales/en.json'), 'utf8'),
                    fs_1.default.promises.readFile(path_1.default.join(__dirname, '../../../locales/vi.json'), 'utf8'),
                ]);
                yield i18next_1.default.use(i18next_http_middleware_1.default.LanguageDetector).init({
                    preload: LANGUAGES,
                    fallbackLng: app_constant_1.Language.VN,
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
                i18nInstance = i18next_1.default;
            }
            return i18nInstance;
        });
    },
};
