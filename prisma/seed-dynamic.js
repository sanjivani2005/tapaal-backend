import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // 1. Clear existing data
        await prisma.timelineEvent.deleteMany();
        await prisma.trackingEvent.deleteMany();
        await prisma.outwardMail.deleteMany();
        await prisma.inwardMail.deleteMany();
        await prisma.user.deleteMany();
        await prisma.department.deleteMany();
        console.log('🧹 Cleared existing data');

        // 2. Create Departments
        const departments = await Promise.all([
            prisma.department.create({
                data: {
                    name: 'General Administration',
                    code: 'GAT',
                    head: 'System Admin',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Revenue',
                    code: 'REV',
                    head: 'Revenue HOD',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Health',
                    code: 'HLT',
                    head: 'Health HOD',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Education',
                    code: 'EDU',
                    head: 'Education HOD',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Public Works',
                    code: 'PW',
                    head: 'PW HOD',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Finance',
                    code: 'FIN',
                    head: 'Jane Smith',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Human Resources',
                    code: 'HR',
                    head: 'James Taylor',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Information Technology',
                    code: 'IT',
                    head: 'Sarah Williams',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Operations',
                    code: 'OPS',
                    head: 'Robert Brown',
                    status: 'Active'
                }
            }),
            prisma.department.create({
                data: {
                    name: 'Legal',
                    code: 'LEG',
                    head: 'David Wilson',
                    status: 'Active'
                }
            })
        ]);

        console.log(`📁 Created ${departments.length} departments`);

        // 3. Create Users
        const users = await Promise.all([
            prisma.user.create({
                data: {
                    name: 'System Admin',
                    email: 'admin@tapaal.local',
                    role: 'ADMIN',
                    status: 'Active',
                    deptId: departments[0].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Tejaswini Patil',
                    email: 'tejaswini123@gmail.com',
                    role: 'OFFICER',
                    status: 'Active',
                    deptId: departments[2].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Revenue HOD',
                    email: 'revenuehod@tapaal.in',
                    role: 'HOD',
                    status: 'Active',
                    deptId: departments[1].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Ed Dept Clerk',
                    email: 'edclerk@tapaal.local',
                    role: 'CLERK',
                    status: 'Active',
                    deptId: departments[3].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'John Doe',
                    email: 'john.doe@gov.in',
                    role: 'Admin',
                    status: 'Active',
                    deptId: departments[0].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Jane Smith',
                    email: 'jane.smith@gov.in',
                    role: 'HOD',
                    status: 'Active',
                    deptId: departments[5].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Mike Johnson',
                    email: 'mike.j@gov.in',
                    role: 'Clerk',
                    status: 'Active',
                    deptId: departments[6].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Sarah Williams',
                    email: 'sarah.w@gov.in',
                    role: 'Officer',
                    status: 'Active',
                    deptId: departments[7].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Robert Brown',
                    email: 'robert.b@gov.in',
                    role: 'HOD',
                    status: 'Active',
                    deptId: departments[8].id
                }
            }),
            prisma.user.create({
                data: {
                    name: 'Emily Davis',
                    email: 'emily.d@gov.in',
                    role: 'Clerk',
                    status: 'Inactive',
                    deptId: departments[5].id
                }
            })
        ]);

        console.log(`👥 Created ${users.length} users`);

        // 4. Create Inward Mails
        const inwardMails = await Promise.all([
            prisma.inwardMail.create({
                data: {
                    mailId: 'INW-2024-001',
                    trackingId: 'TRK-1234',
                    subject: 'Tax details for Q4 2023',
                    description: 'Tax details for Q4 2023',
                    details: 'Tax details for Q4 2023',
                    sender: 'BigEye Global Solutions - BGS',
                    senderName: 'BigEye Global Solutions - BGS',
                    priority: 'High',
                    status: 'PENDING',
                    receivedBy: 'Kumar M',
                    handoverTo: 'Thuzharajan M',
                    deliveryMode: 'Courier',
                    referenceDetails: 'TAX-Q4-2023-045',
                    type: 'Inward',
                    date: new Date('2024-01-15T10:30:00'),
                    deptId: departments[5].id
                }
            }),
            prisma.inwardMail.create({
                data: {
                    mailId: 'INW-2024-002',
                    trackingId: 'TRK-1235',
                    subject: 'Tender documents for road construction',
                    description: 'Tender documents for road construction',
                    details: 'Tender documents for road construction',
                    sender: 'SDR Construction',
                    senderName: 'SDR Construction',
                    priority: 'Important',
                    status: 'ASSIGNED',
                    receivedBy: 'Rajesh K',
                    handoverTo: 'Priya S',
                    deliveryMode: 'Hand',
                    referenceDetails: 'TENDER-ROAD-2024-001',
                    type: 'Inward',
                    date: new Date('2024-01-16T11:15:00'),
                    deptId: departments[1].id
                }
            }),
            prisma.inwardMail.create({
                data: {
                    mailId: 'INW-2024-003',
                    trackingId: 'TRK-1236',
                    subject: 'Student scholarship applications',
                    description: 'Student scholarship applications',
                    details: 'Student scholarship applications',
                    sender: 'Education Department',
                    senderName: 'Education Department',
                    priority: 'Normal',
                    status: 'COMPLETED',
                    receivedBy: 'Anand P',
                    handoverTo: 'Meera R',
                    deliveryMode: 'Post',
                    referenceDetails: 'EDU-SCHOLAR-2024-012',
                    type: 'Inward',
                    date: new Date('2024-01-17T09:45:00'),
                    deptId: departments[3].id
                }
            })
        ]);

        console.log(`📥 Created ${inwardMails.length} inward mails`);

        // 5. Create Outward Mails
        const outwardMails = await Promise.all([
            prisma.outwardMail.create({
                data: {
                    mailId: 'OUT-2024-001',
                    trackingId: 'TRK-1245',
                    subject: 'Tender Notice Publication',
                    description: 'Tender Notice Publication',
                    receiver: 'All Vendors',
                    priority: 'Important',
                    status: 'DELIVERED',
                    deliveryMode: 'Courier',
                    dueDate: new Date('2024-01-20'),
                    attachments: 3,
                    sentBy: 'John Doe',
                    type: 'Outward',
                    date: new Date('2024-01-15T14:30:00'),
                    deptId: departments[0].id
                }
            }),
            prisma.outwardMail.create({
                data: {
                    mailId: 'OUT-2024-002',
                    trackingId: 'TRK-1246',
                    subject: 'Monthly Financial Report',
                    description: 'Monthly Financial Report',
                    receiver: 'Finance Ministry',
                    priority: 'High',
                    status: 'IN_TRANSIT',
                    deliveryMode: 'Email',
                    dueDate: new Date('2024-01-18'),
                    attachments: 5,
                    sentBy: 'Jane Smith',
                    type: 'Outward',
                    date: new Date('2024-01-16T16:00:00'),
                    deptId: departments[5].id
                }
            }),
            prisma.outwardMail.create({
                data: {
                    mailId: 'OUT-2024-003',
                    trackingId: 'TRK-1247',
                    subject: 'Employee Circular',
                    description: 'Employee Circular',
                    receiver: 'All Departments',
                    priority: 'Normal',
                    status: 'DELIVERED',
                    deliveryMode: 'Internal',
                    dueDate: new Date('2024-01-17'),
                    attachments: 1,
                    sentBy: 'James Taylor',
                    type: 'Outward',
                    date: new Date('2024-01-17T10:00:00'),
                    deptId: departments[6].id
                }
            })
        ]);

        console.log(`📤 Created ${outwardMails.length} outward mails`);

        // 6. Create Tracking Events
        const trackingEvents = await Promise.all([
            prisma.trackingEvent.create({
                data: {
                    eventId: 'TRK-2401',
                    inwardMailId: inwardMails[0].id,
                    mailType: 'Inward',
                    status: 'Registered',
                    remarks: 'New inward mail registered',
                    updatedBy: 'Clerk',
                    assignedTo: 'John Doe',
                    currentStatus: 'Pending',
                    subject: 'Tax details for Q4 2023',
                    sender: 'BigEye Global Solutions',
                    priority: 'High',
                    department: 'Finance',
                    lastUpdated: new Date('2024-01-15T14:30:00')
                }
            }),
            prisma.trackingEvent.create({
                data: {
                    eventId: 'TRK-2402',
                    outwardMailId: outwardMails[0].id,
                    mailType: 'Outward',
                    status: 'Created',
                    remarks: 'Tender notice created',
                    updatedBy: 'John Doe',
                    assignedTo: 'John Doe',
                    currentStatus: 'Delivered',
                    subject: 'Tender Notice Publication',
                    receiver: 'All Vendors',
                    priority: 'Important',
                    department: 'General Administration',
                    lastUpdated: new Date('2024-01-16T09:00:00')
                }
            })
        ]);

        console.log(`🔍 Created ${trackingEvents.length} tracking events`);

        // 7. Create Timeline Events
        await Promise.all([
            prisma.timelineEvent.create({
                data: {
                    trackingId: trackingEvents[0].id,
                    event: 'Registered',
                    remarks: 'New inward mail registered',
                    timestamp: new Date('2024-01-15T09:00:00')
                }
            }),
            prisma.timelineEvent.create({
                data: {
                    trackingId: trackingEvents[0].id,
                    event: 'Assigned',
                    remarks: 'Mail assigned to Finance department',
                    timestamp: new Date('2024-01-15T10:30:00')
                }
            }),
            prisma.timelineEvent.create({
                data: {
                    trackingId: trackingEvents[0].id,
                    event: 'In Progress',
                    remarks: 'Processing tax documents',
                    timestamp: new Date('2024-01-15T14:30:00')
                }
            }),
            prisma.timelineEvent.create({
                data: {
                    trackingId: trackingEvents[1].id,
                    event: 'Created',
                    remarks: 'Tender notice created',
                    timestamp: new Date('2024-01-15T11:00:00')
                }
            }),
            prisma.timelineEvent.create({
                data: {
                    trackingId: trackingEvents[1].id,
                    event: 'Approved',
                    remarks: 'Approved by department head',
                    timestamp: new Date('2024-01-15T14:00:00')
                }
            }),
            prisma.timelineEvent.create({
                data: {
                    trackingId: trackingEvents[1].id,
                    event: 'Dispatched',
                    remarks: 'Sent via courier service',
                    timestamp: new Date('2024-01-15T16:00:00')
                }
            }),
            prisma.timelineEvent.create({
                data: {
                    trackingId: trackingEvents[1].id,
                    event: 'Delivered',
                    remarks: 'Successfully delivered to all vendors',
                    timestamp: new Date('2024-01-16T09:00:00')
                }
            })
        ]);

        console.log('📅 Created timeline events');

        // 8. Update tracking events with proper relationships
        await Promise.all([
            prisma.trackingEvent.update({
                where: { id: trackingEvents[0].id },
                data: {
                    inwardMailId: inwardMails[0].id
                }
            }),
            prisma.trackingEvent.update({
                where: { id: trackingEvents[1].id },
                data: {
                    outwardMailId: outwardMails[0].id
                }
            })
        ]);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Departments: ${departments.length}`);
        console.log(`   Users: ${users.length}`);
        console.log(`   Inward Mails: ${inwardMails.length}`);
        console.log(`   Outward Mails: ${outwardMails.length}`);
        console.log(`   Tracking Events: ${trackingEvents.length}`);
        console.log(`   Timeline Events: 7`);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
