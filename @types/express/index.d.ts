declare global {
    namespace Express {
        interface Request {
            // rawBody: Buffer;
            // user: IPayload;
            // headers(data: unknown): this;
        }

        interface Response {
            sendJson(data: unknown): this;
        }
    }
}

export {};
