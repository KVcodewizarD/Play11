const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user'); // Make sure you have a user model
const authMiddleware = require('../middleware/auth');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Calculate global rank for new user (lowest rank)
      const totalUsers = await User.countDocuments();
      const globalRank = totalUsers + 1;

      user = new User({
        username,
        email,
        password,
        balance: 100,           // New users get 100 credits
        rankPoints: 0,          // Start with 0 rank points
        globalRank: globalRank  // Lowest rank initially
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          // Return token and user object, excluding password
          const userResponse = user.toObject();
          delete userResponse.password;
          res.json({ token, user: userResponse });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          // Return token and user object, excluding password
          const userResponse = user.toObject();
          delete userResponse.password;
          res.json({ token, user: userResponse });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/users/profile
// @desc    Get logged in user's profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/update-rank
// @desc    Update user's rank points and credits after contest
// @access  Private
router.put('/update-rank', authMiddleware, async (req, res) => {
  try {
    const { contestPlayed, contestWon, winnings } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update contest statistics
    user.contestsPlayed += contestPlayed || 0;
    user.contestsWon += contestWon || 0;
    user.totalWinnings += winnings || 0;

    // Update rank points: +5 for playing, +10 for winning
    if (contestPlayed) {
      user.rankPoints += 5;
      user.balance += 10; // Award 10 credits for playing
    }
    if (contestWon) {
      user.rankPoints += 10; // Additional 10 points for winning
    }

    // Calculate win rate
    user.winRate = user.contestsPlayed > 0 ? (user.contestsWon / user.contestsPlayed) * 100 : 0;

    // Recalculate global rank (higher rank points = better rank)
    const usersWithBetterRank = await User.countDocuments({ 
      rankPoints: { $gt: user.rankPoints } 
    });
    user.globalRank = usersWithBetterRank + 1;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/leaderboard
// @desc    Get global user leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -email')
      .sort({ rankPoints: -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      rankPoints: user.rankPoints,
      contestsWon: user.contestsWon,
      contestsPlayed: user.contestsPlayed,
      winRate: user.winRate,
      totalWinnings: user.totalWinnings
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;