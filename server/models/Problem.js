const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: [String],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  description: String,
  // More fields can be extended, such as sample input/output, constraints, etc.
});

module.exports = mongoose.model('Problem', ProblemSchema); 