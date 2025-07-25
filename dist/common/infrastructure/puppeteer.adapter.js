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
exports.PuppeteerAdapter = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = __importDefault(require("../logger"));
class PuppeteerAdapter {
    constructor() {
        this.browserPool = [];
        this.maxPoolSize = 3;
        this.inUse = new Set();
    }
    static getInstance() {
        if (!PuppeteerAdapter.instance) {
            PuppeteerAdapter.instance = new PuppeteerAdapter();
        }
        return PuppeteerAdapter.instance;
    }
    getBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            // check available browser in the pool
            const availableBrowser = this.browserPool.find((browser) => !this.inUse.has(browser));
            if (availableBrowser) {
                this.inUse.add(availableBrowser);
                return availableBrowser;
            }
            // if no available browser, create a new one if under max pool size
            if (this.browserPool.length < this.maxPoolSize) {
                const browser = yield puppeteer_1.default.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
                this.browserPool.push(browser);
                this.inUse.add(browser);
                return browser;
            }
            // if pool is full, wait for an available browser
            logger_1.default.warn('Puppeteer browser pool is full, waiting for available browser...');
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    const browser = this.browserPool.find((browser) => !this.inUse.has(browser));
                    if (browser) {
                        clearInterval(checkInterval);
                        this.inUse.add(browser);
                        resolve(browser);
                    }
                }), 300);
            });
        });
    }
    releaseBrowser(browser) {
        this.inUse.delete(browser);
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.browserPool.map((browser) => browser.close()));
            this.browserPool = [];
            this.inUse.clear();
        });
    }
}
exports.PuppeteerAdapter = PuppeteerAdapter;
