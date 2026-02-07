import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    accelerateUrl: "postgresql://c7855a5d5783c9487b7410a02847bfbb49af1c83bacd4dcf9a1cba8e5f7ba082:sk_lBtWtytB-esCpAoiWB0kx@db.prisma.io:5432/postgres?sslmode=require"
});

async function main() {
    console.log('Seeding started... 🌱');

    // 1. Departments Data (image_cc0212.png ke according)
    const depts = [
        { id: 'dept_01', code: 'GAT', name: 'General Administration' },
        { id: 'dept_02', code: 'REV', name: 'Revenue' },
        { id: 'dept_03', code: 'HLT', name: 'Health' },
        { id: 'dept_04', code: 'EDU', name: 'Education' },
        { id: 'dept_05', code: 'PW', name: 'Public Works' },
    ];

    for (const d of depts) {
        await prisma.department.upsert({
            where: { code: d.code },
            update: {},
            create: d,
        });
    }
    console.log('Departments added! ✅');

    // 2. Users Data (image_cc01d3.png ke according)
    const users = [
        { id: 'user_01', name: 'System Admin', email: 'admin@tapaal.local', role: 'ADMIN', deptId: 'dept_01' },
        { id: 'user_02', name: 'Tejaswini Patil', email: 'tejaswini123@gmail.com', role: 'OFFICER', deptId: 'dept_03' },
        { id: 'user_03', name: 'Revenue HOD', email: 'revenuehod@tapaal.in', role: 'HOD', deptId: 'dept_02' },
        { id: 'user_04', name: 'Ed Dept Clerk', email: 'edclerk@tapaal.local', role: 'CLERK', deptId: 'dept_04' },
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
    }
    console.log('Users added! ✅');

    // 3. Inward Mails Data (image_cc0296.png ke according)
    // Note: 'IMPORTANT' priority ko humne alag se highlight kiya hai
    const mails = [
        {
            id: 'mail_01',
            subject: 'Tender Notice: Road Construction',
            senderName: 'SDR Construction',
            priority: 'IMPORTANT',
            status: 'PENDING',
            deptId: 'dept_02',
            isAnomaly: false,
        },
        {
            id: 'mail_02',
            subject: 'Water Leakage Complaint',
            senderName: 'Residents of Nagpur',
            priority: 'HIGH',
            status: 'ASSIGNED',
            deptId: 'dept_01',
            isAnomaly: false,
        },
        {
            id: 'mail_03',
            subject: 'Leave Application: Yogesh Narendra',
            senderName: 'Yogesh Narendra',
            priority: 'NORMAL',
            status: 'REGISTERED',
            deptId: 'dept_04',
            isAnomaly: false,
        },
    ];

    for (const m of mails) {
        await prisma.inwardMail.upsert({
            where: { id: m.id },
            update: {},
            create: m,
        });
    }
    console.log('Inward Mails added! ✅');

    // 4. Tracking Events (image_cbff0e.png ke according)
    const trackingEvents = [
        { mailId: 'mail_01', status: 'REGISTERED', remarks: 'Inward registered in system', updatedBy: 'System Admin' },
        { mailId: 'mail_01', status: 'ASSIGNED', remarks: 'Sent to Revenue Dept Head', updatedBy: 'System Admin' },
        { mailId: 'mail_02', status: 'REGISTERED', remarks: 'Complaint received', updatedBy: 'System Admin' },
    ];

    for (const t of trackingEvents) {
        await prisma.trackingEvent.create({
            data: t,
        });
    }

    console.log('Seeding finished successfully! 🚀');
    console.log('📊 Check Prisma Studio at http://localhost:5555 to see your data!');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });