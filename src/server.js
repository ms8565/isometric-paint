'use strict';

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
let firstUser = true;

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    socket.join('room1');
  });
  
    if(firstUser){
        socket.emit('setupFirstCanvas', null);
        firstUser = false;
        console.log("first user");
    }
    else{
        socket.emit('updateCanvas', {triangles: currentTriangles});
        console.log("not first");
    }
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
};

const onDraw = (sock) => {
  console.log('draw');
  const socket = sock;

  socket.on('draw', (data) => {
    for(var i = 0; i < data.triangles.length; i++){
        currentTriangles[data.triangles[i].id] = data.triangles[i];
    }
    io.sockets.in('room1').emit('updateCanvas', data);
  });
};

const onUpdateTriangles = (sock) => {
      console.log('update');
    const socket = sock;
    
    socket.on('updateTriangles', (data) => {
        console.log("Updating triangles");
        currentTriangles = data.triangles;
    });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
  onDraw(socket);
  onDisconnect(socket);
  onUpdateTriangles(socket);
});
