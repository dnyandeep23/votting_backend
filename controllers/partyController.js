const Party = require('../models/partyModel');

// Get all parties
const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find().sort({ createdAt: -1 });
    res.json({ parties });
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({ error: 'Server error fetching parties', errorMessage: error.message });
  }
};

// Add new party (Admin only)
const addParty = async (req, res) => {
  try {
    const { name, symbol, description, leader, color, status, translations } = req.body;

    const partyData = {
      name: name.trim(),
      symbol: symbol.trim(),
      description: description?.trim(),
      leader: leader?.trim(),
      color: color || '#FF9933',
      status: status || 'active'
    };

    // Add translations if provided
    if (translations) {
      partyData.translations = {
        en: {
          name: translations.en?.name || name,
          description: translations.en?.description || description,
          leader: translations.en?.leader || leader
        },
        hi: {
          name: translations.hi?.name || '',
          description: translations.hi?.description || '',
          leader: translations.hi?.leader || ''
        },
        mr: {
          name: translations.mr?.name || '',
          description: translations.mr?.description || '',
          leader: translations.mr?.leader || ''
        }
      };
    }

    const newParty = new Party(partyData);
    const savedParty = await newParty.save();
    
    res.status(201).json({
      message: 'Party added successfully',
      party: savedParty
    });

  } catch (error) {
    console.error('Error adding party:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Party name already exists' });
    }
    res.status(500).json({ error: 'Server error adding party', errorMessage: error.message });
  }
};

// Update party (Admin only)
const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Update the updatedAt field
    updateData.updatedAt = Date.now();

    const updatedParty = await Party.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedParty) {
      return res.status(404).json({ error: 'Party not found' });
    }

    res.json({
      message: 'Party updated successfully',
      party: updatedParty
    });

  } catch (error) {
    console.error('Error updating party:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Party name already exists' });
    }
    res.status(500).json({ error: 'Server error updating party', errorMessage: error.message });
  }
};

// Delete party permanently (Admin only)
const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;

    // Permanently delete the party from database
    const deletedParty = await Party.findByIdAndDelete(id);

    if (!deletedParty) {
      return res.status(404).json({ error: 'Party not found' });
    }

    res.json({
      message: 'Party deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({ error: 'Server error deleting party', errorMessage: error.message });
  }
};

module.exports = { getAllParties, addParty, updateParty, deleteParty };
