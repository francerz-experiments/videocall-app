import { Socket } from 'socket.io-client';

export default class MediaWatcher
{
    private peerConnections = new Map<string, RTCPeerConnection>();
    private stream:MediaStream;
    onstream:CallableFunction = undefined;

    constructor(
        private socket:Socket,
        private rtcConfig:RTCConfiguration
    ) {
        socket.on('media:broadcasters', this.socketOnBroadcasters.bind(this));
        socket.on('media:broadcast', this.socketOnBroadcast.bind(this));
        socket.on('media:candidate', this.socketOnCandidate.bind(this));
        socket.on('media:offer', this.socketOnOffer.bind(this));
    }
    private socketOnBroadcasters(broadcasters:string[]) {
        broadcasters.forEach(id => this.socket.emit('media:watch', id));
    }
    private socketOnBroadcast(emitterID:string) {
        this.socket.emit('media:watch', emitterID);
    }
    private socketOnCandidate(peerID:string, candidate:RTCIceCandidateInit) {
        this.peerConnections.get(peerID)
            ?.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error(e));
    }
    private socketOnOffer(emitterID:string, description:RTCSessionDescription) {
        let peerConnection = new RTCPeerConnection(this.rtcConfig);

        peerConnection.ontrack = event => {
            console.log('peerConnection.ontrack', {track:event.track});

            let stream = event.streams[0];
            if (this.stream && this.stream.id === stream.id) return;
            this.stream = stream;
            if (this.onstream) {
                this.onstream(this.stream);
            }
        }
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.socket.emit('media:candidate', emitterID, event.candidate);
            }
        }
        peerConnection
            .setRemoteDescription(description)
            .then(() => peerConnection.createAnswer())
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => this.socket.emit('media:answer', emitterID, peerConnection.localDescription));
    }
}