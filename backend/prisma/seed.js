import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@zikabet.com' },
        update: {},
        create: {
            name: 'Admin Zikabet',
            email: 'admin@zikabet.com',
            cpf: '00000000000',
            password: adminPassword,
            role: 'ADMIN',
            balance: 0,
        },
    });
    console.log('✅ Admin user created:', admin.email);
    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@test.com' },
        update: {},
        create: {
            name: 'Usuário Teste',
            email: 'user@test.com',
            cpf: '11111111111',
            password: userPassword,
            role: 'USER',
            balance: 100,
        },
    });
    console.log('✅ Test user created:', user.email);
    // Create teams
    const teams = [
        { name: 'Team Liquid', logo: null },
        { name: 'OG', logo: null },
        { name: 'PSG.LGD', logo: null },
        { name: 'Evil Geniuses', logo: null },
        { name: 'Team Secret', logo: null },
    ];
    const createdTeams = [];
    for (const team of teams) {
        const created = await prisma.team.upsert({
            where: { name: team.name },
            update: {},
            create: team,
        });
        createdTeams.push(created);
    }
    console.log(`✅ Created ${createdTeams.length} teams`);
    // Create a sample game
    if (createdTeams.length >= 2) {
        const game = await prisma.game.create({
            data: {
                teamAId: createdTeams[0].id,
                teamBId: createdTeams[1].id,
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                status: 'SCHEDULED',
                odds: {
                    create: {
                        teamAOdds: 1.8,
                        teamBOdds: 2.0,
                        durationOdds: JSON.stringify({
                            '0-30': 2.5,
                            '30-45': 1.8,
                            '45-60': 1.5,
                            '60+': 1.2,
                        }),
                        topKillerOdds: 2.2,
                    },
                },
            },
        });
        console.log('✅ Sample game created:', game.id);
    }
    console.log('🎉 Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map