const Admin = require('../models/adminModel'); // Import your Admin model

const adminAuth = async (req, res, next) => {
  try {
    // Get admin ID from header
    const adminId = req.headers['x-admin-id'];
    
    if (!adminId) {
      return res.status(401).json({ 
        error: 'Access denied. Admin ID required.' 
      });
    }

    // Simply check if admin ID exists in database
    const adminExists = await Admin.findById(adminId);
    
    if (!adminExists) {
      return res.status(403).json({ 
        error: 'Access denied. Invalid admin ID.' 
      });
    }

    // Admin verified, proceed to next middleware
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      error: 'Server error during authentication.' 
    });
  }
};

module.exports = { adminAuth };
