const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const { Server } = require('socket.io');
const ACTIONS = require('./actions');
const compiler = require('compilex');
const options = { stats: true };
compiler.init(options);

const server = require('http').createServer(app);
const io = new Server(server);

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on('connection', (socket) => {
  socket.on(ACTIONS.JOIN, ({ username, roomId }) => {
    userSocketMap[socket.id] = username;

    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms); //get all rooms where this socketId is present
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave(); //leaving the room
  });
});

app.post('/compile', function (req, res) {
  console.log(req.body);
  var code = req.body.code;
  var input = req.body.input;
  console.log(code);
  console.log(input);
  if (code) {
    var envData = { OS: 'linux' };  // We will address this part later
    compiler.compilePythonWithInput(envData, code, input, function (data) {
      console.log(data);  // Log the entire data object
      if (data.output) {
        res.json(data);
      } else {
        res.json({ output: 'error', data: data });  // Return data object to see the error details
      }
    });
  } else {
    res.json({ output: 'No code provided' });
  }
});
  

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log('listening on port ' + PORT));
