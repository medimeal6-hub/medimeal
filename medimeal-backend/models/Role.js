const mongoose = require('mongoose');

/**
 * Role
 * ----
 * RBAC role definition with a list of permissions.
 * This augments the basic `role` field on User with finer-grained capabilities.
 */

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

roleSchema.index({ name: 1 });

module.exports = mongoose.model('Role', roleSchema);



