import { randomUUID } from "crypto";
import { Socket } from "socket.io";
import { isClassStaticBlockDeclaration } from "typescript";

export default class Room
{
    private roomID:string;
    private socketIDs:string[];

    constructor() {
        this.roomID = randomUUID();
        this.socketIDs = [];
    }
    private socketOnMediaBroadcast(socket:Socket) {
        socket.broadcast.to(this.socketIDs).emit('media:broadcast', socket.id);
    }

    join(socket:Socket) {
        socket.emit('media:broadcasters', this.socketIDs.filter(id => id != socket.id));
        socket.on('media:broadcast', this.socketOnMediaBroadcast.bind(this, socket));
        
        this.socketIDs.push(socket.id);
        socket.on('disconnect', () => {
            this.socketIDs.splice(this.socketIDs.indexOf(socket.id), 1);
        });
    }
}