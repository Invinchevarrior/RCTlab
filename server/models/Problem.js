const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: [String],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  description: String,
  // 可扩展更多字段，如样例输入输出、限制等
});

module.exports = mongoose.model('Problem', ProblemSchema); 