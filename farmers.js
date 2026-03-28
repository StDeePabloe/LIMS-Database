const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { auth, authorize, farmerAccess } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all farmers (Admin and Auditor only)
router.get('/', [
  auth,
  authorize('admin', 'auditor'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT f.id, f.name, f.location, f.contact_number, f.registration_date,
             u.email as user_email, u.created_at as user_created_at
      FROM farmers f
      LEFT JOIN users u ON f.id = u.farmer_id
    `;
    
    let countQuery = 'SELECT COUNT(DISTINCT f.id) FROM farmers f LEFT JOIN users u ON f.id = u.farmer_id';
    let params = [];

    if (search) {
      const searchCondition = ` WHERE f.name ILIKE $1 OR f.location ILIKE $1 OR u.email ILIKE $1`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY f.name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [farmersResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      farmers: farmersResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get farmer by ID (Admin, Auditor, or own farmer)
router.get('/:id', [
  auth,
  farmerAccess
], async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT f.*, u.email as user_email, u.created_at as user_created_at
      FROM farmers f
      LEFT JOIN users u ON f.id = u.farmer_id
      WHERE f.id = $1
    `;

    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({ farmer: result.rows[0] });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new farmer (Admin and Auditor only)
router.post('/', [
  auth,
  authorize('admin', 'auditor'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('location').trim().isLength({ min: 2, max: 200 }).withMessage('Location must be 2-200 characters'),
  body('contact_number').optional().trim().isLength({ min: 10, max: 20 }).withMessage('Contact number must be 10-20 characters'),
  body('registration_date').optional().isISO8601().withMessage('Valid date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, location, contact_number, registration_date } = req.body;

    const query = `
      INSERT INTO farmers (name, location, contact_number, registration_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await db.query(query, [name, location, contact_number, registration_date || new Date().toISOString()]);
    
    res.status(201).json({
      message: 'Farmer created successfully',
      farmer: result.rows[0]
    });
  } catch (error) {
    console.error('Create farmer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update farmer (Admin and Auditor only)
router.put('/:id', [
  auth,
  authorize('admin', 'auditor'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('location').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Location must be 2-200 characters'),
  body('contact_number').optional().trim().isLength({ min: 10, max: 20 }).withMessage('Contact number must be 10-20 characters'),
  body('registration_date').optional().isISO8601().withMessage('Valid date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { name, location, contact_number, registration_date } = req.body;

    // Check if farmer exists
    const existingFarmer = await db.query('SELECT id FROM farmers WHERE id = $1', [id]);
    if (existingFarmer.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const query = `
      UPDATE farmers 
      SET name = $1, location = $2, contact_number = $3, registration_date = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await db.query(query, [name, location, contact_number, registration_date, id]);
    
    res.json({
      message: 'Farmer updated successfully',
      farmer: result.rows[0]
    });
  } catch (error) {
    console.error('Update farmer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete farmer (Admin only)
router.delete('/:id', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if farmer exists
    const existingFarmer = await db.query('SELECT id FROM farmers WHERE id = $1', [id]);
    if (existingFarmer.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Check if farmer has associated user account
    const userAccount = await db.query('SELECT id FROM users WHERE farmer_id = $1', [id]);
    if (userAccount.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete farmer with associated user account. Delete the user account first.' });
    }

    const result = await db.query('DELETE FROM farmers WHERE id = $1 RETURNING id', [id]);
    
    res.json({
      message: 'Farmer deleted successfully',
      deletedFarmerId: result.rows[0].id
    });
  } catch (error) {
    console.error('Delete farmer error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
