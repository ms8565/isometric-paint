"use strict";

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
                       '#0000ff'
                      ];

let firstUser = true;

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    socket.join('room1');
  });

  if (firstUser) {
    socket.emit('setupFirstCanvas', null);
    firstUser = false;
  } else {
    socket.emit('updateCanvas', { triangles: currentTriangles });
  }
  socket.emit('updateSwatches', {swatches: currentColors});
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
    for (let i = 0; i < data.triangles.length; i += 1) {
      currentTriangles[data.triangles[i].id] = data.triangles[i];
    }
    io.sockets.in('room1').emit('updateCanvas', data);
  });
};

const onUpdate = (sock) => {
  const socket = sock;

  socket.on('updateTriangles', (data) => {
    currentTriangles = data.triangles;
  });
  socket.on('addSwatch', (data) => {
    const colorIndex = currentColors.indexOf(data.newColor);
    //Check if color is already in the array
    if(colorIndex != -1){
      //If it is, move it to the front
      currentColors.unshift(currentColors.splice(colorIndex, 1)[0]);
    }
    else{
      //If it isn't, insert it and pop the last value
      currentColors.unshift(data.newColor);
      currentColors.pop();
    }
      
    io.sockets.in('room1').emit('updateSwatches', { swatches: currentColors });
  });
};

io.sockets.on('connection', (socket) => {
  onJoined(socket);
  onDraw(socket);
  onDisconnect(socket);
  onUpdate(socket);
});
