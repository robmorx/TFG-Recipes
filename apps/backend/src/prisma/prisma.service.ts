import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService implements OnModuleInit {
  private _prisma: PrismaClient;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    this._prisma = new PrismaClient({ adapter }) as any;
  }

  get user() {
    return this._prisma.user;
  }

  get recipe() {
    return this._prisma.recipe;
  }

  get inventory() {
    return this._prisma.inventory;
  }

  get item() {
    return this._prisma.item;
  }

  get refreshToken() {
    return this._prisma.refreshToken;
  }

  async onModuleInit() {
    await this._prisma.$connect();

    const adminEmail = 'admin@admin.com';
    const existingAdmin = await this._prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await this._prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'SUPERUSER',
          isVerified: true
        }
      });
      console.log('Admin user seeded successfully');
    }
  }
}
