import { OrganizationType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 2. Seed employee (leader)
    const leader = await prisma.employees.create({
        data: {
            name: 'admin',
            email: 'admin@example.com',
        },
    });

    await prisma.organizations.create({
        data: {
            name: 'CÔNG TY CỔ PHẦN THÉP ĐÔNG ANH',
            responsibility: 'Chịu trách nhiệm toàn bộ hệ thống',
            files: [
                {
                    name: 'giay-phep-kinh-doanh.pdf',
                    url: 'https://example.com/uploads/giay-phep-kinh-doanh.pdf',
                },
            ],
            establishment: '2015-08-20',
            type: OrganizationType.headquarter,
            parent_id: null,
            leader_id: leader.id,
        },
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
