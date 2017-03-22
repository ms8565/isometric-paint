const room = require('./room.js');

let io;
const rooms = {};


const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    // socket.join('room1');
  });

  socket.on('checkJoin', (data) => {
    if (data.roomName in rooms) {
      socket.roomName = data.roomName;
      rooms[socket.roomName].addUser(socket);
      socket.emit('joinRoom', { roomName: data.roomName });
    } else {
      socket.emit('denyRoom', { message: 'Room does not exist' });
    }
  });
  socket.on('checkCreate', (data) => {
    if (!(data.roomName in rooms)) {
      rooms[data.roomName] = room.createRoom(data.roomName);
      socket.roomName = data.roomName;

      rooms[socket.roomName].addUser(socket);
      socket.emit('joinRoom', { roomName: data.roomName });
    } else {
      socket.emit('denyRoom', { message: 'Room already exists' });
    }
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    const roomEmpty = rooms[socket.roomName].removeUser(socket);
    if (roomEmpty) {
      delete rooms[socket.roomName];
    }
  });
};

const onDraw = (sock) => {
  const socket = sock;

  socket.on('draw', (data) => {
    rooms[socket.roomName].draw(data, io);
  });
};

const onUpdate = (sock) => {
  const socket = sock;

  socket.on('initializeTriangles', () => {
    rooms[socket.roomName].initializeTriangles(socket);
  });
  socket.on('addSwatch', (data) => {
    rooms[socket.roomName].addSwatch(data, io);
  });
  socket.on('pushAction', () => {
    rooms[socket.roomName].addAction();
  });

  socket.on('undoAction', () => {
    rooms[socket.roomName].undoAction();
  });
};

const setupSockets = (ioServer) => {
  io = ioServer;

  io.sockets.on('connection', (socket) => {
    onJoined(socket);
    onDraw(socket);
    onDisconnect(socket);
    onUpdate(socket);
  });
};

module.exports.setupSockets = setupSockets;

