/**
 * Dev seed: one user per role + a few equipment items. Run: npm run seed
 * All seeded accounts use the password "Password123" (test data only).
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { Role } from './common/enums/role.enum';
import { Equipment } from './equipment/schemas/equipment.schema';
import { UsersService } from './users/users.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const users = app.get(UsersService);
  const equipment = app.get(getModelToken(Equipment.name));
  const passwordHash = await bcrypt.hash('Password123', 10);

  const seedUsers: [string, string, Role, boolean][] = [
    ['student', 'Sara Student', Role.STUDENT, false],
    ['certified', 'Cem Certified', Role.STUDENT, true],
    ['staff', 'Stefan Staff', Role.STAFF, false],
    ['lecturer', 'Lea Hoffmann', Role.LECTURER, true],
    ['desk', 'Dana Desk', Role.DESK_ASSISTANT, true],
    ['manager', 'Jonas Richter', Role.MANAGER, true],
    ['safety', 'Grace Okafor', Role.SAFETY_OFFICER, true],
  ];
  for (const [i, [k, fullName, role, safetyCertified]] of seedUsers.entries()) {
    const email = `${k}@giu-uni.de`;
    if (!(await users.findByEmailWithSecrets(email))) {
      await users.create({ universityId: `U${1000 + i}`, fullName, email, passwordHash, role, safetyCertified });
    }
  }
  if ((await equipment.countDocuments()) === 0) {
    await equipment.insertMany([
      { name: 'Arduino Starter Kit', category: 'Electronics kit', canLeaveMakerspace: true, requiresSafetyBriefing: false },
      { name: 'Canon EOS Camera', category: 'Camera', canLeaveMakerspace: true, requiresSafetyBriefing: false },
      { name: 'Oscilloscope', category: 'Measuring instrument', canLeaveMakerspace: false, requiresSafetyBriefing: false },
      { name: 'Meta Quest VR Headset', category: 'VR headset', canLeaveMakerspace: true, requiresSafetyBriefing: false },
      { name: 'Cordless Drill', category: 'Power tool', canLeaveMakerspace: true, requiresSafetyBriefing: true },
      { name: 'Jigsaw', category: 'Power tool', canLeaveMakerspace: false, requiresSafetyBriefing: true },
      { name: 'Loaner Laptop', category: 'Laptop', canLeaveMakerspace: true, requiresSafetyBriefing: false },
    ]);
  }
  console.log('Seed complete.');
  await app.close();
}
run();
