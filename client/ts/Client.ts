import { io } from 'socket.io-client';
import MediaEmitter from './MediaEmitter';

const socket = io();
MediaEmitter.setRTCConfiguration({
    iceServers: [{
        urls:'turn:localhost:3478',
        username:'user',
        credential:'pswd'
    }]
});

let emitters:MediaEmitter[] = [];

document.addEventListener('DOMContentLoaded', () => {
    const btnStreamCamera = document.getElementById('btnStart') as HTMLButtonElement;
    const videoSelfCamera = document.getElementById('videoCamera') as HTMLVideoElement;
    
    btnStreamCamera.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({video:true, audio:true})
            .then(stream => {
                videoSelfCamera.srcObject = stream;
                let emitter = new MediaEmitter(socket, stream);
                emitter.emit();
                emitters.push(emitter);
            });
    });
    videoSelfCamera.addEventListener('contextmenu', e => e.preventDefault());
    window.onunload = window.onbeforeunload = () => socket.close();
});
