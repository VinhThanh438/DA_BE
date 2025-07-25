"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const environment_1 = require("./environment");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Seed employee (leader and additional employee for relationships)
        const admin = yield prisma.users.create({
            data: {
                username: environment_1.ADMIN_USER_NAME,
                email: environment_1.ADMIN_MAIL,
                password: environment_1.ADMIN_PASSWORD,
            },
        });
        const leader = yield prisma.employees.create({
            data: {
                name: environment_1.ADMIN_USER_NAME,
                email: environment_1.ADMIN_MAIL,
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
        const organization = yield prisma.organizations.create({
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
                type: client_1.PrsOrganizationType.headquarter,
                parent_id: null,
                leader_id: leader.id,
            },
        });
        const employee = yield prisma.employees.createMany({
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
        yield prisma.employees.update({
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
    });
}
main()
    .then(() => {
    console.log('✅ Seed completed');
    return prisma.$disconnect();
})
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error('❌ Seed error', e);
    yield prisma.$disconnect();
    process.exit(1);
}));
