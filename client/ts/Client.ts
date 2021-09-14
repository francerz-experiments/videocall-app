import { io } from 'socket.io-client';
import MediaEmitter from './MediaEmitter';
import MediaWatcher from './MediaWatcher';

const socket = io(document.location.origin);
const rtcConfig:RTCConfiguration = {
    iceServers: [{
        urls: `turn:numb.viagenie.ca`,
        username: 'webrtc@live.com',
        credential: 'muazkh'
    }]
};

document.addEventListener('DOMContentLoaded', () => {
    let listVideos = document.getElementById('listVideos') as HTMLUListElement;
    
    const mediaWatcher = new MediaWatcher(socket, rtcConfig);
    mediaWatcher.onstream = (stream:MediaStream) => {
        console.log('mediaWatcher.onstream', {stream});
        let video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.srcObject = stream;
        listVideos.append(video);
    };
    window.onunload = window.onbeforeunload = () => { socket.close() };
});

document.addEventListener('DOMContentLoaded', () => {
    const btnStartUserMedia = document.getElementById('btnStartUserMedia') as HTMLButtonElement;
    let listVideos = document.getElementById('listVideos') as HTMLUListElement;

    btnStartUserMedia.addEventListener('click', () => {
        let video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        listVideos.append(video);
        navigator.mediaDevices.getUserMedia({audio:true, video:true})
            .then(stream => {
                video.srcObject = stream;
                let emitter = new MediaEmitter(socket, stream, rtcConfig);
                emitter.emit();
            });
    });
});