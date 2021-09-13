import { Socket } from "socket.io";

export default class SocketMediaHandler
{
    static handle(socket:Socket) {
        socket.on('media:watch', this.onWatch.bind(this, socket));
        socket.on('media:offer', this.onOffer.bind(this, socket));
        socket.on('media:answer', this.onAnswer.bind(this, socket));
        socket.on('media:candidate', this.onCandidate.bind(this, socket));

        socket.on('disconnect', () => console.log(`Socket ${socket.id} disconnected.`));
        console.log(`Socket ${socket.id} connect.`);
    }

    private static onWatch(socket:Socket, emitterID:string) {
        console.log(`media:watch: ${socket.id} -> ${emitterID}`);
        socket.to(emitterID).emit('media:watch', socket.id);
    }
    private static onOffer(socket:Socket, watcherID:string, offer:RTCSessionDescription) {
        console.log(`media:offer: ${socket.id} -> ${watcherID}`);
        socket.to(watcherID).emit('media:offer', socket.id, offer);
    }
    private static onAnswer(socket:Socket, emitterID:string, answer:RTCSessionDescription) {
        console.log(`media:answer: ${socket.id} -> ${emitterID}`);
        socket.to(emitterID).emit('media:answer', socket.id, answer);
    }
    private static onCandidate(socket:Socket, peerID:string, candidate:RTCIceCandidateInit) {
        socket.to(peerID).emit('media:candidate', socket.id, candidate);
    }
}