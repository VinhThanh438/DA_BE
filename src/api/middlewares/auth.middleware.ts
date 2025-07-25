import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import eventbus from '@common/eventbus';
import { TokenHelper } from '@common/helpers/token.helper';
import { IPayload } from '@common/interfaces/auth.interface';
import logger from '@common/logger';
import { AuthService } from '@common/services/auth.service';
import { UserService } from '@common/services/user.service';
import { EVENT_TOKEN_EXPIRED } from '@config/event.constant';
import { Request, Response, NextFunction } from 'express';

export class AuthMiddleware {
    /**
     * Build static function to reduce memory when use AuthMiddleware.authenticate for each routing
     *
     * @static
     * @memberOf AuthMiddleware
     */

    private static getUserFromToken(token: string): IPayload | null {
        try {
            return TokenHelper.decodeToken(token) as IPayload;
        } catch (error) {
            return null;
        }
    }

    public static async authenticate(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.cookies['access_token'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new APIError({
                    message: 'auth.common.token-missing',
                    status: StatusCode.REQUEST_UNAUTHORIZED,
                });
            }

            const deviceId = req?.userDevice?.device;
            if (!deviceId) {
                throw new APIError({
                    message: 'auth.login.device-not-found',
                    status: StatusCode.REQUEST_FORBIDDEN,
                });
            }
            const accessToken = authHeader.split(' ')[1];

            try {
                const user = TokenHelper.verifyToken(accessToken, deviceId) as IPayload;

                req.user = user;

                const userData = await UserService.getInstance().findOne({ id: user.id });

                if (userData?.is_disabled) {
                    throw new APIError({
                        message: 'auth.common.account-locked',
                        status: StatusCode.ACCOUNT_LOCKED,
                    });
                }

                res.cookie('access_token', 'Bearer ' + accessToken);
                return next();
            } catch (err: any) {
                if (err.name === 'TokenExpiredError') {
                    // handle refresh token
                    const refreshToken = req.cookies['refresh_token'];
                    const userToken = await AuthService.getUserToken({ refresh_token: refreshToken });
                    if (!userToken) {
                        throw new APIError({
                            message: 'auth.common.session-expired',
                            status: StatusCode.REQUEST_UNAUTHORIZED,
                        });
                    }
                    // check expired time
                    if (TokenHelper.isTokenExpired(refreshToken, deviceId)) {
                        // delete token
                        eventbus.emit(EVENT_TOKEN_EXPIRED, userToken.id);
                        throw new APIError({
                            message: 'auth.common.session-expired',
                            status: StatusCode.REQUEST_UNAUTHORIZED,
                        });
                    }

                    // generate new access token
                    const user = AuthMiddleware.getUserFromToken(accessToken);
                    if (!user) {
                        throw new APIError({
                            message: 'auth.common.invalid-token',
                            status: StatusCode.REQUEST_UNAUTHORIZED,
                        });
                    }
                    const newAccessToken = TokenHelper.generateToken(
                        { id: user.id, employee_id: user.employee_id },
                        deviceId,
                    );

                    res.cookie('access_token', 'Bearer ' + newAccessToken);
                    req.user = user;
                    return next();
                }
                throw new APIError({
                    message: err.message,
                    status: StatusCode.REQUEST_UNAUTHORIZED,
                });
            }
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }
}
