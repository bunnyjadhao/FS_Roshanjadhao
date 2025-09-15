require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);
const { initSocket } = require('./socket');

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// routes
const authRoutes = require('./routes/auth');
const commutesRoutes = require('./routes/commutes');
const matchesRoutes = require('./routes/matches');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/commutes', commutesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/chat', chatRoutes);

// init sockets
const io = initSocket(server, process.env.FRONTEND_URL);

// start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
