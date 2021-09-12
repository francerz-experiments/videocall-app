import { Socket } from 'socket.io-client';

export default class MediaEmitter
{
    static rtcConfig:RTCConfiguration;

    static setRTCConfiguration(config:RTCConfiguration) {
        this.rtcConfig = config;
    }

    private peerConnections = new Map<string, RTCPeerConnection>();
    constructor(
        private socket:Socket,
        private stream:MediaStream
    ) {
        socket.on('watcher', this.socketOnWatcher.bind(this));
        socket.on('answer', this.socketOnAnswer.bind(this));
        socket.on('candidate', this.socketOnCandidate.bind(this));
        socket.on('disconnectPeer', this.socketOnDisconnectPeer.bind(this));
    }

    private socketOnWatcher(id:string) {
        const peerConnection = new RTCPeerConnection(MediaEmitter.rtcConfig);
        this.peerConnections.set(id, peerConnection);

        this.stream.getTracks().forEach(
            track => peerConnection.addTrack(track, this.stream)
        );
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.socket.emit('candidate', id, peerConnection.localDescription);
            }
        };

        peerConnection.createOffer()
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => this.socket.emit('offer', id, peerConnection.localDescription));
    }

    private socketOnAnswer(id:string, description:RTCSessionDescription) {
        this.peerConnections.get(id)?.setRemoteDescription(description);
    }

    private socketOnCandidate(id:string, candidate:RTCIceCandidateInit) {
        this.peerConnections.get(id)?.addIceCandidate(new RTCIceCandidate(candidate))
    }

    private socketOnDisconnectPeer(id:string) {
        this.peerConnections.get(id)?.close();
        this.peerConnections.delete(id);
    }

    emit() {
        this.socket.emit('broadcast');
    }
}