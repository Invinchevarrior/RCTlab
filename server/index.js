const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');

const app = express();
app.use(cors());
app.use(express.json());

// TODO: MongoDB连接字符串请替换为你的云端MongoDB Atlas连接
mongoose.connect('mongodb+srv://Peter:N7hPNnnt5UQ_uB6@cluster0.pjpstqp.mongodb.net/RCTlab?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.send('CodePen Clone API running');
});

// TODO: 用户、题库、刷题记录等API路由
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 