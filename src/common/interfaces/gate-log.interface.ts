export interface IGateLog {
    id?: number;
    time_at?: Date;
    status?: string;
    note?: string;

    entry_time?: Date;
    entry_plate_image?: string;
    entry_container_image?: string;

    exit_time?: Date;
    exit_plate_image?: string;
    exit_container_image?: string;

    employee_id?: number;
    inventory_id?: number;
    organization_id?: number;
    entry_note?: string;
    exit_note?: string;
    files?: string[];
    rejected_reason?: string;

    children_id?: number;
    parent_id?: number;
    idx?: number;
}
