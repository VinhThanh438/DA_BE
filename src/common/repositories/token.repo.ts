import { Prisma, Tokens } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export class TokenRepo {
    private static db = DatabaseAdapter.getInstance().tokens;

    public static async delete(id: number): Promise<Partial<Tokens> | null> {
        return this.db.delete({
            where: { id },
        });
    }

    public static async findOne(where: Prisma.TokensWhereInput): Promise<Tokens | null> {
        return this.db.findFirst({
            where,
        });
    }

    public static async create(data: Prisma.TokensCreateInput): Promise<Tokens> {
        return this.db.create({
            data,
        });
    }

    public static async deleteMany(where: Prisma.TokensWhereInput): Promise<Prisma.BatchPayload> {
        return this.db.deleteMany({
            where,
        });
    }
}
