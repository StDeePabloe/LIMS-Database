const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error in authentication.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

const farmerAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'auditor') {
      return next();
    }

    if (req.user.role === 'farmer') {
      const farmerId = req.params.farmerId || req.query.farmer_id || req.body.farmer_id;
      
      if (farmerId && req.user.farmer_id != farmerId) {
        return res.status(403).json({ 
          error: 'Access denied. Farmers can only access their own data.' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Farmer access middleware error:', error);
    res.status(500).json({ error: 'Server error in access control.' });
  }
};

module.exports = { auth, authorize, farmerAccess };
