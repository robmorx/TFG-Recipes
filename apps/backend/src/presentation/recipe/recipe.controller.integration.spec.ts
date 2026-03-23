const request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeUseCase } from '../../domain/recipe/usecases/recipe.usecases';

// ── Mock data ────────────────────────────────────────────────────────────────
const mockRecipe = {
  recipe_uuid: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  name: 'Tortilla Española',
  ingredients: ['huevo', 'patata', 'cebolla', 'aceite', 'sal'],
  steps: ['Pelar y cortar patatas', 'Pochar con cebolla', 'Mezclar con huevo', 'Cuajar en sartén'],
  atcreated: new Date('2024-01-01'),
};

const mockUserUUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// ── Mock de RecipeUseCase (incluye mock implícito de AiService) ───────────────
// Al mockear el UseCase completo, el AiService nunca se llama.
// Esto permite probar los endpoints sin API key de Gemini.
const mockRecipeUseCase = {
  getList: jest.fn().mockResolvedValue([mockRecipe]),
  getByUserUUID: jest.fn().mockResolvedValue([mockRecipe]),
  add: jest.fn().mockResolvedValue(mockRecipe.recipe_uuid),
  delete: jest.fn().mockResolvedValue(1),
};

// ── Setup ─────────────────────────────────────────────────────────────────────
describe('RecipeController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        { provide: RecipeUseCase, useValue: mockRecipeUseCase },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /api/recipes ────────────────────────────────────────────────────────
  describe('GET /api/recipes', () => {
    it('devuelve 200 y lista de recetas', async () => {
      mockRecipeUseCase.getList.mockResolvedValue([mockRecipe]);

      const res = await request(app.getHttpServer()).get('/api/recipes');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].recipe_uuid).toBe(mockRecipe.recipe_uuid);
      expect(res.body[0].name).toBe(mockRecipe.name);
      expect(res.body[0].ingredients).toEqual(mockRecipe.ingredients);
    });

    it('devuelve 200 y lista vacía si no hay recetas', async () => {
      mockRecipeUseCase.getList.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/api/recipes');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ── GET /api/recipes/:user_uuid ─────────────────────────────────────────────
  describe('GET /api/recipes/:user_uuid', () => {
    it('devuelve 200 y las recetas del usuario', async () => {
      mockRecipeUseCase.getByUserUUID.mockResolvedValue([mockRecipe]);

      const res = await request(app.getHttpServer())
        .get(`/api/recipes/${mockUserUUID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(mockRecipeUseCase.getByUserUUID).toHaveBeenCalledWith(mockUserUUID);
    });

    it('devuelve 200 y lista vacía si el usuario no tiene recetas', async () => {
      mockRecipeUseCase.getByUserUUID.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get(`/api/recipes/${mockUserUUID}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ── POST /api/recipes/add ───────────────────────────────────────────────────
  describe('POST /api/recipes/add', () => {
    const validBody = {
      name: 'Tortilla Española',
      prompt: 'Hazme una receta de tortilla española para 4 personas',
      user_uuid: mockUserUUID,
    };

    it('devuelve 201 y el uuid de la receta generada por IA', async () => {
      mockRecipeUseCase.add.mockResolvedValue(mockRecipe.recipe_uuid);

      const res = await request(app.getHttpServer())
        .post('/api/recipes/add')
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toBe(mockRecipe.recipe_uuid);
      expect(mockRecipeUseCase.add).toHaveBeenCalledWith(validBody);
    });

    it('devuelve 400 si falta el nombre', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/recipes/add')
        .send({ prompt: 'un prompt', user_uuid: mockUserUUID });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si el user_uuid no es válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/recipes/add')
        .send({ ...validBody, user_uuid: 'no-es-uuid' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta el user_uuid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/recipes/add')
        .send({ name: 'Tortilla', prompt: 'un prompt' });

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/recipes/delete ──────────────────────────────────────────────
  describe('DELETE /api/recipes/delete', () => {
    it('devuelve 200 y affected: 1 si la receta fue eliminada', async () => {
      mockRecipeUseCase.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .delete('/api/recipes/delete')
        .send({ recipe_uuid: mockRecipe.recipe_uuid });

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(1);
      expect(mockRecipeUseCase.delete).toHaveBeenCalledWith(mockRecipe.recipe_uuid);
    });

    it('devuelve 200 y affected: 0 si la receta no existe', async () => {
      mockRecipeUseCase.delete.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .delete('/api/recipes/delete')
        .send({ recipe_uuid: mockRecipe.recipe_uuid });

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(0);
    });

    it('devuelve 400 si el uuid no es válido', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/recipes/delete')
        .send({ recipe_uuid: 'no-es-uuid' });

      expect(res.status).toBe(400);
    });
  });
});