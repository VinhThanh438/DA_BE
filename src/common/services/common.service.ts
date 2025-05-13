import { APIError } from "@common/error/api.error";
import { StatusCode } from "@common/errors";
import { generateUniqueCode } from "@common/helpers/generate-unique-code.helper";
import { ModelPrefixMap, ModelStringMaps, PrefixCode } from "@config/app.constant";

export class CommonService {
    private static resolvePrefixCode(name: string): PrefixCode {
        const entityName = name.toUpperCase();
        const prefix = ModelPrefixMap[entityName];

        if (!prefix) {
            return ModelPrefixMap[PrefixCode.OTHER];
        }

        return prefix;
    }

    public static async getCode(modelName: string): Promise<string> {
        if (!modelName || !(modelName in ModelStringMaps)) {
            throw new APIError({
                message: 'model.not_found',
                status: StatusCode.BAD_REQUEST,
            });
        }

        let lastRecord = await ModelStringMaps[modelName].findFirst({
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
                code: true,
            },
        });

        if (!lastRecord) lastRecord = 0;

        const generateCodeWithCheck = async (lastCode: string | null): Promise<string> => {
            let addCodeString = 0;
            const newCode = generateUniqueCode({
                lastCode,
                prefix: this.resolvePrefixCode(modelName),
            });

            const existingRecord = await ModelStringMaps[modelName].findFirst({
                where: {
                    code: newCode,
                },
            });

            if (existingRecord) {
                addCodeString++;
                return generateCodeWithCheck(`${lastCode}${addCodeString}`);
            }

            return newCode;
        };

        return generateCodeWithCheck(lastRecord?.code || null);
    }
}
