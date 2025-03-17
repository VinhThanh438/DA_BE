import { Topics } from ".prisma/client";
import { ICreateTopic } from "./topic.interface";
import { DatabaseAdapter  } from "@common/infrastructure/database.adapter";
import { APIError } from "@common/error/api.error";
import { StatusCode } from "@common/errors";

export class TopicService {
    private static db = DatabaseAdapter.getInstance().topics;

    static async exists(name: string): Promise<Topics> {
        return await this.db.findFirst({
            where: {
                name,
            },
        });
    }

    static async create(body: ICreateTopic): Promise<Topics> {
        const existData = await this.exists(body.name);
        if (existData) {
            throw new APIError({
                message: 'Topic name existed!',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const data = await this.db.create({
            data: {
                name: body.name,
            },
        });

        return data;
    }

    static async getAll(keyWord: string): Promise<Topics[]> {
        if (keyWord.trim() !== '') {
            return await this.db.findMany({
                where: {
                    name: { contains: keyWord, mode: 'insensitive' },
                },
            });
        } else {
            return await this.db.findMany({
                orderBy: {
                    id: 'desc',
                },
                take: 5,
            });
        }
    }
}