import { Socket } from 'socket.io-client';

export default class MediaEmitter
{
    private peerConnections = new Map<string, RTCPeerConnection>();
    constructor(
        private socket:Socket,
        private stream:MediaStream,
        private rtcConfig?:RTCConfiguration
    ) {
        socket.on('media:watch', this.socketOnWatch.bind(this));
        socket.on('media:answer', this.socketOnAnswer.bind(this));
        socket.on('media:candidate', this.socketOnCandidate.bind(this));
        socket.on('media:disconnectPeer', this.socketOnDisconnectPeer.bind(this));
    }

    private socketOnWatch(watcherID:string) {
        console.log(`Create peerConnection(${watcherID})`);
        let peerConnection = new RTCPeerConnection(this.rtcConfig);

        console.log('peerConnections.set()');
        this.peerConnections.set(watcherID, peerConnection);

        console.log('peerConnection.addTrack()')
        this.stream.getTracks().forEach(
            track => peerConnection.addTrack(track, this.stream)
        );

        console.log('peerConnection.onicecandidate');
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.socket.emit('media:candidate', watcherID, event.candidate);
                console.log('media:candidate', {watcherID, description: event.candidate});
            }
        };

        console.log('peerConnection.createOffer()');
        peerConnection.createOffer()
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                this.socket.emit('media:offer', watcherID, peerConnection.localDescription);
                console.log('media:offer', { watcherID, description: peerConnection.localDescription });
            });
    }

    private socketOnAnswer(watcherID:string, description:RTCSessionDescription) {
        this.peerConnections.get(watcherID)?.setRemoteDescription(description);
        console.log('media:answer', { watcherID, description });
    }

    private socketOnCandidate(watcherID:string, candidate:RTCIceCandidate) {
        this.peerConnections.get(watcherID)?.addIceCandidate(candidate)
        console.log('watch:candidate', {watcherID, candidate});
    }

    private socketOnDisconnectPeer(peerID:string) {
        this.peerConnections.get(peerID)?.close();
        this.peerConnections.delete(peerID);
    }

    emit() {
        this.socket.emit('media:broadcast');
    }
}