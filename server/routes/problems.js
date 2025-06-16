const express = require('express');
const Problem = require('../models/Problem');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = '123456'; // Use a secure secret in production

// Authentication middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Pagination + filter + brief fields
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 100;
  const skip = (page - 1) * limit;
  const { search = '', tags = '', difficulty = '' } = req.query;
  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (tags) filter.tags = { $all: tags.split(',').filter(Boolean) };
  if (difficulty) filter.difficulty = difficulty;
  const total = await Problem.countDocuments(filter);
  const problems = await Problem.find(filter, { title: 1, tags: 1, difficulty: 1 })
    .skip(skip)
    .limit(limit);
  // Merge user problem status
  const user = await User.findOne({ username: req.user.username });
  const problemsWithStatus = problems.map(p => {
    const up = user.problems.find(up => up.problemId === p._id.toString());
    return {
      ...p.toObject(),
      status: up?.status || '',
      favorite: up?.favorite || false,
    };
  });
  res.json({ problems: problemsWithStatus, total });
});

// Get problem details
router.get('/:id', auth, async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Not found' });
  res.json(problem);
});

// Add new problem (for admin/developer)
router.post('/', async (req, res) => {
  const { title, tags, difficulty, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const problem = new Problem({ title, tags, difficulty, description });
  await problem.save();
  res.json({ message: 'Problem added', problem });
});

// Update problem status (status/favorite)
router.post('/status', auth, async (req, res) => {
  const { problemId, status, favorite } = req.body;
  const user = await User.findOne({ username: req.user.username });
  let up = user.problems.find(up => up.problemId === problemId);
  if (!up) {
    user.problems.push({ problemId, status: status || '', favorite: !!favorite });
  } else {
    if (status !== undefined) up.status = status;
    if (favorite !== undefined) up.favorite = favorite;
  }
  await user.save();
  res.json({ message: 'Status updated' });
});

module.exports = router; 