const http = require('http');
// const fs = require('fs');
const socketio = require('socket.io');
const express = require('express');
const path = require('path');

const sockets = require('./sockets.js');


const port = process.env.PORT || process.env.NODE_PORT || 3000;

// const index = fs.readFileSync(`${__dirname}/../client/index.html`);

// const onRequest = (request, response) => {
//  response.writeHead(200, { 'Content-Type': 'text/html' });
//  response.write(index);
//  response.end();
// };

const app = express();

// app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use('/assets', express.static(path.resolve(`${__dirname}/../client/`)));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../client/index.html`));
});

const server = http.createServer(app);
const io = socketio(server);
sockets.setupSockets(io);

server.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});

