const mongoose = require('mongoose');

const ProblemStatusSchema = new mongoose.Schema({
  problemId: { type: String, required: true }, // 兼容ObjectId字符串
  status: { type: String, default: '' }, // Solved, Unsolved, Hard
  favorite: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  problems: [ProblemStatusSchema], // 用户刷题详情
});

module.exports = mongoose.model('User', UserSchema); 