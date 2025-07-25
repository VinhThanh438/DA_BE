import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { generateUniqueCode } from '@common/helpers/generate-unique-code.helper';
import { IProduct } from '@common/interfaces/product.interface';
import { IStockTracking } from '@common/interfaces/stock-tracking.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { ModelPrefixMap, ModelStringMaps, PrefixCode } from '@config/app.constant';

export class CommonService {
    private static commonDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private static productRepo: ProductRepo = new ProductRepo();

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

    public static async getContent(detailsData: any[]): Promise<string> {
        const data = await Promise.all(
            detailsData.map(async (item) => {
                const id = item.order_detail_id || item.id;
                const orderDetail = await this.commonDetailRepo.findOne({ id }, true);
                const product = await this.productRepo.findOne({ id: orderDetail?.product_id as number });

                return product?.name;
            }),
        );

        return data.join(', ');
    }

    static transformProductDataStock(product: IProduct): IProduct {
        const value =
            (product.stock_trackings || []).length > 0 ? product.stock_trackings : product.stock_trackings_child;
        let stockTrackings: IStockTracking[] = value || [];
        // if (warehouseId) {
        //     stockTrackings = (stockTrackings).filter((x: IStockTracking) => x.warehouse_id === warehouseId)
        // }

        const totalBalance = stockTrackings.reduce((sum, tracking) => {
            return sum + tracking.current_balance;
        }, 0);

        return {
            ...product,
            stock_trackings: stockTrackings,
            current_balance: totalBalance,
        };
    }
}
