const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', [
  auth,
  authorize('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('role').optional().isIn(['admin', 'auditor', 'farmer']).withMessage('Invalid role')
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
    const role = req.query.role || null;

    const users = await User.findAll(page, limit, role);
    const total = await User.count(role);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID (Admin or own user)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Admin can access any user, users can only access themselves
    if (req.user.role !== 'admin' && req.user.id != id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (Admin only, or user updating their own info with restrictions)
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['admin', 'auditor', 'farmer']).withMessage('Invalid role'),
  body('farmer_id').optional().isNumeric().withMessage('Farmer ID must be numeric')
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
    const updateData = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Admin can update any user, users can only update limited fields of their own profile
    if (req.user.role !== 'admin') {
      if (req.user.id != id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Non-admin users can only update name and email
      const allowedFields = ['name', 'email'];
      const requestedFields = Object.keys(updateData);
      const hasRestrictedFields = requestedFields.some(field => !allowedFields.includes(field));
      
      if (hasRestrictedFields) {
        return res.status(403).json({ error: 'Cannot update role or farmer_id' });
      }
    }

    // If email is being updated, check if it's already taken by another user
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailUser = await User.findByEmail(updateData.email);
      if (emailUser && emailUser.id != id) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
    }

    // Admin can update all fields, users can update only allowed fields
    const userData = req.user.role === 'admin' ? updateData : {
      name: updateData.name,
      email: updateData.email
    };

    const updatedUser = await User.update(id, userData);
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id == id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deletedUser = await User.delete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      deletedUserId: deletedUser.id
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
