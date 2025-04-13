import { PartnerType } from "@config/app.constant";

export interface ICreateAndUpdatePartner {
    code?: string;
    name: string;
    phone?: string | null;
    address?: string | null;
    note?: string | null;
    tax?: string | null;

    type: PartnerType;

    sale_staff_id?: number | null;
    partner_group_id?: number | null;
    emergency_contact_id?: number | null;

    payment_term?: string | null;
    max_dept_amount?: number | null;
    max_dept_day?: number | null;
}
