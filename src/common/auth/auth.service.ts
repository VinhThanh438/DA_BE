import { Users } from ".prisma/client";
import { APIError } from "@common/error/api.error";
import { ErrorCode, StatusCode } from "@common/errors";
import { PasswordHelper } from "@common/helpers/password.helper";
import { DatabaseAdapter } from "@common/infrastructure/database.adapter";
import { PublicUrlPath } from "@config/app.constant";
import { ISignup } from "./auth.interface";

export class AuthService {
    private static db = DatabaseAdapter.getInstance().users;

    public static async login(body: ISignup): Promise<Users> {
        const checkUserName = await this.db.findFirst({
            where: { username: body.username },
            select: { id: true },
        });

        if (checkUserName) {
            throw new APIError({
                message: 'User already exist!',
                status: StatusCode.BAD_REQUEST,
            });
        }

        const newUser = await this.db.create({
            data: {
                type: body.type,
                email: body.email,
                fullname: body.fullname,
                username: body.username,
                password: PasswordHelper.generateHash(body.password),
                avatar: body.avatar || `${PublicUrlPath.PUBLIC_IMAGES}/avatar.jpg`
            },
        });

        return newUser;
    }

    public static async signup(body: any): Promise<void> {}
}