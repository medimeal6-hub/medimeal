const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    // Validate names (no numbers allowed)
    if (/\d/.test(firstName || "")) {
      return res.status(400).json({ error: "First name cannot contain numbers" });
    }
    if (/\d/.test(lastName || "")) {
      return res.status(400).json({ error: "Last name cannot contain numbers" });
    }

    const user = new User(req.body);
    await user.save();
    res.status(201).json(user.getProfile()); // hide password
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password included
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // (Later: generate JWT token here)
    res.json(user.getProfile());
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get All Users (for testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(u => u.getProfile()));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Change Password
router.put("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Set new password (pre-save middleware will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
