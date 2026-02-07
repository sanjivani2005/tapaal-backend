const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// GET all departments
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/departments - Fetching all departments');
    const departments = await Department.find().sort({ createdAt: -1 });
    console.log('📥 Found departments:', departments.length);
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST new department
router.post('/', async (req, res) => {
  try {
    console.log('🔍 POST /api/departments - Creating department:', req.body);
    const department = new Department(req.body);
    await department.save();
    console.log('✅ Department created successfully:', department.name);
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('❌ Error creating department:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT update department
router.put('/:id', async (req, res) => {
  try {
    console.log('🔍 PUT /api/departments/:id - Updating department:', req.params.id, req.body);
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log('✅ Department updated successfully:', department.name);
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('❌ Error updating department:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE department
router.delete('/:id', async (req, res) => {
  try {
    console.log('🔍 DELETE /api/departments/:id - Deleting department:', req.params.id);
    await Department.findByIdAndDelete(req.params.id);
    console.log('✅ Department deleted successfully');
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
