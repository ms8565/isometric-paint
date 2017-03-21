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

let currentTriangles = [];
const currentColors = ['#0f0000',
  '#00ff00',
  '#ffffff',
  '#ff00ff',
  '#fff0ff',
  '#f0ffff',
  '#ffffff',
  '#0000ff',
];
const lastActions = [];
const undoneActions = [];

const rooms = {};

class Room {
  constructor(name) {
    this.name = name;
    this.firstUser = true;
    this.numUsers = 0;
    this.active = false;
    this.currentTriangles = [];
    this.currentColors = currentColors;
  }
  addUser(sock) {
    const socket = sock;
    socket.join(this.name);
    this.numUsers += 1;
  }
  removeUser(sock) {
    const socket = sock;
    socket.leave(this.name);

    if (this.numUsers <= 0) {
      delete rooms[this.name];
    }
  }
  addSwatch(data) {
    const colorIndex = this.currentColors.indexOf(data.newColor);
      // Check if color is already in the array
    if (colorIndex !== -1) {
        // If it is, move it to the front
      this.currentColors.unshift(this.currentColors.splice(colorIndex, 1)[0]);
    } else {
        // If it isn't, insert it and pop the last value
      this.currentColors.unshift(data.newColor);
      this.currentColors.pop();
    }
    io.sockets.in(this.name).emit('updateSwatches', { swatches: this.currentColors });
  }
  initializeTriangles(sock) {
    const socket = sock;
    if (this.firstUser) {
      socket.emit('setupFirstCanvas', null);
      this.firstUser = false;
    } else {
      socket.emit('updateCanvas', { triangles: this.currentTriangles });
    }
  }
  updateTriangles(data) {
    this.currentTriangles = data.triangles;
  }
  draw(data) {
    for (let i = 0; i < data.triangles.length; i += 1) {
      this.currentTriangles[data.triangles[i].id] = data.triangles[i];
    }
    io.sockets.in(this.name).emit('updateCanvas', data);
  }
  /* addAction() {

  }
  undoAction() {

  }
  redoAction() {

  }*/

}

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
      rooms[data.roomName] = new Room(data.roomName);
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
    console.log('check disconnect');
    rooms[socket.roomName].removeUser(socket);
  });
};

const onDraw = (sock) => {
  const socket = sock;

  socket.on('draw', (data) => {
    rooms[socket.roomName].draw(data);
  });
};

const onUpdate = (sock) => {
  const socket = sock;

  socket.on('initializeTriangles', () => {
    rooms[socket.roomName].initializeTriangles(socket);
  });
  socket.on('addSwatch', (data) => {
    rooms[socket.roomName].addSwatch(data);
  });
  socket.on('pushAction', () => {
    lastActions.push(currentTriangles);
  });
  socket.on('updateTriangles', (data) => {
    currentTriangles = data.triangles;
  });

  socket.on('undoAction', () => {
    undoneActions.push(currentTriangles);

    if (lastActions.length > 0) {
//        console.log("Actions Length: "+lastActions.length)
//        currentTriangles = lastActions.pop();
//        console.log("Triangles length: "+currentTriangles.length);
//        for (let i = 0; i < currentTriangles.length; i += 1) {
//            currentTriangles[i] = data.testTri[i];
//        }

      // io.sockets.in('room1').emit('updateCanvas', { triangles: currentTriangles });
    } else {
      console.log('No actions in the list');
    }
  });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
  onDraw(socket);
  onDisconnect(socket);
  onUpdate(socket);
});
