const express = require('express');
const { query, validationResult } = require('express-validator');
const { auth, authorize, farmerAccess } = require('../middleware/auth');
const db = require('../config/database');
const puppeteer = require('puppeteer');

const router = express.Router();

// Generate comprehensive assessment report (Admin and Auditor only)
router.get('/assessment/:farmerId', [
  auth,
  authorize('admin', 'auditor'),
  query('format').optional().isIn(['json', 'pdf']).withMessage('Format must be json or pdf')
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
    const format = req.query.format || 'json';

    // Get farmer information
    const farmerQuery = 'SELECT * FROM farmers WHERE id = $1';
    const farmerResult = await db.query(farmerQuery, [farmerId]);
    
    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const farmer = farmerResult.rows[0];

    // Get all farm data
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

    const farmData = {};
    
    for (const table of tables) {
      const dataQuery = `SELECT * FROM ${table} WHERE farmer_id = $1 ORDER BY updated_at DESC`;
      const result = await db.query(dataQuery, [farmerId]);
      farmData[table] = result.rows;
    }

    const reportData = {
      farmer,
      farmData,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.name,
      summary: {
        totalTables: Object.keys(farmData).length,
        totalRecords: Object.values(farmData).reduce((sum, records) => sum + records.length, 0)
      }
    };

    if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(reportData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="farm-assessment-${farmerId}-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.json({
        message: 'Assessment report generated successfully',
        report: reportData
      });
    }
  } catch (error) {
    console.error('Generate assessment report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get farmer's own reports (Farmer access)
router.get('/my-reports', [
  auth,
  authorize('farmer')
], async (req, res) => {
  try {
    const farmerId = req.user.farmer_id;
    
    if (!farmerId) {
      return res.status(400).json({ error: 'Farmer ID not associated with user account' });
    }

    // Get farmer information
    const farmerQuery = 'SELECT * FROM farmers WHERE id = $1';
    const farmerResult = await db.query(farmerQuery, [farmerId]);
    
    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const farmer = farmerResult.rows[0];

    // Get all farm data (view-only)
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

    const farmData = {};
    
    for (const table of tables) {
      const dataQuery = `SELECT * FROM ${table} WHERE farmer_id = $1 ORDER BY updated_at DESC`;
      const result = await db.query(dataQuery, [farmerId]);
      farmData[table] = result.rows;
    }

    const reportData = {
      farmer,
      farmData,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTables: Object.keys(farmData).length,
        totalRecords: Object.values(farmData).reduce((sum, records) => sum + records.length, 0)
      }
    };

    res.json({
      message: 'Your farm data retrieved successfully',
      report: reportData
    });
  } catch (error) {
    console.error('Get farmer reports error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get system-wide statistics (Admin only)
router.get('/statistics', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    // Get user statistics
    const userStatsQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;
    const userStatsResult = await db.query(userStatsQuery);

    // Get farmer statistics
    const farmerCountQuery = 'SELECT COUNT(*) as count FROM farmers';
    const farmerCountResult = await db.query(farmerCountQuery);

    // Get data statistics for each table
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

    const dataStats = {};
    
    for (const table of tables) {
      const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
      const result = await db.query(countQuery);
      dataStats[table] = parseInt(result.rows[0].count);
    }

    const statistics = {
      users: userStatsResult.rows,
      totalFarmers: parseInt(farmerCountResult.rows[0].count),
      dataRecords: dataStats,
      totalDataRecords: Object.values(dataStats).reduce((sum, count) => sum + count, 0),
      generatedAt: new Date().toISOString()
    };

    res.json({
      message: 'System statistics retrieved successfully',
      statistics
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PDF Generation Helper Function
async function generatePDFReport(reportData) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Farm Assessment Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .farmer-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .data-table th { background-color: #f2f2f2; }
        .summary { background: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Farm Assessment Report</h1>
        <p>Generated on: ${new Date(reportData.generatedAt).toLocaleString()}</p>
        <p>Generated by: ${reportData.generatedBy}</p>
      </div>
      
      <div class="farmer-info">
        <h2>Farmer Information</h2>
        <p><strong>Name:</strong> ${reportData.farmer.name}</p>
        <p><strong>Location:</strong> ${reportData.farmer.location}</p>
        <p><strong>Contact:</strong> ${reportData.farmer.contact_number || 'N/A'}</p>
        <p><strong>Registration Date:</strong> ${new Date(reportData.farmer.registration_date).toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Tables:</strong> ${reportData.summary.totalTables}</p>
        <p><strong>Total Records:</strong> ${reportData.summary.totalRecords}</p>
      </div>
      
      ${Object.entries(reportData.farmData).map(([table, records]) => `
        <div class="section">
          <h2>${table.replace(/_/g, ' ').toUpperCase()}</h2>
          ${records.length > 0 ? `
            <table class="data-table">
              <thead>
                <tr>
                  ${Object.keys(records[0]).filter(key => key !== 'farmer_id').map(key => `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${records.map(record => `
                  <tr>
                    ${Object.entries(record).filter(([key]) => key !== 'farmer_id').map(([key, value]) => `<td>${value || 'N/A'}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No records found</p>'}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return pdfBuffer;
}

module.exports = router;
