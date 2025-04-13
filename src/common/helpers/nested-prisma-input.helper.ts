export function mapNestedInput<T extends object>(data?: T): { create: T } | undefined {
    return data ? { create: data } : undefined;
}
