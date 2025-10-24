const express = require('express');
const { auth } = require('../middleware/auth');
const Meal = require('../models/Meal');

const router = express.Router();

// Helper to get YYYY-MM-DD from Date
const toDateKey = (d = new Date()) => d.toISOString().slice(0,10);

// GET /api/meals/today - list today's meals for current user
router.get('/today', auth, async (req, res) => {
  try {
    const dateKey = toDateKey();
    const meals = await Meal.find({ userId: req.user._id, date: dateKey }).sort({ time: 1, createdAt: 1 });
    res.json({ success: true, data: meals });
  } catch (error) {
    console.error('List today meals error:', error);
    res.status(500).json({ success: false, message: 'Failed to load meals' });
  }
});

// GET /api/meals - list meals with optional date or range
// Query:
//   - date=YYYY-MM-DD (exact)
//   - from=YYYY-MM-DD&to=YYYY-MM-DD (inclusive range)
router.get('/', auth, async (req, res) => {
  try {
    const { date, from, to } = req.query;
    const q = { userId: req.user._id };
    if (date) {
      q.date = date;
    } else if (from || to) {
      q.date = {};
      if (from) q.date.$gte = from;
      if (to) q.date.$lte = to;
    }
    const meals = await Meal.find(q).sort({ date: 1, time: 1 });
    res.json({ success: true, data: meals });
  } catch (error) {
    console.error('List meals error:', error);
    res.status(500).json({ success: false, message: 'Failed to load meals' });
  }
});

// POST /api/meals - create meal
router.post('/', auth, async (req, res) => {
  try {
    const { type, name, time, calories = 0, notes = '', date } = req.body;
    if (!type || !name || !time) {
      return res.status(400).json({ success: false, message: 'type, name and time are required' });
    }
    const doc = await Meal.create({
      userId: req.user._id,
      date: date || toDateKey(),
      type,
      name: String(name).trim(),
      time,
      calories: Number(calories) || 0,
      notes
    });
    res.status(201).json({ success: true, message: 'Meal added', data: doc });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ success: false, message: 'Failed to add meal' });
  }
});

// PUT /api/meals/:id - update meal
router.put('/:id', auth, async (req, res) => {
  try {
    const allowed = ['type', 'name', 'time', 'calories', 'notes', 'date'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const doc = await Meal.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, update, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Meal not found' });
    res.json({ success: true, message: 'Meal updated', data: doc });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({ success: false, message: 'Failed to update meal' });
  }
});

// DELETE /api/meals/:id - delete meal
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) return res.status(404).json({ success: false, message: 'Meal not found' });
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete meal' });
  }
});

module.exports = router;