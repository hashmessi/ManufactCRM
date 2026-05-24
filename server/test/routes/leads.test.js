const request = require('supertest');
const jwt = require('jsonwebtoken');
const Lead = require('../../models/Lead');
const User = require('../../models/User');
const app = require('../../server');

const generateTestToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Leads Routes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/leads', () => {
    it('should query leads with role-scoped filter for an associate', async () => {
      // Create token for an associate
      const token = generateTestToken({ id: 'assoc1' });
      
      // Spy on User.findById used in verifyToken middleware
      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: 'assoc1', role: 'associate', name: 'Test Assoc' })
      });

      // Spy on Lead.find used in the controller
      const mockPopulate = vi.fn().mockReturnThis();
      const mockSort = vi.fn().mockReturnThis();
      const mockLean = vi.fn().mockResolvedValue([{ companyName: 'Test Co' }]);
      vi.spyOn(Lead, 'find').mockImplementation(() => ({
        populate: mockPopulate,
        sort: mockSort,
        lean: mockLean
      }));

      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      // verify it used assignedTo scope filter
      expect(Lead.find).toHaveBeenCalledWith(expect.objectContaining({ assignedTo: 'assoc1' }));
    });
  });

  describe('POST /api/leads', () => {
    it('should return 400 if required fields are missing', async () => {
      const token = generateTestToken({ id: 'assoc1' });
      
      vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: 'assoc1', role: 'associate' })
      });

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // missing companyName etc.
        
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });
  });
});
