import { SearchField } from '@common/interfaces/common.interface';
import { Prisma } from '@prisma/client';

class PrismaSearchBuilder {
    /**
     * Tạo điều kiện tìm kiếm thông minh hỗ trợ nhiều kiểu tìm kiếm
     * @param keyword Từ khóa tìm kiếm
     * @param fields Danh sách các trường cần tìm kiếm
     * @param options Tùy chọn bổ sung
     * @returns Prisma where condition object
     */
    static buildSearch(
        keyword?: string,
        fields: SearchField[] = [],
        options: {
            mode?: Prisma.QueryMode;
            useAnd?: boolean;
            searchStrategy?: 'exact' | 'fuzzy' | 'hybrid';
        } = { mode: 'insensitive', useAnd: true, searchStrategy: 'exact' },
    ): any {
        if (!keyword?.trim()) {
            return {};
        }

        keyword = keyword.trim();

        // Chiến lược tìm kiếm:
        // - exact: tìm chính xác từng từ (tách theo khoảng trắng)
        // - fuzzy: tìm ký tự tách rời
        // - hybrid: kết hợp cả hai (mặc định)

        if (options.searchStrategy === 'exact') {
            return this.buildExactSearch(keyword, fields, options);
        } else if (options.searchStrategy === 'fuzzy') {
            return this.buildFuzzySearch(keyword, fields, options);
        } else {
            // Kết hợp cả hai chiến lược (hybrid)
            return {
                OR: [this.buildExactSearch(keyword, fields, options), this.buildFuzzySearch(keyword, fields, options)],
            };
        }
    }

    /**
     * Tìm kiếm chính xác các từ khóa (tách theo khoảng trắng)
     */
    static buildExactSearch(
        keyword: string,
        fields: SearchField[] = [],
        options: {
            mode?: Prisma.QueryMode;
            useAnd?: boolean;
        } = { mode: 'insensitive', useAnd: true },
    ): any {
        // Tách từ khóa theo khoảng trắng
        const words = keyword.split(/\s+/).filter((word) => word.length > 0);

        if (words.length === 0) {
            return {};
        }

        const logicalOperator = options.useAnd ? 'AND' : 'OR';

        // Tìm kiếm mỗi từ độc lập
        return {
            [logicalOperator]: words.map((word) => ({
                OR: fields.map((field) => {
                    if (field.isArray) {
                        return this.buildArrayFieldCondition(field, word, options.mode);
                    } else {
                        return this.buildObjectFieldCondition(field, word, options.mode);
                    }
                }),
            })),
        };
    }

    /**
     * Tìm kiếm mờ, hỗ trợ tìm kiếm các ký tự riêng lẻ và lặp lại
     */
    static buildFuzzySearch(
        keyword: string,
        fields: SearchField[] = [],
        options: {
            mode?: Prisma.QueryMode;
            useAnd?: boolean;
        } = { mode: 'insensitive', useAnd: true },
    ): any {
        // Xử lý ký tự lặp lại: chuyển "aaa" thành "a"
        const uniqueChars = Array.from(new Set(keyword.replace(/\s+/g, '').split('')));

        if (uniqueChars.length === 0) {
            return {};
        }

        const logicalOperator = options.useAnd ? 'AND' : 'OR';

        // Tạo điều kiện tìm kiếm cho mỗi ký tự duy nhất
        return {
            [logicalOperator]: uniqueChars.map((char) => ({
                OR: fields.map((field) => {
                    if (field.isArray) {
                        return this.buildArrayFieldCondition(field, char, options.mode);
                    } else {
                        return this.buildObjectFieldCondition(field, char, options.mode);
                    }
                }),
            })),
        };
    }

    /**
     * Hàm cũ để tương thích ngược, sử dụng phương pháp tách ký tự
     * @deprecated Sử dụng buildSearch thay thế
     */
    static buildCharacterSearch(
        keyword?: string,
        fields: SearchField[] = [],
        options: {
            mode?: Prisma.QueryMode;
            useAnd?: boolean;
        } = { mode: 'insensitive', useAnd: true },
    ): any {
        return this.buildFuzzySearch(keyword || '', fields, options);
    }

    /**
     * Xây dựng điều kiện tìm kiếm cho trường thông thường (không phải mảng)
     * @param field Thông tin trường tìm kiếm
     * @param searchValue Giá trị tìm kiếm
     * @param mode Chế độ tìm kiếm
     * @returns Prisma where condition cho trường thông thường
     */
    private static buildObjectFieldCondition(field: SearchField, searchValue: string, mode?: Prisma.QueryMode): any {
        const condition: any = {};
        let current = condition;

        // Xử lý các path lồng nhau
        for (let i = 0; i < field.path.length - 1; i++) {
            current[field.path[i]] = {};
            current = current[field.path[i]];
        }

        // Thiết lập điều kiện so sánh cho field cuối cùng
        const lastField = field.path[field.path.length - 1];
        current[lastField] = field.exactMatch ? searchValue : { contains: searchValue, mode };

        return condition;
    }

    /**
     * Xây dựng điều kiện tìm kiếm cho trường kiểu mảng
     * @param field Thông tin trường tìm kiếm
     * @param searchValue Giá trị tìm kiếm
     * @param mode Chế độ tìm kiếm
     * @returns Prisma where condition cho trường kiểu mảng
     */
    private static buildArrayFieldCondition(field: SearchField, searchValue: string, mode?: Prisma.QueryMode): any {
        const condition: any = {};
        let current = condition;

        // Xử lý các path lồng nhau cho đến phần tử cuối cùng trước mảng
        const arrayFieldIndex = field.path.findIndex((segment, index) => {
            return index < field.path.length - 1 && field.isArray;
        });

        // Nếu không tìm thấy trường mảng, sử dụng cách xử lý thông thường
        if (arrayFieldIndex === -1) {
            return this.buildObjectFieldCondition(field, searchValue, mode);
        }

        // Xây dựng path đến trường mảng
        for (let i = 0; i < arrayFieldIndex; i++) {
            current[field.path[i]] = {};
            current = current[field.path[i]];
        }

        // Tên của trường mảng
        const arrayField = field.path[arrayFieldIndex];

        // Xây dựng điều kiện "some" cho mảng
        current[arrayField] = {
            some: {},
        };

        let arrayCondition = current[arrayField].some;

        // Xây dựng điều kiện cho các trường trong mảng
        for (let i = arrayFieldIndex + 1; i < field.path.length - 1; i++) {
            arrayCondition[field.path[i]] = {};
            arrayCondition = arrayCondition[field.path[i]];
        }

        // Thiết lập điều kiện so sánh cho field cuối cùng trong mảng
        const lastField = field.path[field.path.length - 1];
        arrayCondition[lastField] = field.exactMatch ? searchValue : { contains: searchValue, mode };

        return condition;
    }

    /**
     * Kết hợp nhiều điều kiện tìm kiếm
     * @param conditions Mảng các điều kiện tìm kiếm
     * @param operator Toán tử logic (AND/OR)
     * @returns Prisma where condition object
     */
    static combineConditions(conditions: any[], operator: 'AND' | 'OR' = 'AND'): any {
        const validConditions = conditions.filter((c) => c && Object.keys(c).length > 0);

        if (validConditions.length === 0) {
            return {};
        }

        if (validConditions.length === 1) {
            return validConditions[0];
        }

        return {
            [operator]: validConditions,
        };
    }
}

export default PrismaSearchBuilder;
