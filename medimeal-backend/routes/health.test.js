const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const healthRoutes = require('./health');

const app = express();
app.use(express.json());
app.use('/api/health', healthRoutes);

describe('Health Routes', () => {
  let mongoServer;
  let user;
  let token;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test user
    user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TestPass123'
    });
    await user.save();

    // Generate token
    token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await HealthRecord.deleteMany({});
  });

  describe('POST /api/health/records', () => {
    test('should create blood pressure record', async () => {
      const recordData = {
        type: 'blood-pressure',
        values: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        notes: 'Morning reading'
      };

      const response = await request(app)
        .post('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('blood-pressure');
      expect(response.body.data.values.systolic).toBe(120);
      expect(response.body.data.values.diastolic).toBe(80);
      expect(response.body.data.notes).toBe('Morning reading');
    });

    test('should create blood sugar record', async () => {
      const recordData = {
        type: 'blood-sugar',
        values: { value: 95 },
        unit: 'mg/dL'
      };

      const response = await request(app)
        .post('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('blood-sugar');
      expect(response.body.data.values.value).toBe(95);
    });

    test('should reject invalid blood pressure values', async () => {
      const recordData = {
        type: 'blood-pressure',
        values: { systolic: 'invalid' },
        unit: 'mmHg'
      };

      const response = await request(app)
        .post('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Blood pressure requires systolic and diastolic values');
    });

    test('should reject missing diastolic for blood pressure', async () => {
      const recordData = {
        type: 'blood-pressure',
        values: { systolic: 120 },
        unit: 'mmHg'
      };

      const response = await request(app)
        .post('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid single value', async () => {
      const recordData = {
        type: 'weight',
        values: {},
        unit: 'kg'
      };

      const response = await request(app)
        .post('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Single value required for this type');
    });

    test('should reject invalid type', async () => {
      const recordData = {
        type: 'invalid-type',
        values: { value: 70 },
        unit: 'kg'
      };

      const response = await request(app)
        .post('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject invalid unit', async () => {
      const recordData = {
        type: 'weight',
        values: { value: 70 },
        unit: 'invalid-unit'
      };

      const response = await request(app)
        .post('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const recordData = {
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      };

      await request(app)
        .post('/api/health/records')
        .send(recordData)
        .expect(401);
    });
  });

  describe('GET /api/health/records', () => {
    beforeEach(async () => {
      // Create test data
      const records = [
        {
          userId: user._id,
          type: 'blood-pressure',
          values: { systolic: 120, diastolic: 80 },
          unit: 'mmHg',
          recordedAt: new Date('2024-01-15T10:00:00Z')
        },
        {
          userId: user._id,
          type: 'blood-sugar',
          values: { value: 95 },
          unit: 'mg/dL',
          recordedAt: new Date('2024-01-14T10:00:00Z')
        },
        {
          userId: user._id,
          type: 'weight',
          values: { value: 70 },
          unit: 'kg',
          recordedAt: new Date('2024-01-13T10:00:00Z')
        }
      ];

      await HealthRecord.insertMany(records);
    });

    test('should get all health records', async () => {
      const response = await request(app)
        .get('/api/health/records')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.records).toHaveLength(3);
      expect(response.body.data.pagination.totalRecords).toBe(3);
    });

    test('should filter records by type', async () => {
      const response = await request(app)
        .get('/api/health/records?type=blood-pressure')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.records).toHaveLength(1);
      expect(response.body.data.records[0].type).toBe('blood-pressure');
    });

    test('should filter records by date range', async () => {
      const response = await request(app)
        .get('/api/health/records?startDate=2024-01-14T00:00:00Z&endDate=2024-01-15T23:59:59Z')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.records).toHaveLength(2);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/health/records?limit=2&page=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.records).toHaveLength(2);
      expect(response.body.data.pagination.current).toBe(1);
      expect(response.body.data.pagination.total).toBe(2);
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/health/records')
        .expect(401);
    });
  });

  describe('GET /api/health/vitals/latest', () => {
    beforeEach(async () => {
      // Create test vitals data
      const vitals = [
        {
          userId: user._id,
          type: 'blood-pressure',
          values: { systolic: 120, diastolic: 80 },
          unit: 'mmHg',
          recordedAt: new Date('2024-01-15T10:00:00Z')
        },
        {
          userId: user._id,
          type: 'blood-sugar',
          values: { value: 95 },
          unit: 'mg/dL',
          recordedAt: new Date('2024-01-15T09:00:00Z')
        },
        {
          userId: user._id,
          type: 'weight',
          values: { value: 68.5 },
          unit: 'kg',
          recordedAt: new Date('2024-01-15T08:00:00Z')
        },
        {
          userId: user._id,
          type: 'heart-rate',
          values: { value: 72 },
          unit: 'bpm',
          recordedAt: new Date('2024-01-15T07:00:00Z')
        }
      ];

      await HealthRecord.insertMany(vitals);
    });

    test('should get latest vitals', async () => {
      const response = await request(app)
        .get('/api/health/vitals/latest')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const vitals = response.body.data;
      expect(vitals.bloodPressure).toBeDefined();
      expect(vitals.bloodPressure.values.systolic).toBe(120);
      expect(vitals.bloodPressure.status).toBe('normal');
      expect(vitals.bloodPressure.target).toBe('< 130/85');

      expect(vitals.bloodSugar).toBeDefined();
      expect(vitals.bloodSugar.values.value).toBe(95);

      expect(vitals.weight).toBeDefined();
      expect(vitals.weight.values.value).toBe(68.5);

      expect(vitals.heartRate).toBeDefined();
      expect(vitals.heartRate.values.value).toBe(72);
    });

    test('should handle missing vitals', async () => {
      await HealthRecord.deleteMany({});

      const response = await request(app)
        .get('/api/health/vitals/latest')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const vitals = response.body.data;
      expect(vitals.bloodPressure).toBeNull();
      expect(vitals.bloodSugar).toBeNull();
      expect(vitals.weight).toBeNull();
      expect(vitals.heartRate).toBeNull();
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/health/vitals/latest')
        .expect(401);
    });
  });

  describe('PUT /api/health/records/:id', () => {
    let recordId;

    beforeEach(async () => {
      const record = new HealthRecord({
        userId: user._id,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg',
        notes: 'Original note'
      });

      const saved = await record.save();
      recordId = saved._id.toString();
    });

    test('should update health record', async () => {
      const updateData = {
        values: { value: 68.5 },
        notes: 'Updated note'
      };

      const response = await request(app)
        .put(`/api/health/records/${recordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.values.value).toBe(68.5);
      expect(response.body.data.notes).toBe('Updated note');
    });

    test('should not allow updating other users records', async () => {
      // Create another user's record
      const otherUserId = new mongoose.Types.ObjectId();
      const otherRecord = new HealthRecord({
        userId: otherUserId,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });
      const savedOther = await otherRecord.save();

      const response = await request(app)
        .put(`/api/health/records/${savedOther._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ values: { value: 75 } })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Health record not found');
    });

    test('should reject invalid record ID', async () => {
      await request(app)
        .put('/api/health/records/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ values: { value: 75 } })
        .expect(400);
    });

    test('should require authentication', async () => {
      await request(app)
        .put(`/api/health/records/${recordId}`)
        .send({ values: { value: 75 } })
        .expect(401);
    });
  });

  describe('DELETE /api/health/records/:id', () => {
    let recordId;

    beforeEach(async () => {
      const record = new HealthRecord({
        userId: user._id,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });

      const saved = await record.save();
      recordId = saved._id.toString();
    });

    test('should delete health record', async () => {
      const response = await request(app)
        .delete(`/api/health/records/${recordId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Health record deleted successfully');

      // Verify record is deleted
      const deletedRecord = await HealthRecord.findById(recordId);
      expect(deletedRecord).toBeNull();
    });

    test('should not allow deleting other users records', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const otherRecord = new HealthRecord({
        userId: otherUserId,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });
      const savedOther = await otherRecord.save();

      const response = await request(app)
        .delete(`/api/health/records/${savedOther._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      await request(app)
        .delete(`/api/health/records/${recordId}`)
        .expect(401);
    });
  });

  describe('GET /api/health/dashboard', () => {
    beforeEach(async () => {
      // Create comprehensive test data for dashboard
      const records = [
        // Recent vitals
        {
          userId: user._id,
          type: 'blood-pressure',
          values: { systolic: 120, diastolic: 80 },
          unit: 'mmHg',
          recordedAt: new Date()
        },
        {
          userId: user._id,
          type: 'blood-sugar',
          values: { value: 95 },
          unit: 'mg/dL',
          recordedAt: new Date()
        }
      ];

      await HealthRecord.insertMany(records);
    });

    test('should get dashboard data', async () => {
      const response = await request(app)
        .get('/api/health/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const data = response.body.data;
      expect(data.vitals).toBeDefined();
      expect(data.trends).toBeDefined();
      expect(data.activeSymptoms).toBeDefined();
      expect(data.activeGoals).toBeDefined();
      expect(data.upcomingAppointments).toBeDefined();
      expect(data.summary).toBeDefined();

      expect(data.summary.totalRecords).toBe(2);
      expect(data.summary.daysTracked).toBe(7);
    });

    test('should support different time periods', async () => {
      const response = await request(app)
        .get('/api/health/dashboard?days=30')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.daysTracked).toBe(30);
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/health/dashboard')
        .expect(401);
    });
  });
});