const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/medications - list current user's medications
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('medications');
    res.json({ success: true, data: user.medications || [] });
  } catch (error) {
    console.error('List medications error:', error);
    res.status(500).json({ success: false, message: 'Failed to load medications' });
  }
});

// POST /api/medications - add a medication
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, frequency, times = [], startDate, endDate, timingMode = 'fixed', relativeMealType = 'breakfast', relativeWhen = 'after', offsetMinutes = 30 } = req.body;
    if (!name || !dosage || !frequency) {
      return res.status(400).json({ success: false, message: 'name, dosage and frequency are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const med = {
      name: String(name).trim(),
      dosage: String(dosage).trim(),
      frequency: String(frequency).trim(),
      times: Array.isArray(times) ? times : [],
      timingMode,
      relativeMealType,
      relativeWhen,
      offsetMinutes,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {})
    };

    user.medications.push(med);
    await user.save();

    const created = user.medications[user.medications.length - 1];
    res.status(201).json({ success: true, message: 'Medication added', data: created });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ success: false, message: 'Failed to add medication' });
  }
});

// PUT /api/medications/:medId - update a medication
router.put('/:medId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const med = user.medications.id(req.params.medId);
    if (!med) return res.status(404).json({ success: false, message: 'Medication not found' });

    const updatable = ['name', 'dosage', 'frequency', 'times', 'startDate', 'endDate', 'timingMode', 'relativeMealType', 'relativeWhen', 'offsetMinutes'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) med[k] = req.body[k];
    });

    await user.save();
    res.json({ success: true, message: 'Medication updated', data: med });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ success: false, message: 'Failed to update medication' });
  }
});

// DELETE /api/medications/:medId - remove a medication
router.delete('/:medId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const med = user.medications.id(req.params.medId);
    if (!med) return res.status(404).json({ success: false, message: 'Medication not found' });

    med.remove();
    await user.save();
    res.json({ success: true, message: 'Medication deleted' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete medication' });
  }
});

module.exports = router;