const socket = io('/');
const videoGrid = document.getElementById('video-grid');
// console.log(videoGrid);
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // this will answer another peer call to stream his video
    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on("user-connected", (userId) => {
        console.log("user connected...........");
        setTimeout(() => {
            connectToNewUser(userId, stream);
        }, 5000)
    })

    // message part
    // input value
    let text = $("input");

    // when press enter send message
    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            // console.log(text.val())
            socket.emit('message', text.val());
            text.val('')
        }
    });

    socket.on('createMessage', message => {
        // console.log('this is coming from server', message);
        console.log("create message", message);
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom()
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

// connection notification for new user
const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}


const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

//mute our audio
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

//stop our video
const playStop = () => {
    // console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

//socket.IO
// Socket.IO is a library that enables real-time, bidirectional
// and event-based communication between the browser and the server.
// It consists of: a Node. js server: Source | API.