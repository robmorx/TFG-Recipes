import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../node_modules/.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

@Injectable()
export class PrismaService implements OnModuleInit {
  private _prisma = new PrismaClient({ adapter } as any) as any;
  
  get user() {
    return this._prisma.user;
  }

  get recipe() {
    return this._prisma.recipe;
  }

  get item() {
    return this._prisma.item;
  }

  async onModuleInit() {
    await this._prisma.$connect();
  }
}
