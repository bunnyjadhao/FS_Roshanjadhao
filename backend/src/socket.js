const { Server } = require('socket.io');
const db = require('./db');

function initSocket(server, allowedOrigin) {
  const io = new Server(server, {
    cors: { origin: allowedOrigin || '*' },
    maxHttpBufferSize: 1e6
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    // join match room
    socket.on('join_match', (data) => {
      const { match_id, user_id } = data;
      socket.join(match_id);
    });

    socket.on('send_message', async (data) => {
      // { match_id, sender_user, content }
      const { match_id, sender_user, content } = data;
      // save
      await db.query('INSERT INTO messages (match_id, sender_user, content) VALUES ($1,$2,$3)', [match_id, sender_user, content]);
      // emit to room
      io.to(match_id).emit('message', { match_id, sender_user, content, created_at: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      console.log('socket disconnect', socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };
