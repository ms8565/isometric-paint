const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

const io = socketio(app);

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    socket.join('room1');
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
};

const onDraw = (sock) => {
  const socket = sock;

  socket.on('draw', (data) => {
    io.sockets.in('room1').emit('updateCanvas', data);
  });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
  onDraw(socket);
  onDisconnect(socket);
});
