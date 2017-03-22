class Room {
  constructor(name) {
    this.name = name;
    this.firstUser = true;
    this.numUsers = 0;
    this.active = false;
    this.currentTriangles = [];
    this.currentColors = ['#0f0000',
      '#00ff00',
      '#ffffff',
      '#ff00ff',
      '#fff0ff',
      '#f0ffff',
      '#ffffff',
      '#0000ff',
    ];
    this.lastActions = [];
    this.undoneActions = [];
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
      return true;
    }
    return false;
  }
  addSwatch(data, ioServer) {
    const io = ioServer;
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
  draw(data, ioServer) {
    const io = ioServer;
    for (let i = 0; i < data.triangles.length; i += 1) {
      this.currentTriangles[data.triangles[i].id] = data.triangles[i];
    }
    io.sockets.in(this.name).emit('updateCanvas', data);
  }
  addAction() {
    this.lastActions.push(this.currentTriangles);
  }
  undoAction() {
    this.undoneActions.push(this.currentTriangles);

    if (this.lastActions.length > 0) {
        /* console.log("Actions Length: "+lastActions.length)
        currentTriangles = lastActions.pop();
        console.log("Triangles length: "+currentTriangles.length);
        for (let i = 0; i < currentTriangles.length; i += 1) {
            currentTriangles[i] = data.testTri[i];
        }

       io.sockets.in('room1').emit('updateCanvas', { triangles: currentTriangles });*/
    } else {
      console.log('No actions in the list');
    }
  }
  /* redoAction() {

  }*/

}

const createRoom = roomName => new Room(roomName);

module.exports.createRoom = createRoom;


// const getRoom = roomName => rooms[roomName];
