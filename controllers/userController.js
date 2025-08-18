const User = require('../models/userModel');
const Admin = require('../models/adminModel');
// Verify user before voting
const verifyUser = async (req, res) => {
  try {
    const { firstName, fatherName, motherName, lastName, email, phoneNumber } = req.body;
    console.log('Verifying user:', { firstName, fatherName, motherName, lastName, email, phoneNumber });
    // Check for existing user by name combination

    const verified = await User.findOne({
      firstName: firstName.toLowerCase().trim(),
      fatherName: fatherName?.toLowerCase().trim() || '',
      motherName: motherName?.toLowerCase().trim() || '',
      lastName: lastName.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim()
    });


    if (verified && !verified.hasVoted) {
      return res.status(200).json({
        message: 'This user has already been verified, but not voted. You can vote Now',
        userId: verified._id,
        user: {
          name: `${verified.firstName} ${verified.fatherName} ${verified.lastName}`.trim(),
          email: verified.email
        }
      });
    }

    const existingUserByName = await User.findOne({
      firstName: firstName.toLowerCase().trim(),
      fatherName: fatherName?.toLowerCase().trim() || '',
      motherName: motherName?.toLowerCase().trim() || '',
      lastName: lastName.toLowerCase().trim()
    });

    if (existingUserByName) {
      return res.status(400).json({
        error: 'This name combination has already voted',
        field: 'name'
      });
    }

    // Check for existing email
    const existingUserByEmail = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingUserByEmail) {
      return res.status(400).json({
        error: 'This email has already been used for voting',
        field: 'email'
      });
    }

    // Check for existing phone number
    const existingUserByPhone = await User.findOne({ 
      phoneNumber: phoneNumber.trim() 
    });

    if (existingUserByPhone) {
      return res.status(400).json({
        error: 'This phone number has already been used for voting',
        field: 'phone'
      });
    }

    // User is valid, create and return user ID for voting
    const newUser = new User({
      firstName: firstName.toLowerCase().trim(),
      fatherName: fatherName?.toLowerCase().trim() || '',
      motherName: motherName?.toLowerCase().trim() || '',
      lastName: lastName.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim()
    });

    const savedUser = await newUser.save();

    res.status(200).json({
      message: 'User verified successfully',
      userId: savedUser._id,
      user: {
        name: `${savedUser.firstName} ${savedUser.fatherName} ${savedUser.lastName}`.trim(),
        email: savedUser.email
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' 
        ? 'This email has already been used for voting'
        : field === 'phoneNumber'
        ? 'This phone number has already been used for voting'
        : 'This name combination has already voted';
      
      return res.status(400).json({
        error: message,
        field: field
      });
    }
    
    res.status(500).json({ 
      error: 'Server error during user verification' ,
      errorMessage: error
    });
  }
};

const adminsignin = async (req, res) => {
  try {
    const { identifier, password } = req.body; // 'identifier' can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();

    // Check if identifier is email (simple email validation)
    const isEmail = cleanIdentifier.includes('@');

    // Create query based on identifier type
    const query = isEmail 
      ? { email: cleanIdentifier }
      : { username: cleanIdentifier };

    // Find the admin
    const admin = await Admin.findOne(query);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Check password
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Admin signed in successfully
    res.status(200).json({
      message: 'Admin signed in successfully',
      adminId: admin._id,
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error during admin sign-in',
      errorMessage: error.message
    });
  }
};


module.exports = { verifyUser, adminsignin };
