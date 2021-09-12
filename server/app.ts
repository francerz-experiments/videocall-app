const httpPort = process.env.HTTP_PORT ?? 3000;
const turnPort = process.env.TURN_PORT ?? 3478;

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Launch HTTP Server
app.use(express.static('public'));
server.listen(httpPort,
    () => console.log(`Open http://localhost:${httpPort}/server.html and http://localhost:${httpPort}`)
);
 
// ------------------------------------
// Launch TURN server
const nodeTurn = require('node-turn');
const turnServer = new nodeTurn({
    listeningPort: turnPort,
    credentials: { "user":"pswd" }
});
turnServer.start();

// ------------------------------------
let broadcaster;
io.sockets.on('connection', socket => {
    socket.on('broadcast', () => {
        broadcaster = socket.id;
        socket.broadcast.emit('broadcast');
    });
    socket.on('watcher', () => {
        socket.to(broadcaster).emit('watcher', socket.id);
    });
    socket.on('disconnect', () => {
        socket.to(broadcaster).emit('disconnectPeer', socket.id);
    });
    socket.on('offer', (id, message) => {
        socket.to(id).emit('offer', socket.id, message);
    });
    socket.on('answer', (id, message) => {
        socket.to(id).emit('answer', socket.id, message);
    });
    socket.on('candidate', (id, message) => {
        socket.to(id).emit('candidate', socket.id, message);
    });
});

