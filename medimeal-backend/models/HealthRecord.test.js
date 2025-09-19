const mongoose = require('mongoose');
const HealthRecord = require('./HealthRecord');

// Mock MongoDB in-memory setup for testing
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('HealthRecord Model', () => {
  let mongoServer;
  let userId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    userId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await HealthRecord.deleteMany({});
  });

  describe('Model Validation', () => {
    test('should create a valid blood pressure record', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'blood-pressure',
        values: { systolic: 120, diastolic: 80 },
        unit: 'mmHg'
      });

      const savedRecord = await healthRecord.save();
      
      expect(savedRecord.userId).toEqual(userId);
      expect(savedRecord.type).toBe('blood-pressure');
      expect(savedRecord.values.systolic).toBe(120);
      expect(savedRecord.values.diastolic).toBe(80);
      expect(savedRecord.unit).toBe('mmHg');
    });

    test('should create a valid blood sugar record', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'blood-sugar',
        values: { value: 95 },
        unit: 'mg/dL'
      });

      const savedRecord = await healthRecord.save();
      
      expect(savedRecord.type).toBe('blood-sugar');
      expect(savedRecord.values.value).toBe(95);
      expect(savedRecord.unit).toBe('mg/dL');
    });

    test('should require userId', async () => {
      const healthRecord = new HealthRecord({
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });

      await expect(healthRecord.save()).rejects.toThrow('User ID is required');
    });

    test('should require type', async () => {
      const healthRecord = new HealthRecord({
        userId,
        values: { value: 70 },
        unit: 'kg'
      });

      await expect(healthRecord.save()).rejects.toThrow('Health record type is required');
    });

    test('should validate blood pressure values', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'blood-pressure',
        values: { systolic: 80, diastolic: 120 }, // Invalid: diastolic > systolic
        unit: 'mmHg'
      });

      await expect(healthRecord.save()).rejects.toThrow();
    });

    test('should validate single value records', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'weight',
        values: { value: -5 }, // Invalid: negative value
        unit: 'kg'
      });

      await expect(healthRecord.save()).rejects.toThrow();
    });

    test('should reject invalid type', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'invalid-type',
        values: { value: 70 },
        unit: 'kg'
      });

      await expect(healthRecord.save()).rejects.toThrow();
    });

    test('should reject invalid unit', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'weight',
        values: { value: 70 },
        unit: 'invalid-unit'
      });

      await expect(healthRecord.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    test('should check if blood pressure is within normal range', async () => {
      const normalBP = new HealthRecord({
        userId,
        type: 'blood-pressure',
        values: { systolic: 120, diastolic: 80 },
        unit: 'mmHg'
      });

      const highBP = new HealthRecord({
        userId,
        type: 'blood-pressure',
        values: { systolic: 150, diastolic: 95 },
        unit: 'mmHg'
      });

      expect(normalBP.isWithinNormalRange()).toBe(true);
      expect(highBP.isWithinNormalRange()).toBe(false);
    });

    test('should check if blood sugar is within normal range', async () => {
      const normalBS = new HealthRecord({
        userId,
        type: 'blood-sugar',
        values: { value: 95 },
        unit: 'mg/dL'
      });

      const highBS = new HealthRecord({
        userId,
        type: 'blood-sugar',
        values: { value: 150 },
        unit: 'mg/dL'
      });

      expect(normalBS.isWithinNormalRange()).toBe(true);
      expect(highBS.isWithinNormalRange()).toBe(false);
    });

    test('should return correct status', async () => {
      const normalRecord = new HealthRecord({
        userId,
        type: 'heart-rate',
        values: { value: 70 },
        unit: 'bpm'
      });

      const abnormalRecord = new HealthRecord({
        userId,
        type: 'heart-rate',
        values: { value: 120 },
        unit: 'bpm'
      });

      expect(normalRecord.getStatus()).toBe('normal');
      expect(abnormalRecord.getStatus()).toBe('abnormal');
    });

    test('should return target range', async () => {
      const bpRecord = new HealthRecord({
        userId,
        type: 'blood-pressure',
        values: { systolic: 120, diastolic: 80 },
        unit: 'mmHg'
      });

      expect(bpRecord.getTargetRange()).toBe('< 130/85');
    });
  });

  describe('Virtual Properties', () => {
    test('should format blood pressure value', async () => {
      const bpRecord = new HealthRecord({
        userId,
        type: 'blood-pressure',
        values: { systolic: 120, diastolic: 80 },
        unit: 'mmHg'
      });

      expect(bpRecord.formattedValue).toBe('120/80');
    });

    test('should return single value for non-BP records', async () => {
      const weightRecord = new HealthRecord({
        userId,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });

      expect(weightRecord.formattedValue).toBe(70);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test data
      const records = [
        {
          userId,
          type: 'blood-pressure',
          values: { systolic: 120, diastolic: 80 },
          unit: 'mmHg',
          recordedAt: new Date('2024-01-15')
        },
        {
          userId,
          type: 'blood-pressure',
          values: { systolic: 125, diastolic: 82 },
          unit: 'mmHg',
          recordedAt: new Date('2024-01-14')
        },
        {
          userId,
          type: 'weight',
          values: { value: 70 },
          unit: 'kg',
          recordedAt: new Date('2024-01-15')
        }
      ];

      await HealthRecord.insertMany(records);
    });

    test('should get latest records by type', async () => {
      const latestBP = await HealthRecord.getLatestByType(userId, 'blood-pressure', 1);
      
      expect(latestBP).toHaveLength(1);
      expect(latestBP[0].values.systolic).toBe(120);
      expect(latestBP[0].recordedAt).toEqual(new Date('2024-01-15'));
    });

    test('should get multiple latest records by type', async () => {
      const latestBP = await HealthRecord.getLatestByType(userId, 'blood-pressure', 2);
      
      expect(latestBP).toHaveLength(2);
      expect(latestBP[0].values.systolic).toBe(120); // Most recent
      expect(latestBP[1].values.systolic).toBe(125); // Second most recent
    });

    test('should get records in date range', async () => {
      const startDate = new Date('2024-01-14');
      const endDate = new Date('2024-01-15');
      
      const records = await HealthRecord.getRecordsInRange(userId, startDate, endDate);
      
      expect(records).toHaveLength(3);
    });

    test('should get records in date range by type', async () => {
      const startDate = new Date('2024-01-14');
      const endDate = new Date('2024-01-15');
      
      const bpRecords = await HealthRecord.getRecordsInRange(userId, startDate, endDate, 'blood-pressure');
      
      expect(bpRecords).toHaveLength(2);
      expect(bpRecords.every(record => record.type === 'blood-pressure')).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    test('should set default recordedAt to current time', async () => {
      const beforeSave = new Date();
      
      const healthRecord = new HealthRecord({
        userId,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });

      const savedRecord = await healthRecord.save();
      const afterSave = new Date();

      expect(savedRecord.recordedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedRecord.recordedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    test('should default source to manual', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });

      const savedRecord = await healthRecord.save();
      expect(savedRecord.source).toBe('manual');
    });

    test('should default isVerified to true', async () => {
      const healthRecord = new HealthRecord({
        userId,
        type: 'weight',
        values: { value: 70 },
        unit: 'kg'
      });

      const savedRecord = await healthRecord.save();
      expect(savedRecord.isVerified).toBe(true);
    });
  });
});