import express from 'express'
import { Server } from 'socket.io'
import {createServer} from 'http'
import { Socket } from 'dgram'

const app = express()
const expressServer = createServer(app)

const io = new Server(expressServer, {
  cors:true
})

const emailTosocketId = new Map()
const socketIdToemail = new Map();


io.on('connection', (socket) => {
  console.log("Client connected with id ", socket.id);
  socket.on("inform-join-room", ({ email, room }) => {
    console.log("User Data : ", email, " ", room);
    socketIdToemail.set(socket.id , email)
    emailTosocketId.set(email , socket.id);
    socket.broadcast.emit('new:user', email , socket.id)
    socket.join(room)
    io.to(socket.id).emit("inform" , "You make successful connection with server" , email , room)
    
  })


  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming-call" , {from:socket.id , offer})
  })

  socket.on("call:accepted" , ({ to , answer}) => {
    io.to(to).emit("call:accepted" , {from : socket.id , answer})
  })


  socket.on("nego:call", ({ to, offer }) => {
    io.to(to).emit("nego:incoming" , {from:socket.id , offer })
  })
  
  socket.on("nego:done", ({ to, answer }) => {
    io.to(to).emit("nego:final", { from: socket.id, answer });
  })
  
})

app.get("/", (req, res) => {
  res.send("Server is live now");
});

expressServer.listen(3000, () => {
  console.log("Server is running at the port : ", 3000);
  
})