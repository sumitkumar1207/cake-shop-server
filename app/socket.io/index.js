
import server from '../server';
var io = require('socket.io')(server);
var socket = null;

console.log('server :', server);

io.on('connection', function (socket) {
    console.log('a user connected');
    socket = socket;
});

export default socket
