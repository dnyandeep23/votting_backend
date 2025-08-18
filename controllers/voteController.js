const Vote = require('../models/voteModel');
const User = require('../models/userModel');
const Party = require('../models/partyModel');

// Submit vote
const submitVote = async (req, res) => {
  try {
    const { userId, partyId } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has already voted
    if (user.hasVoted) {
      return res.status(400).json({ error: 'User has already voted' });
    }

    
    // Check if party exists
    const party = await Party.findById(partyId);
    console.log('Party found:', party);
    if (!party || !party.status) {
      return res.status(404).json({ error: 'Party not found or inactive' });
    }

    
    console.log('Submitting vote for user:', userId, 'for party:', partyId);
    // Create vote
    const newVote = new Vote({
      user: userId,
      party: partyId
    });

    await newVote.save();

    // Update user's voted status
    await User.findByIdAndUpdate(userId, { hasVoted: true });

    res.status(201).json({
      message: 'Vote submitted successfully',
      vote: {
        partyName: party.name,
        timestamp: newVote.createdAt
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User has already voted' });
    }
    res.status(500).json({ error: 'Server error during vote submission' });
  }
};

// Get live vote results
const getLiveResults = async (req, res) => {
  try {
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

    res.json({
      totalVotes,
      results,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error fetching results' });
  }
};

module.exports = { submitVote, getLiveResults };
