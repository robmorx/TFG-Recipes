import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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

  async onModuleInit() {
    await this._prisma.$connect();
  }
}