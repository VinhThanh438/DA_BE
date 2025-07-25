import { PrsOrganizationType, PrismaClient } from '@prisma/client';
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

    const employee = await prisma.employees.createMany({
        data: [
            {
                name: 'Phạm Minh Hảo',
                email: 'hao.minh@thepdonganh.com',
                code: 'EMP002',
                gender: 'male',
                age: 28,
                phone: '0987654321',
                base_salary: 30000000,
                date_of_birth: new Date('1995-03-15'),
                organization_id: organization.id, // Will be set later
                job_position_id: null, // Will be set later
            },
            {
                name: 'Phùng Đức Minh',
                email: 'hao.minh@thepdonganh.com',
                code: 'EMP003',
                gender: 'male',
                age: 28,
                phone: '0987654321',
                base_salary: 30000000,
                date_of_birth: new Date('1995-03-15'),
                organization_id: organization.id, // Will be set later
                job_position_id: null, // Will be set later
            },
            {
                name: 'Phạm Văn Cương',
                email: 'cuong.pham@thepdonganh.com',
                code: 'EMP004',
                gender: 'male',
                age: 28,
                phone: '0987654777',
                base_salary: 30000000,
                date_of_birth: new Date('1995-03-15'),
                organization_id: organization.id, // Will be set later
                job_position_id: null, // Will be set later
            },
        ],
    });

    // Update employees and partner with organization_id
    await prisma.employees.update({
        where: { id: leader.id },
        data: { organization_id: organization.id },
    });

    // await prisma.employees.update({
    //     where: { id: employee.id },
    //     data: { organization_id: organization.id },
    // });

    console.log('✅ Seeded data:', {
        leader,
        employee,
        organization,
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
