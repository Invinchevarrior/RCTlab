const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Problem = require('../models/Problem');

const MONGO_URI = 'mongodb+srv://Peter:N7hPNnnt5UQ_uB6@cluster0.pjpstqp.mongodb.net/RCTlab?retryWrites=true&w=majority&appName=Cluster0'; 
const JSON_PATH = path.join(__dirname, '../leetcode_questions.json');

async function importQuestions() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

  // Only import questions with title and extract required fields
  const bulk = data
    .map(item => {
      const q = item?.data?.question;
      if (!q || !q.title) return null;
      return {
        title: q.title,
        tags: Array.isArray(q.topicTags) ? q.topicTags.map(t => t.name) : [],
        difficulty: typeof q.difficulty === 'string' ? q.difficulty : 'Easy',
        description: typeof q.content === 'string' ? q.content : '',
      };
    })
    .filter(Boolean);

  if (bulk.length === 0) {
    console.log('No valid questions to import.');
    process.exit();
  }

  // Optional: clear the original problem set
  // await Problem.deleteMany({});

  await Problem.insertMany(bulk);
  console.log('LeetCode questions imported:', bulk.length);
  process.exit();
}

importQuestions(); 