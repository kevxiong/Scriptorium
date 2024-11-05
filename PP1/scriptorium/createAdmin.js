import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ADMIN_EMAIL = "ADMIN";
const ADMIN_PASSWORD = "ADMIN";
const ADMIN_FIRST_NAME = "ADMIN";
const ADMIN_LAST_NAME = "ADMIN";

async function createAdminUser() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        isAdmin: true,
      },
    });

    console.log('Admin user created', "ADMIN");
  } catch (error) {
    console.error('Error creating admin', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
