const request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemUseCase } from '../../domain/item/usecases/item.usecases';

// ── Mock data ────────────────────────────────────────────────────────────────
const mockItem = {
  item_uuid: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  name: 'Tomate',
};

// ── Mock de ItemUseCase ───────────────────────────────────────────────────────
const mockItemUseCase = {
  getList: jest.fn().mockResolvedValue([mockItem]),
  getByUUID: jest.fn().mockResolvedValue(mockItem),
  add: jest.fn().mockResolvedValue(mockItem.item_uuid),
  delete: jest.fn().mockResolvedValue(1),
  update: jest.fn().mockResolvedValue(1),
};

// ── Setup ─────────────────────────────────────────────────────────────────────
describe('ItemController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        { provide: ItemUseCase, useValue: mockItemUseCase },
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

  // ── GET /api/items ──────────────────────────────────────────────────────────
  describe('GET /api/items', () => {
    it('devuelve 200 y lista de items', async () => {
      mockItemUseCase.getList.mockResolvedValue([mockItem]);

      const res = await request(app.getHttpServer()).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].item_uuid).toBe(mockItem.item_uuid);
      expect(res.body[0].name).toBe(mockItem.name);
    });

    it('devuelve 200 y lista vacía si no hay items', async () => {
      mockItemUseCase.getList.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ── POST /api/items/add ─────────────────────────────────────────────────────
  describe('POST /api/items/add', () => {
    it('devuelve 201 y el uuid del item creado', async () => {
      mockItemUseCase.add.mockResolvedValue(mockItem.item_uuid);

      const res = await request(app.getHttpServer())
        .post('/api/items/add')
        .send({ name: 'Tomate' });

      expect(res.status).toBe(201);
      expect(res.body).toBe(mockItem.item_uuid);
      expect(mockItemUseCase.add).toHaveBeenCalledWith({ name: 'Tomate' });
    });

    it('devuelve 400 si el nombre está vacío', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/items/add')
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta el campo name', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/items/add')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/items/delete ────────────────────────────────────────────────
  describe('DELETE /api/items/delete', () => {
    it('devuelve 200 y affected: 1 si el item fue eliminado', async () => {
      mockItemUseCase.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .delete('/api/items/delete')
        .send({ item_uuid: mockItem.item_uuid });

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(1);
      expect(mockItemUseCase.delete).toHaveBeenCalledWith(mockItem.item_uuid);
    });

    it('devuelve 200 y affected: 0 si el item no existe', async () => {
      mockItemUseCase.delete.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .delete('/api/items/delete')
        .send({ item_uuid: mockItem.item_uuid });

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(0);
    });

    it('devuelve 400 si el uuid no es válido', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/items/delete')
        .send({ item_uuid: 'no-es-uuid' });

      expect(res.status).toBe(400);
    });
  });

  // ── PUT /api/items/update ───────────────────────────────────────────────────
  describe('PUT /api/items/update', () => {
    const validBody = {
      item_uuid: mockItem.item_uuid,
      name: 'Tomate Cherry',
    };

    it('devuelve 200 y affected: 1 si el item fue actualizado', async () => {
      mockItemUseCase.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/items/update')
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(1);
      expect(mockItemUseCase.update).toHaveBeenCalledWith(validBody);
    });

    it('devuelve 200 y affected: 0 si el item no existe', async () => {
      mockItemUseCase.update.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .put('/api/items/update')
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(0);
    });

    it('devuelve 400 si el uuid no es válido', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/items/update')
        .send({ ...validBody, item_uuid: 'no-es-uuid' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta el nombre', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/items/update')
        .send({ item_uuid: mockItem.item_uuid });

      expect(res.status).toBe(400);
    });
  });
});