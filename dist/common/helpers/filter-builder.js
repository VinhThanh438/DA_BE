"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterBuilder = void 0;
class FilterBuilder {
    static buildWhere(args, config) {
        const where = {};
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
                    }
                    else {
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
    static buildSelect(args, config, defaultSelect) {
        const select = Object.assign({}, defaultSelect);
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
exports.FilterBuilder = FilterBuilder;
