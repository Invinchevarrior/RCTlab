const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = '123456'; 

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'MISSING_FIELDS',
        message: 'Username and password are required' 
      });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'INVALID_USERNAME',
        message: 'Username must be at least 3 characters long' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'INVALID_PASSWORD',
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // 检查用户是否已存在
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ 
        error: 'USERNAME_EXISTS',
        message: 'Username already exists. Please choose a different username.' 
      });
    }
    
    // 创建新用户
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    
    res.json({ 
      message: 'Registered successfully',
      username: user.username 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'SERVER_ERROR',
      message: 'Registration failed. Please try again later.' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'MISSING_FIELDS',
        message: 'Username and password are required' 
      });
    }
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ 
        error: 'USER_NOT_FOUND',
        message: 'Username not found. Please check your username or register a new account.' 
      });
    }
    
    // 验证密码
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ 
        error: 'INVALID_PASSWORD',
        message: 'Incorrect password. Please check your password and try again.' 
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      username: user.username,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'SERVER_ERROR',
      message: 'Login failed. Please try again later.' 
    });
  }
});

module.exports = router; 