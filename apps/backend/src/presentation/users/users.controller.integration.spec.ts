const request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserUseCase } from '../../domain/user/usecases/user.usecases';

// ── Mock data ────────────────────────────────────────────────────────────────
const mockUser = {
  user_uuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Juan García',
  email: 'juan@example.com',
  atcreated: new Date('2024-01-01'),
};

// ── Mock de UserUseCase ───────────────────────────────────────────────────────
const mockUserUseCase = {
  getList: jest.fn().mockResolvedValue([mockUser]),
  getByUUID: jest.fn().mockResolvedValue(mockUser),
  add: jest.fn().mockResolvedValue(mockUser.user_uuid),
  delete: jest.fn().mockResolvedValue(1),
  update: jest.fn().mockResolvedValue(1),
};

// ── Setup ─────────────────────────────────────────────────────────────────────
describe('UsersController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UserUseCase, useValue: mockUserUseCase },
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

  // ── GET /api/users ──────────────────────────────────────────────────────────
  describe('GET /api/users', () => {
    it('devuelve 200 y lista de usuarios', async () => {
      mockUserUseCase.getList.mockResolvedValue([mockUser]);

      const res = await request(app.getHttpServer()).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].user_uuid).toBe(mockUser.user_uuid);
      expect(res.body[0].email).toBe(mockUser.email);
    });

    it('devuelve 200 y lista vacía si no hay usuarios', async () => {
      mockUserUseCase.getList.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ── GET /api/users/:user_uuid ───────────────────────────────────────────────
  describe('GET /api/users/:user_uuid', () => {
    it('devuelve 200 y el usuario encontrado', async () => {
      mockUserUseCase.getByUUID.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .get(`/api/users/${mockUser.user_uuid}`);

      expect(res.status).toBe(200);
      expect(res.body.user_uuid).toBe(mockUser.user_uuid);
      expect(mockUserUseCase.getByUUID).toHaveBeenCalledWith(mockUser.user_uuid);
    });

    it('devuelve 200 y body vacío si el usuario no existe', async () => {
      mockUserUseCase.getByUUID.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/api/users/uuid-inexistente');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });
  });

  // ── POST /api/users/add ─────────────────────────────────────────────────────
  describe('POST /api/users/add', () => {
    const validBody = {
      name: 'Juan García',
      email: 'juan@example.com',
      password: 'secret123',
    };

    it('devuelve 201 y el uuid del usuario creado', async () => {
      mockUserUseCase.add.mockResolvedValue(mockUser.user_uuid);

      const res = await request(app.getHttpServer())
        .post('/api/users/add')
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toBe(mockUser.user_uuid);
      expect(mockUserUseCase.add).toHaveBeenCalledWith(validBody);
    });

    it('devuelve 400 si falta el email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/add')
        .send({ name: 'Juan', password: 'secret123' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si el email no es válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/add')
        .send({ name: 'Juan', email: 'no-es-email', password: 'secret123' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta el password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/add')
        .send({ name: 'Juan', email: 'juan@example.com' });

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/users/delete ────────────────────────────────────────────────
  describe('DELETE /api/users/delete', () => {
    it('devuelve 200 y affected: 1 si el usuario fue eliminado', async () => {
      mockUserUseCase.delete.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .delete('/api/users/delete')
        .send({ user_uuid: mockUser.user_uuid });

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(1);
      expect(mockUserUseCase.delete).toHaveBeenCalledWith(mockUser.user_uuid);
    });

    it('devuelve 200 y affected: 0 si el usuario no existe', async () => {
      mockUserUseCase.delete.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .delete('/api/users/delete')
        .send({ user_uuid: mockUser.user_uuid });

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(0);
    });

    it('devuelve 400 si el uuid no es válido', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/users/delete')
        .send({ user_uuid: 'no-es-uuid' });

      expect(res.status).toBe(400);
    });
  });

  // ── PUT /api/users/update ───────────────────────────────────────────────────
  describe('PUT /api/users/update', () => {
    const validBody = {
      user_uuid: mockUser.user_uuid,
      name: 'Juan Actualizado',
      email: 'juan.nuevo@example.com',
    };

    it('devuelve 200 y affected: 1 si el usuario fue actualizado', async () => {
      mockUserUseCase.update.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .put('/api/users/update')
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(1);
      expect(mockUserUseCase.update).toHaveBeenCalledWith(validBody);
    });

    it('devuelve 200 y affected: 0 si el usuario no existe', async () => {
      mockUserUseCase.update.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .put('/api/users/update')
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.affected).toBe(0);
    });

    it('devuelve 400 si el uuid no es válido', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/users/update')
        .send({ ...validBody, user_uuid: 'no-es-uuid' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si el email no es válido', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/users/update')
        .send({ ...validBody, email: 'no-es-email' });

      expect(res.status).toBe(400);
    });
  });
});