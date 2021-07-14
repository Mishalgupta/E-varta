const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

//server for one to one connection
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        // console.log("joined room");
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message);
        })
    })
})



server.listen(3030);

//WebRtc:
//it is free open source project somet hing that connect two peers and enable them to share audoio & video.
//uuid:
//it is used to get the unique id for different users, this generates random unique id for the rooms.
//Peers.js
//PeerJS simplifies WebRTC peer-to-peer data, video, and audio calls.