const mongoose = require('mongoose');

const ProblemStatusSchema = new mongoose.Schema({
  problemId: { type: String, required: true }, 
  status: { type: String, default: '' }, // Solved, Unsolved, Hard
  favorite: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  problems: [ProblemStatusSchema], // details of problems attempted by the user
});

module.exports = mongoose.model('User', UserSchema); 