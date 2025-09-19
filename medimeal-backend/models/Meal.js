const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  name: { type: String, required: true, trim: true },
  time: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      message: 'Time must be in HH:mm format'
    }
  },
  calories: { type: Number, default: 0, min: 0 },
  notes: { type: String, trim: true, default: '' }
}, { timestamps: true });

mealSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Meal', mealSchema);