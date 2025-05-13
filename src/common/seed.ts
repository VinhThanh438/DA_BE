import { PrsOrganizationType, PrismaClient, PrsInventoryType, PrsTransactionWarehouseType } from '@prisma/client';
import { ADMIN_MAIL, ADMIN_PASSWORD, ADMIN_USER_NAME } from './environment';

const prisma = new PrismaClient();

async function main() {
    // 1. Seed employee (leader and additional employee for relationships)
    const admin = await prisma.users.create({
        data: {
            username: ADMIN_USER_NAME,
            email: ADMIN_MAIL,
            password: ADMIN_PASSWORD,
        },
    });
    const leader = await prisma.employees.create({
        data: {
            name: ADMIN_USER_NAME,
            email: ADMIN_MAIL,
            code: 'EMP001',
            gender: 'male',
            age: 35,
            phone: '0123456789',
            base_salary: 50000000,
            date_of_birth: new Date('1988-01-01'),
            organization_id: null, // Will be set later
            job_position_id: null, // Will be set later
        },
    });

    const employee = await prisma.employees.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            code: 'EMP002',
            gender: 'male',
            age: 28,
            phone: '0987654321',
            base_salary: 30000000,
            date_of_birth: new Date('1995-03-15'),
            organization_id: null, // Will be set later
            job_position_id: null, // Will be set later
        },
    });

    // 2. Seed partner (for BankAccounts and Inventories relationships)
    const partner = await prisma.partners.create({
        data: {
            name: 'Steel Supplier Co.',
            code: 'PART001',
            type: 'supplier',
            phone: '0123456789',
            email: 'supplier@example.com',
            tax: '123456789',
            organization_id: null, // Will be set later
        },
    });

    // 3. Seed organization
    const organization = await prisma.organizations.create({
        data: {
            name: 'CÔNG TY CỔ PHẦN THÉP ĐÔNG ANH',
            responsibility: 'Chịu trách nhiệm toàn bộ hệ thống',
            files: JSON.stringify([
                {
                    name: 'giay-phep-kinh-doanh.pdf',
                    path: 'https://example.com/uploads/giay-phep-kinh-doanh.pdf',
                },
            ]),
            establishment: '2015-08-20',
            type: PrsOrganizationType.headquarter,
            parent_id: null,
            leader_id: leader.id,
        },
    });

    // Update employees and partner with organization_id
    await prisma.employees.update({
        where: { id: leader.id },
        data: { organization_id: organization.id },
    });

    await prisma.employees.update({
        where: { id: employee.id },
        data: { organization_id: organization.id },
    });

    await prisma.partners.update({
        where: { id: partner.id },
        data: { organization_id: organization.id },
    });

    // 4. Seed product (for CommonDetails and InventoryDetails relationships)
    const product = await prisma.products.create({
        data: {
            name: 'Steel Plate',
            code: 'PROD001',
            vat: 10,
            packing_standard: '100kg/bundle',
            note: 'High-quality steel plate',
        },
    });

    // 5. Seed order (for CommonDetails and Inventories relationships)
    const order = await prisma.orders.create({
        data: {
            code: 'ORD001',
            type: 'purchase',
            address: '123 Industrial Zone, Dong Anh, Hanoi',
            phone: '0123456789',
            note: 'Purchase order for steel plates',
            time_at: new Date(),
            employee_id: employee.id,
            partner_id: partner.id,
            organization_id: organization.id,
        },
    });

    // 6. Seed BankAccounts
    const bankAccount1 = await prisma.banks.create({
        data: {
            employee_id: leader.id,
            bank: 'Vietcombank',
            responsibility: 'Main corporate account',
            account_number: '1234567890',
            name: 'CÔNG TY CỔ PHẦN THÉP ĐÔNG ANH',
            branch: 'Hanoi Branch',
        },
    });

    const bankAccount2 = await prisma.banks.create({
        data: {
            employee_id: null,
            bank: 'Techcombank',
            responsibility: 'Supplier payment account',
            account_number: '0987654321',
            name: 'Steel Supplier Co.',
            branch: 'Hanoi Branch',
        },
    });

    // 7. Seed CommonDetails
    const commonDetail1 = await prisma.commonDetails.create({
        data: {
            quantity: 100,
            price: 500000,
            discount: 5,
            vat: 10,
            note: 'Steel plate for order ORD001',
            product_id: product.id,
            order_id: order.id,
            quotation_id: null,
            contract_id: null,
            invoice_id: null,
        },
    });

    const commonDetail2 = await prisma.commonDetails.create({
        data: {
            quantity: 50,
            price: 600000,
            discount: 3,
            vat: 10,
            note: 'Additional steel plate batch',
            product_id: product.id,
            order_id: order.id,
            quotation_id: null,
            contract_id: null,
            invoice_id: null,
        },
    });

    // 8. Seed Warehouses
    const warehouse1 = await prisma.warehouses.create({
        data: {
            code: 'WH001',
            name: 'Main Warehouse',
            phone: '0123456789',
            address: '123 Industrial Zone, Dong Anh, Hanoi',
            note: 'Primary storage for steel products',
        },
    });

    const warehouse2 = await prisma.warehouses.create({
        data: {
            code: 'WH002',
            name: 'Secondary Warehouse',
            phone: '0987654321',
            address: '456 Industrial Zone, Dong Anh, Hanoi',
            note: 'Backup storage for raw materials',
        },
    });

    // 9. Seed Inventories
    const inventory1 = await prisma.inventories.create({
        data: {
            time_at: new Date(),
            code: 'INV001',
            type: PrsInventoryType.normal_in,
            note: 'Received steel plates from supplier',
            files: JSON.stringify([
                { name: 'delivery-note.pdf', path: 'https://example.com/uploads/delivery-note.pdf' },
            ]),
            license_plate: '29H-12345',
            employee_id: employee.id,
            supplier_id: partner.id,
            customer_id: null,
            delivery_id: null,
            organization_id: organization.id,
            order_id: order.id,
        },
    });

    const inventory2 = await prisma.inventories.create({
        data: {
            time_at: new Date(),
            code: 'INV002',
            type: PrsInventoryType.material_in,
            note: 'Raw material intake for production',
            files: JSON.stringify([
                { name: 'material-receipt.pdf', path: 'https://example.com/uploads/material-receipt.pdf' },
            ]),
            license_plate: '29H-67890',
            employee_id: employee.id,
            supplier_id: partner.id,
            customer_id: null,
            delivery_id: null,
            organization_id: organization.id,
            order_id: null,
        },
    });

    // 10. Seed InventoryDetails
    const inventoryDetail1 = await prisma.commonDetails.create({
        data: {
            quantity: 100,
            price: 500000,
            discount: 5,
            note: 'Steel plates for INV001',
            product_id: product.id,
            inventory_id: inventory1.id,
            warehouse_id: warehouse1.id,
        },
    });

    const inventoryDetail2 = await prisma.commonDetails.create({
        data: {
            quantity: 50,
            price: 600000,
            discount: 3,
            note: 'Raw materials for INV002',
            product_id: product.id,
            inventory_id: inventory2.id,
            warehouse_id: warehouse2.id,
        },
    });

    // 11. Seed TransactionWarehouses
    const transactionWarehouse1 = await prisma.transactionWarehouses.create({
        data: {
            time_at: new Date(),
            quantity: 100,
            type: PrsTransactionWarehouseType.in,
            note: 'Stocked steel plates in main warehouse',
            organization_id: organization.id,
            warehouse_id: warehouse1.id,
            product_id: product.id,
            order_id: order.id,
            inventory_id: inventory1.id,
        },
    });

    const transactionWarehouse2 = await prisma.transactionWarehouses.create({
        data: {
            time_at: new Date(),
            quantity: 50,
            type: PrsTransactionWarehouseType.in,
            note: 'Stocked raw materials in secondary warehouse',
            organization_id: organization.id,
            warehouse_id: warehouse2.id,
            product_id: product.id,
            order_id: null,
            inventory_id: inventory2.id,
        },
    });

    console.log('✅ Seeded data:', {
        leader,
        employee,
        partner,
        organization,
        product,
        order,
        bankAccount1,
        bankAccount2,
        commonDetail1,
        commonDetail2,
        warehouse1,
        warehouse2,
        inventory1,
        inventory2,
        inventoryDetail1,
        inventoryDetail2,
        transactionWarehouse1,
        transactionWarehouse2,
    });
}

main()
    .then(() => {
        console.log('✅ Seed completed');
        return prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seed error', e);
        await prisma.$disconnect();
        process.exit(1);
    });
