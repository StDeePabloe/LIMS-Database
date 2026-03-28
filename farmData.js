const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { auth, authorize, farmerAccess } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get farm data for a specific farmer (Admin, Auditor, or own farmer)
router.get('/:farmerId', [
  auth,
  farmerAccess,
  query('table').optional().isAlpha().withMessage('Table name must contain only letters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { farmerId } = req.params;
    const { table } = req.query;

    // List of allowed tables
    const allowedTables = [
      'administrative_information',
      'farm_identification',
      'farm_infrastructure',
      'equipment',
      'crop_production_summer',
      'crop_production_winter',
      'crop_production_horticulture',
      'livestock_production',
      'irrigation_facilities',
      'overall_assessment'
    ];

    if (table && !allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    let data = {};

    if (table) {
      // Get specific table data
      const query = `SELECT * FROM ${table} WHERE farmer_id = $1 ORDER BY updated_at DESC`;
      const result = await db.query(query, [farmerId]);
      data[table] = result.rows;
    } else {
      // Get all tables data
      const promises = allowedTables.map(async (tableName) => {
        const query = `SELECT * FROM ${tableName} WHERE farmer_id = $1 ORDER BY updated_at DESC`;
        const result = await db.query(query, [farmerId]);
        return { [tableName]: result.rows };
      });

      const results = await Promise.all(promises);
      results.forEach(result => {
        Object.assign(data, result);
      });
    }

    res.json({ farmerId, data });
  } catch (error) {
    console.error('Get farm data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update farm data (Admin and Auditor only)
router.post('/:farmerId/:table', [
  auth,
  authorize('admin', 'auditor'),
  body('*').notEmpty().withMessage('Data cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { farmerId, table } = req.params;
    const data = req.body;

    // List of allowed tables
    const allowedTables = [
      'administrative_information',
      'farm_identification',
      'farm_infrastructure',
      'equipment',
      'crop_production_summer',
      'crop_production_winter',
      'crop_production_horticulture',
      'livestock_production',
      'irrigation_facilities',
      'overall_assessment'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Check if farmer exists
    const farmerExists = await db.query('SELECT id FROM farmers WHERE id = $1', [farmerId]);
    if (farmerExists.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Add farmer_id and timestamps to data
    const enrichedData = {
      ...data,
      farmer_id: farmerId,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Build dynamic INSERT query
    const columns = Object.keys(enrichedData);
    const values = Object.values(enrichedData);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await db.query(query, values);

    res.status(201).json({
      message: `${table} data created successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create farm data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update farm data (Admin and Auditor only)
router.put('/:farmerId/:table/:recordId', [
  auth,
  authorize('admin', 'auditor'),
  body('*').notEmpty().withMessage('Data cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { farmerId, table, recordId } = req.params;
    const data = req.body;

    // List of allowed tables
    const allowedTables = [
      'administrative_information',
      'farm_identification',
      'farm_infrastructure',
      'equipment',
      'crop_production_summer',
      'crop_production_winter',
      'crop_production_horticulture',
      'livestock_production',
      'irrigation_facilities',
      'overall_assessment'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Check if record exists and belongs to the farmer
    const existingRecord = await db.query(`SELECT * FROM ${table} WHERE id = $1 AND farmer_id = $2`, [recordId, farmerId]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Add updated_at timestamp
    const enrichedData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    // Build dynamic UPDATE query
    const columns = Object.keys(enrichedData);
    const values = Object.values(enrichedData);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $${columns.length + 1} AND farmer_id = $${columns.length + 2}
      RETURNING *
    `;

    const result = await db.query(query, [...values, recordId, farmerId]);

    res.json({
      message: `${table} data updated successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update farm data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete farm data (Admin only)
router.delete('/:farmerId/:table/:recordId', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const { farmerId, table, recordId } = req.params;

    // List of allowed tables
    const allowedTables = [
      'administrative_information',
      'farm_identification',
      'farm_infrastructure',
      'equipment',
      'crop_production_summer',
      'crop_production_winter',
      'crop_production_horticulture',
      'livestock_production',
      'irrigation_facilities',
      'overall_assessment'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Check if record exists and belongs to the farmer
    const existingRecord = await db.query(`SELECT id FROM ${table} WHERE id = $1 AND farmer_id = $2`, [recordId, farmerId]);
    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const query = `DELETE FROM ${table} WHERE id = $1 AND farmer_id = $2 RETURNING id`;
    const result = await db.query(query, [recordId, farmerId]);

    res.json({
      message: `${table} data deleted successfully`,
      deletedRecordId: result.rows[0].id
    });
  } catch (error) {
    console.error('Delete farm data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get summary of all farm data for a farmer
router.get('/:farmerId/summary', [
  auth,
  farmerAccess
], async (req, res) => {
  try {
    const { farmerId } = req.params;

    const tables = [
      'administrative_information',
      'farm_identification',
      'farm_infrastructure',
      'equipment',
      'crop_production_summer',
      'crop_production_winter',
      'crop_production_horticulture',
      'livestock_production',
      'irrigation_facilities',
      'overall_assessment'
    ];

    const summary = {};

    for (const table of tables) {
      const countQuery = `SELECT COUNT(*) as count FROM ${table} WHERE farmer_id = $1`;
      const result = await db.query(countQuery, [farmerId]);
      summary[table] = parseInt(result.rows[0].count);
    }

    // Get farmer basic info
    const farmerQuery = 'SELECT name, location, registration_date FROM farmers WHERE id = $1';
    const farmerResult = await db.query(farmerQuery, [farmerId]);

    res.json({
      farmer: farmerResult.rows[0] || null,
      dataSummary: summary,
      totalRecords: Object.values(summary).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    console.error('Get farm data summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
