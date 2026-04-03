import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './presentation/users/users.module';
import { AiModule } from './ai/ai.module';
import { RecipeModule } from './presentation/recipe/recipe.module';
import { ItemModule } from './presentation/item/item.module';
import { InventoryModule } from './presentation/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    RecipeModule,
    ItemModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
