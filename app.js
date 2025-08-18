const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const voteRoutes = require('./routes/voteRoutes');
const partyRoutes = require('./routes/partyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/parties', partyRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Voting App API Server',
    endpoints: {
      users: '/api/users',
      votes: '/api/votes',
      parties: '/api/parties'
    }
  });
});

// Long polling for live results
let pendingResultsRequests = [];

app.get('/api/votes/live-poll', (req, res) => {
  // Set timeout for 30 seconds
  const timeout = setTimeout(() => {
    res.json({ timeout: true });
  }, 30000);

  // Store request for live updates
  pendingResultsRequests.push({
    response: res,
    timeout: timeout
  });
});

// Trigger live results update (called after each vote)
const notifyLiveResults = async () => {
  if (pendingResultsRequests.length > 0) {
    try {
      const Vote = require('./models/voteModel');
      const results = await Vote.aggregate([
        {
          $group: {
            _id: '$party',
            voteCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'parties',
            localField: '_id',
            foreignField: '_id',
            as: 'partyInfo'
          }
        },
        {
          $unwind: '$partyInfo'
        },
        {
          $project: {
            _id: 0,
            partyId: '$_id',
            partyName: '$partyInfo.name',
            symbol: '$partyInfo.symbol',
            voteCount: 1
          }
        },
        {
          $sort: { voteCount: -1 }
        }
      ]);

      const totalVotes = await Vote.countDocuments();

      const liveData = {
        totalVotes,
        results,
        timestamp: new Date()
      };

      // Send to all pending requests
      pendingResultsRequests.forEach(request => {
        clearTimeout(request.timeout);
        request.response.json(liveData);
      });

      // Clear pending requests
      pendingResultsRequests = [];

    } catch (error) {
      console.error('Error sending live results:', error);
    }
  }
};

// Make notifyLiveResults available globally
global.notifyLiveResults = notifyLiveResults;

app.listen(PORT, () => {
  console.log(`Voting app server running on http://localhost:${PORT}`);
});

module.exports = app;
