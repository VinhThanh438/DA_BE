export const parseArrayQuery = (query: any): (number | string)[] => {
    try {
        if (!query) return [];
        if (Array.isArray(query)) return query.map((item) => (isNaN(Number(item)) ? item : Number(item)));
        return JSON.parse(query.toString()).map((item: any) => (isNaN(Number(item)) ? item : Number(item)));
    } catch {
        return [];
    }
};
