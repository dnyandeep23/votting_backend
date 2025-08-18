const express = require('express');
const router = express.Router();
const { getAllParties, addParty, updateParty, deleteParty } = require('../controllers/partyController');
const { adminAuth } = require('../middleware/adminAuth');

// Public route
router.get('/', getAllParties);

// Protected admin routes
router.post('/', adminAuth, addParty);
router.put('/:id', adminAuth, updateParty);
router.delete('/:id', adminAuth, deleteParty);

module.exports = router;
