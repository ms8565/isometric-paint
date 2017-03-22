"use strict";

let socket;

let lastActions = [];
let undoneActions = [];

const init = (e) => {
    
    const join = document.querySelector("#join");
    join.addEventListener('click', checkJoinRoom);

    const create = document.querySelector("#create");
    create.addEventListener('click', checkCreateRoom);

    socket = io.connect();
    setupSocket();

};
window.onload = init;

const undoAction = () => {
    //var lastAction = lastActions.pop();
    //undoneActions.push(lastAction);
    //update(lastAction);

    let testTris = triangles;
    for(var i = 0; i < triangles.length; i++){
        testTris[i].setColor('#ff000f');
    }

    socket.emit("undoAction", {testTri: testTris});
}

const redoAction = () => {

}

const setupSocket = (e) => {
     socket.on('connect', () => {
        socket.emit('join', null);
    });
    socket.on('joinRoom', (data) => {
        setupApp();
        socket.roomName = data.roomName;
    });
    socket.on('denyRoom', (data) => {
        let errorText = document.querySelector("#error-text");
        errorText.innerHTML = data.message;
    });

};

const setupApp = (e) => {
    setupCanvas();
    updateColor();
    
    socket.emit("initializeTriangles", null);
    document.getElementById('creation-container').style.display = 'none';
    document.getElementById('paint-container').style.display = 'block';
};

const checkJoinRoom = () => {
    let roomInput = document.querySelector("#room-input").value;
    socket.emit('checkJoin', { roomName: roomInput });
}
const checkCreateRoom = () => {
    let roomInput = document.querySelector("#room-input").value;
    socket.emit('checkCreate', { roomName: roomInput });
}

        