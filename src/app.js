const express = require('express')
require('./db/mongoose')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const userRouter = require('./routers/user')
// const roomRouter = require('./routers/room')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

//socket.emit - send event to this specific client
//io.emit - send event to all clients connected
//socket.broadcast.emit - send event to all clients excluding this specific
//Rooms: io.to.emit - emits event to specific room
//       socket.broadcast.to(_roomname).emit - specific room, excluding this user

io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('spreadMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, { latitude , longitude}))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

app.use(express.json())
app.use(userRouter)
// app.use(roomRouter)

app.get('', (req, res) => {
    res.render('index', {
        title:'Chat app',
        name:'Ido Hai'
    })
})

module.exports = server