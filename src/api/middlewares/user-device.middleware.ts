import { Request, Response, NextFunction } from 'express';

export class UserDeviceMiddleware {
    /**
     * Middleware to extract user device information from the request.
     * Adds the extracted information to req.userDevice for later use in controllers or other middleware.
     */
    static async getUserDevice(req: Request, res: Response, next: NextFunction) {
        try {
            // Get user request info (IP & User-Agent & Device)
            const requestInfo = req.getRequestInfo();

            req.userDevice = requestInfo;

            next();
        } catch (error) {
            next(error);
        }
    }
}
