require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const sessionRoutes = require('./routes/sessionRoutes');
const doubtRoutes = require('./routes/doubtRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const historyRoutes = require('./routes/historyRoutes');
const pollRoutes = require('./routes/pollRoutes');
const app = express();
const server = http.createServer(app);
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const verifyEmailRoutes = require('./routes/verifyEmailRoutes');

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/api/sessions', sessionRoutes);
app.use('/api/sessions', doubtRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/verify-email', verifyEmailRoutes);
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join_session', (sessionCode) => {
    socket.join(sessionCode);
    console.log(`Socket ${socket.id} joined room ${sessionCode}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));