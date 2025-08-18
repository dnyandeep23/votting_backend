const express = require('express');
const router = express.Router();
const { submitVote, getLiveResults } = require('../controllers/voteController');

router.post('/submit', submitVote);
router.get('/results', getLiveResults);

module.exports = router;
