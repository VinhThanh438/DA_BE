import puppeteer, { Browser } from 'puppeteer';
import logger from '@common/logger';

export class PuppeteerAdapter {
    private static instance: PuppeteerAdapter;
    private browserPool: Browser[] = [];
    private maxPoolSize = 3;
    private inUse: Set<Browser> = new Set();

    private constructor() {}

    public static getInstance(): PuppeteerAdapter {
        if (!PuppeteerAdapter.instance) {
            PuppeteerAdapter.instance = new PuppeteerAdapter();
        }
        return PuppeteerAdapter.instance;
    }

    public async getBrowser(): Promise<Browser> {
        // check available browser in the pool
        const availableBrowser = this.browserPool.find((browser) => !this.inUse.has(browser));

        if (availableBrowser) {
            this.inUse.add(availableBrowser);
            return availableBrowser;
        }

        // if no available browser, create a new one if under max pool size
        if (this.browserPool.length < this.maxPoolSize) {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            this.browserPool.push(browser);
            this.inUse.add(browser);
            return browser;
        }

        // if pool is full, wait for an available browser
        logger.warn('Puppeteer browser pool is full, waiting for available browser...');
        return new Promise((resolve) => {
            const checkInterval = setInterval(async () => {
                const browser = this.browserPool.find((browser) => !this.inUse.has(browser));
                if (browser) {
                    clearInterval(checkInterval);
                    this.inUse.add(browser);
                    resolve(browser);
                }
            }, 300);
        });
    }

    public releaseBrowser(browser: Browser): void {
        this.inUse.delete(browser);
    }

    public async disconnect(): Promise<void> {
        await Promise.all(this.browserPool.map((browser) => browser.close()));
        this.browserPool = [];
        this.inUse.clear();
    }
}
