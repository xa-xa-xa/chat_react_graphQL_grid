const express = require('express');
const socket = require('socket.io');
const http = require('http');

const { getUser, getUsersInRoom, addUser, removeUser } = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);

// Socket
const io = socket(server);
io.on('connection', socket => {
  // console.log('we have new socket connection');

  //* join user to conversation
  socket.on('join', ({ name, room }, callback) => {
    console.log('name:', name, '; room:', room);
    //add user
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) {
      callback(error);
    }

    // notify user and others
    // console.log(`${user.name}, welcome to the "${user.room}" chat.`);
    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to the "${user.room}" chat.`
    });
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: `${user.name}, has join the conversation.`
    });
    //join
    socket.join(user.room);

    callback();
  });

  //* sending messages
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  //disconnect
  socket.on('disconnect', () => console.log('user had left!'));
});

//
app.use(router);

server.listen(PORT, console.log('### Server is running on port:' + PORT));
