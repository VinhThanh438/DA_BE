import { Prisma, Tokens, Users } from '.prisma/client';
import { ADMIN_USER_NAME } from '@common/environment';
import { APIError } from '@common/error/api.error';
import { ErrorCode, StatusCode } from '@common/errors';
import eventbus from '@common/eventbus';
import { PasswordHelper } from '@common/helpers/password.helper';
import { TokenHelper } from '@common/helpers/token.helper';
import {
    ICreateDeviceRequest,
    ICreateToken,
    ILoginRequest,
    ILoginResponse,
    IPayload,
} from '@common/interfaces/auth.interface';
import { IEventUserFirstLoggin } from '@common/interfaces/user.interface';
import logger from '@common/logger';
import { TokenRepo } from '@common/repositories/token.repo';
import { UserRepo } from '@common/repositories/user.repo';
import { REFRESH_TOKEN_EXPIRED_TIME } from '@config/app.constant';
import { EVENT_DEVICE_PENDING_APPROVAL, EVENT_USER_FIRST_LOGGIN, EVENT_USER_LOGIN } from '@config/event.constant';

export class AuthService {
    private static userRepo: UserRepo = new UserRepo();

    public static async login(body: ILoginRequest): Promise<ILoginResponse> {
        if (!body.device && body.username !== ADMIN_USER_NAME) {
            throw new APIError({
                message: 'auth.login.device-not-found',
                status: StatusCode.REQUEST_FORBIDDEN,
            });
        }

        const user = await this.userRepo.getDetailInfo({ username: body.username });

        if (!user) {
            throw new APIError({
                message: 'auth.login.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }

        if (body.password !== user.password) {
            throw new APIError({
                message: 'auth.login.invalid-password',
                status: ErrorCode.BAD_REQUEST,
            });
        }

        if (!user.device_uid?.includes(body.device as string) && user.username !== ADMIN_USER_NAME) {
            if (!user.is_first_loggin) {
                eventbus.emit(EVENT_DEVICE_PENDING_APPROVAL, {
                    device: body.device,
                    ip: body.ip,
                    ua: body.ua,
                    userId: user.id,
                    email: user.email,
                    name: user?.username,
                } as unknown as ICreateDeviceRequest);
                throw new APIError({
                    message: 'auth.login.device-pending-approval',
                    status: StatusCode.REQUEST_FORBIDDEN,
                });
            }
            eventbus.emit(EVENT_USER_FIRST_LOGGIN, {
                id: user.id,
                device: body.device,
                status: false,
            } as IEventUserFirstLoggin);
        }

        const transFormUserData: IPayload = {
            id: user.id as number,
        };

        const result = {
            access_token: TokenHelper.generateToken(transFormUserData, body.device),
            refresh_token: TokenHelper.generateToken(transFormUserData, body.device, REFRESH_TOKEN_EXPIRED_TIME),
        } as ILoginResponse;

        eventbus.emit(EVENT_USER_LOGIN, {
            userId: user.id,
            refreshToken: result.refresh_token,
            ua: body.ua,
            ip: body.ip,
        } as ICreateToken);

        return result;
    }

    public static async logOut(refreshToken: string) {
        const userToken = await TokenRepo.findOne({ refresh_token: refreshToken });
        if (!userToken) {
            throw new APIError({
                message: 'user.common.not-found',
                status: ErrorCode.REQUEST_UNAUTHORIZED,
            });
        }

        await this.deleteToken(userToken.id);
        logger.info('Token deleted');
    }

    public static async getUserToken(data: Prisma.TokensWhereInput): Promise<Tokens> {
        const user = await TokenRepo.findOne(data);

        if (!user) {
            throw new APIError({
                message: 'auth.login.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }

        return user;
    }

    public static async getInfo(id: number): Promise<Partial<Users>> {
        const user = await this.userRepo.findOne({ id });

        if (!user) {
            throw new APIError({
                message: 'auth.login.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }

        return user;
    }

    public static async deleteToken(id: number): Promise<void> {
        const tokenDeleted = await TokenRepo.delete(id);
        if (!tokenDeleted) {
            logger.info('Token not found!');
        }
    }

    public static async createToken(data: ICreateToken) {
        await TokenRepo.create({
            user: {
                connect: {
                    id: data.userId,
                },
            },
            refresh_token: data.refreshToken,
            user_agent: data.ua,
            ip_address: data.ip,
        });
    }

    public static async revokeAllTokens(userId: number): Promise<void> {
        await TokenRepo.deleteMany({ user_id: userId });
    }
}
