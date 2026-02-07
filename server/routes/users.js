const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/users - Fetching all users');
    const users = await User.find().sort({ createdAt: -1 });
    console.log('📥 Found users:', users.length);
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST new user
router.post('/', async (req, res) => {
  try {
    console.log('🔍 POST /api/users - Creating user:', req.body);
    const user = new User(req.body);
    await user.save();
    console.log('✅ User created successfully:', user.username);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    console.log('🔍 PUT /api/users/:id - Updating user:', req.params.id, req.body);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    console.log('✅ User updated successfully:', user.username);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    console.log('🔍 DELETE /api/users/:id - Deleting user:', req.params.id);
    await User.findByIdAndDelete(req.params.id);
    console.log('✅ User deleted successfully');
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
