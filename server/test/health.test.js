const request = require('supertest');
const mongoose = require('mongoose');
// Import the Express app (ensure server.js exports the app)
const app = require('../server');

describe('Health Endpoint', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  // Since importing server.js triggers mongoose.connect, we disconnect after tests to avoid open handles
  afterAll(async () => {
    await mongoose.disconnect();
  });
});
