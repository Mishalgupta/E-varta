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

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/create-room/', (req, res) => {
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
        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    })
})



server.listen(process.env.PORT || 3030)

//WebRtc:
//it is free open source project something that connect two peers and enable them to share audio & video.
//WebRTC (Web Real-Time Communication) is a technology which enables Web applications and
//sites to capture and optionally stream audio and/or video media,
//as well as to exchange arbitrary data between browsers without requiring an intermediary.
// .............................................................
//uuid:
//it is used to get the unique id for different users, this generates random unique id for the rooms.
// .............................................................
//Peers.js:
//PeerJS simplifies WebRTC peer-to-peer data, video, and audio calls.
// .............................................................
//socket.IO:
//Socket.IO is a library that enables real-time, bidirectional
//and event-based communication between the browser and the server.
//It consists of: a Node. js server: Source | API.
//a socket.io server will attach to an HTTP server so it can serve its own client code
//through /socket.io/socket.io.js .
// .............................................................
//EJS:
//embeded Js, it is used to pass varibles in html from backend to frontend.
