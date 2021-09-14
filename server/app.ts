import Room from "./Room";
import SocketMediaHandler from "./SocketMediaHandler";

const httpPort = process.env.PORT ?? 3000;

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

// ------------------------------------
let room = new Room();
io.sockets.on('connection', socket => {
    SocketMediaHandler.handle(socket);
    // media sockets
    room.join(socket);
    // socket.on('media:disconnect', (broadcaster:string) => {
    //     socket.to(broadcaster).emit('media:peerDisconnect', socket.id);
    // });
});

