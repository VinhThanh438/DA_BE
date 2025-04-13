// import { PrismaClient } from '@prisma/client';
// import logger from './logger';

// const prisma = new PrismaClient();

// async function main() {
//     logger.info('🌱 Seeding database...');

//     const education = await prisma.educations.create({
//         data: {
//             education_level: 'Bachelor',
//             training_level: 'University',
//             graduated_place: 'ABC University',
//             faculty: 'Computer Science',
//             major: 'Software Engineering',
//             graduation_year: 2018,
//         },
//     });

//     const finance = await prisma.finances.create({
//         data: {
//             name: 'Salary Bonus',
//             amount: 1000.5,
//             note: 'Performance Bonus',
//             status: 'Approved',
//             type: 'kt',
//         },
//     });

//     const identity = await prisma.identity.create({
//         data: {
//             code: 'ID123456789',
//             issued_place: 'Hanoi',
//             issued_date: new Date('2015-06-15'),
//             expired_date: new Date('2030-06-15'),
//             type: 'CCCD',
//         },
//     });

//     const address = await prisma.address.create({
//         data: {
//             country: 'Vietnam',
//             province: 'Hanoi',
//             district: 'Cau Giay',
//             ward: 'Dich Vong',
//             details: '123 Main Street',
//             type: 'tt',
//         },
//     });

//     const emergencyContact = await prisma.emergencyContact.create({
//         data: {
//             name: 'John Doe',
//             email: 'john.doe@example.com',
//             relationship: 'Brother',
//             address: '456 Secondary Street',
//             phone: '0987654321',
//         },
//     });

//     const contract = await prisma.contracts.create({
//         data: {
//             code: 'CT001',
//             type: 'Full-time',
//             start_date: new Date('2023-01-01'),
//             end_date: new Date('2025-01-01'),
//             status: 'Active',
//         },
//     });

//     const bankAccount = await prisma.bankAccount.create({
//         data: {
//             number: '1234567890',
//             name: 'John Doe',
//             branch: 'Techcombank Hanoi',
//         },
//     });

//     const socialInsurance = await prisma.socialInsurance.create({
//         data: {
//             is_participating: true,
//             percent: 10.5,
//             insurance_number: 'SI123456789',
//             insurance_salary: 1500.0,
//             start_date: new Date('2023-01-01'),
//         },
//     });

//     await prisma.employees.create({
//         data: {
//             code: 'EMP001',
//             email: 'employee@example.com',
//             fullname: 'Jane Doe',
//             age: 30,
//             phone_number: '0901234567',
//             description: 'Senior Developer',
//             avatar: 'https://example.com/avatar.jpg',
//             type: 'Permanent',
//             education_id: education.id,
//             finance_id: finance.id,
//             identity_id: identity.id,
//             address_id: address.id,
//             emergency_contact_id: emergencyContact.id,
//             contract_id: contract.id,
//             bank_account_id: bankAccount.id,
//             social_insurance_id: socialInsurance.id,
//             is_deleted: false,
//         },
//     });

//     logger.info('✅ Seeding completed!');
// }

// main()
//     .catch((e) => {
//         logger.error('❌ Error seeding database:', e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
