const request = require('supertest');
const User = require('../../models/User');
const app = require('../../server');

describe('Auth Routes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if credentials are not provided', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should return 401 if user is not found', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue(null)
      });
      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password123' });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 200 and a token for valid credentials', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: 'mockedId',
          name: 'Test User',
          email: 'test@test.com',
          role: 'associate',
          matchPassword: vi.fn().mockResolvedValue(true)
        })
      });

      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password123' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@test.com');
    });
  });
});
