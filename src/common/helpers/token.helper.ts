import jwt, { JwtPayload } from 'jsonwebtoken';
import { IPayload } from '@common/interfaces/auth.interface';
import { ACCESS_TOKEN_EXPIRED_TIME } from '@config/app.constant';
import { JWT_PRIVATE_KEY } from '@common/environment';
import { StringValue } from 'ms';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';

export class TokenHelper {
    public static generateToken(payload: IPayload, key?: string, ttl?: number | StringValue): string {
        const secretKey = key + JWT_PRIVATE_KEY;
        return jwt.sign(payload, secretKey, {
            expiresIn: ttl || ACCESS_TOKEN_EXPIRED_TIME,
        });
    }

    public static decodeToken(token: string) {
        return jwt.decode(token) as JwtPayload;
    }

    public static verifyToken(token: string, key?: string) {
        const secretKey = key + JWT_PRIVATE_KEY;
        return jwt.verify(token, secretKey) as JwtPayload;
    }

    public static isTokenExpired(token: string, key?: string): boolean {
        try {
            const secretKey = key + JWT_PRIVATE_KEY;
            const decoded = jwt.verify(token, secretKey) as JwtPayload;

            if (!decoded.exp) return true;

            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            return expirationTime <= currentTime;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') return true;

            throw new APIError({
                message: 'auth.common.invalid-token',
                status: StatusCode.REQUEST_UNAUTHORIZED,
            });
        }
    }
}
