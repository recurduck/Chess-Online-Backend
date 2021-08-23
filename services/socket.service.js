const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*'
        }
    });

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    
    gIo.on('connection', socket => {
        console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        socket.on('disconnect', socket => {
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('editor id', roomId => {
            if (socket.roomId === roomId) return;
            if (socket.roomId) {
                socket.leave(socket.roomId)
            }
            socket.join(roomId)
            socket.roomId = roomId
            console.log('roomId', roomId);
        })
        socket.on('update wap', (wap) => {
            socket.broadcast.to(socket.roomId).emit('update wap', wap)
        })
        socket.on('mouse move', pos => {
            socket.broadcast.to(socket.roomId).emit('mouse_position_update', pos);
        });
        socket.on('change wap', wap => {
            console.log('wap', wap);
            // emits to all sockets:
            // gIo.emit('chat addwap', wap)
            // emits only to sockets in the same room
            // gIo.to(socket.myTopic).emit('update wap', wap)
        })
        
        socket.on('store update', msg => {
            gIo.broadcast.emit('notify users', msg)
        })
        socket.on('user-watch', userId => {
            socket.join(userId)
        })

    })
}

function emitToAll({ type, data, room = null }) {
    if (room) gIo.to(room).emit(type, data)
    else gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    emitToAll,
    broadcast,
}



