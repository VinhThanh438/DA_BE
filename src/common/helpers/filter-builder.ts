export interface FilterConfig<T = any> {
    arrayFilters?: {
        [key: string]: {
            field: string;
            relation?: string;
            operator?: 'in' | 'notIn';
        }
    };
    relationFilters?: {
        [key: string]: {
            relation: string;
            field: string;
            operator?: 'some' | 'every' | 'none';
        }
    };
    selectFilters?: {
        [key: string]: {
            relation: string;
            field: string;
            selection: any;
        }
    };
}

export class FilterBuilder<T = any> {
    static buildWhere<T>(args: any, config: FilterConfig<T>): any {
        const where: any = {};

        // Handle array filters (e.g., employeeIds -> employee_id: { in: [...] })
        if (config.arrayFilters) {
            Object.entries(config.arrayFilters).forEach(([argKey, filterConfig]) => {
                const values = args[argKey];
                if (values && Array.isArray(values) && values.length > 0) {
                    if (filterConfig.relation) {
                        where[filterConfig.relation] = {
                            [filterConfig.operator || 'some']: {
                                [filterConfig.field]: { in: values }
                            }
                        };
                    } else {
                        where[filterConfig.field] = {
                            [filterConfig.operator || 'in']: values
                        };
                    }
                }
            });
        }

        // Handle relation filters
        if (config.relationFilters) {
            Object.entries(config.relationFilters).forEach(([argKey, filterConfig]) => {
                const values = args[argKey];
                if (values && Array.isArray(values) && values.length > 0) {
                    where[filterConfig.relation] = {
                        [filterConfig.operator || 'some']: {
                            [filterConfig.field]: { in: values }
                        }
                    };
                }
            });
        }

        return where;
    }

    static buildSelect<T>(args: any, config: FilterConfig<T>, defaultSelect: any): any {
        const select: any = { ...defaultSelect };

        if (config.selectFilters) {
            Object.entries(config.selectFilters).forEach(([argKey, filterConfig]) => {
                const values = args[argKey];
                if (values && Array.isArray(values) && values.length > 0) {
                    select[filterConfig.relation] = {
                        where: {
                            [filterConfig.field]: { in: values }
                        },
                        select: filterConfig.selection,
                    };
                }
            });
        }

        return select;
    }
}