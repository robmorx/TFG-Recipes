import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('AiService')
      .useValue({
        generate: jest.fn().mockResolvedValue({
          name: 'E2E Test Recipe',
          ingredients: ['ingredient1', 'ingredient2'],
          steps: [
            { instruction: 'Step 1', timerMinutes: 10 },
            { instruction: 'Step 2', timerMinutes: 0 },
          ],
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('POST /auth/login - should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong' })
        .expect(401);
    });

    it('POST /auth/login - should return 200 with valid credentials', async () => {
      // Note: You need to have a test user in the database
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      authToken = response.body.access_token;
    });
  });

  describe('Recipes (Protected)', () => {
    it('GET /recipes - should return 401 without token', () => {
      return request(app.getHttpServer()).get('/api/recipes').expect(401);
    });

    it('GET /recipes - should return recipes with valid token', async () => {
      if (!authToken) {
        console.warn('No auth token available, skipping test');
        return;
      }

      return request(app.getHttpServer())
        .get('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('POST /recipes/add - should create recipe with valid token', async () => {
      if (!authToken) {
        console.warn('No auth token available, skipping test');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/recipes/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Generate a test recipe',
          type: 'DINNER',
          user_uuid: 'test-user-uuid',
          servings: 4,
          dietaryPreferences: ['vegetarian'],
          selectedIngredients: ['2 cups flour'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBeDefined();
          expect(res.body.recipe_uuid).toBeDefined();
        });
    });
  });

  describe('Users (Protected)', () => {
    it('GET /users - should return 401 without token', () => {
      return request(app.getHttpServer()).get('/api/users').expect(401);
    });

    it('POST /users/add - should register user without token (public)', () => {
      return request(app.getHttpServer())
        .post('/api/users/add')
        .send({
          name: 'E2E Test User',
          email: `test${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201);
    });
  });

  describe('Items (Protected)', () => {
    it('POST /items/add - should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/items/add')
        .send({
          name: 'Test Item',
          quantity: 5,
          quantityUnit: 'UNITS',
          inventoryId: 'test-inventory-uuid',
        })
        .expect(401);
    });
  });

  describe('Inventory (Protected)', () => {
    it('GET /inventory/:user_uuid - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/inventory/test-uuid')
        .expect(401);
    });
  });
});
