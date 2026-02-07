const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// SEED DATA: Add sample departments if database is empty
router.post('/seed', async (req, res) => {
  try {
    const existingCount = await Department.countDocuments();
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: `Database already has ${existingCount} departments`,
        count: existingCount
      });
    }

    const sampleDepartments = [
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Manages employee relations, recruitment, and HR policies',
        headOfDepartment: 'Sarah Johnson',
        email: 'hr@tapaal.com',
        phone: '+1-555-0101',
        location: 'Building A, Floor 2',
        status: 'active'
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Handles financial planning, accounting, and budget management',
        headOfDepartment: 'Michael Chen',
        email: 'finance@tapaal.com',
        phone: '+1-555-0102',
        location: 'Building A, Floor 3',
        status: 'active'
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'Manages IT infrastructure, software development, and technical support',
        headOfDepartment: 'David Kumar',
        email: 'it@tapaal.com',
        phone: '+1-555-0103',
        location: 'Building B, Floor 1',
        status: 'active'
      },
      {
        name: 'Operations',
        code: 'OPS',
        description: 'Oversees daily operations, logistics, and process optimization',
        headOfDepartment: 'Lisa Williams',
        email: 'operations@tapaal.com',
        phone: '+1-555-0104',
        location: 'Building B, Floor 2',
        status: 'active'
      },
      {
        name: 'Legal',
        code: 'LEG',
        description: 'Provides legal counsel, contract management, and compliance',
        headOfDepartment: 'Robert Martinez',
        email: 'legal@tapaal.com',
        phone: '+1-555-0105',
        location: 'Building A, Floor 4',
        status: 'active'
      }
    ];

    const insertedDepartments = await Department.insertMany(sampleDepartments);

    res.json({
      success: true,
      message: `Successfully seeded ${insertedDepartments.length} departments`,
      count: insertedDepartments.length,
      data: insertedDepartments
    });
  } catch (error) {
    console.error('Error seeding departments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed departments',
      error: error.message
    });
  }
});

// GET all departments
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/departments - Fetching all departments');

    // Add timeout for serverless
    const departments = await Department.find()
      .sort({ createdAt: -1 })
      .maxTime(10000) // 10 second timeout
      .lean(); // Return plain objects for better performance

    console.log('� Found departments:', departments.length);

    // Add cache headers for better performance
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache

    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('❌ Error fetching departments:', error);

    // Better error handling for serverless
    if (error.name === 'MongooseServerSelectionError') {
      res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable',
        error: 'Database connection timeout'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      });
    }
  }
});

// POST new department
router.post('/', async (req, res) => {
  try {
    console.log('🔍 POST /api/departments - Creating department:', req.body);

    // Validate required fields
    const { name, code, description, headOfDepartment, email, phone, location } = req.body;

    if (!name || !code || !description || !headOfDepartment || !email || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, code, description, headOfDepartment, email, phone, location'
      });
    }

    const department = new Department({
      name,
      code,
      description,
      headOfDepartment,
      email,
      phone,
      location,
      status: req.body.status || 'active'
    });

    await department.save();
    console.log('✅ Department created successfully:', department.name);
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('❌ Error creating department:', error);

    // Handle specific errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Department ${field} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + errors.join(', ')
      });
    }

    if (error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable',
        error: 'Connection timeout'
      });
    }

    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
});

// GET single department by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 GET /api/departments/:id - Fetching department:', req.params.id);
    const department = await Department.findById(req.params.id);

    if (!department) {
      console.log('❌ Department not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    console.log('📥 Department found successfully:', department.name);
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('❌ Error fetching department:', error);
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
