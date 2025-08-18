const express = require('express');
const router = express.Router();
const { verifyUser , adminsignin} = require('../controllers/userController');

router.post('/verify', verifyUser);
router.post('/admin-signin', adminsignin);

module.exports = router;
