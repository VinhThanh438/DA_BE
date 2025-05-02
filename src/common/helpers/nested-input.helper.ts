export function mapNestedInput(input: any): any {
    if (!input) return undefined;
    if (Array.isArray(input)) {
        return { create: input.map((item) => ({ ...item })) };
    }
    return { create: { ...input } };
}

export function mapUpdateRelation<T>(data: T[] | undefined): any {
    if (!data) return undefined;
    if (data.length === 1) {
        return { create: data[0] };
    }
    return {
        create: data,
        updateMany: data.map((item) => ({
            where: { id: (item as any).id },
            data: { ...(item as any) },
        })),
    };
}

