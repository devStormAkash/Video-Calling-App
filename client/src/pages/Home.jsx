import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Home = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate()
  const socket = useSocket()
  
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log("Form Data : ", { email, room });
    navigate(`/video/room/${room}`)
    socket.emit("inform-join-room", { email, room })
    
    

  }, [email, room, socket])
  
  const handleInform = useCallback((data1, email , room) => {
    console.log(data1);

  }, [])
  
  

  useEffect(() => {
    socket.on("inform", handleInform);
    
    return () => {
      socket.off("inform", handleInform);

    }
  },[])

    return (
      <div>
        <div className="h-screen w-full bg-blue-950 flex justify-center items-center gap-4">
          <form
            onSubmit={handleSubmit}
            className="flex border rounded-xl justify-center items-start flex-col gap-y-3 px-6 py-5 bg-gray-200 mx-2.5"
          >
            <label id="email" className="font-semibold -mb-2 text-xl text-black">
              Enter your email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com..."
              className="px-3 py-2 border rounded bg-gray-300 w-full"
            />
            <label id="room" className="font-semibold -mb-2 text-xl text-black">
              Enter room ID to join
            </label>
            <input
              type="text"
              name="room"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="abc767..."
              className="px-3 py-2 border rounded bg-gray-300 w-full"
            />
            <button
              type="submit"
              className="bg-black/80 px-6 py-3 w-full rounded-md text-white font-semibold cursor-pointer hover:bg-black/90 duration-300 transition-all"
            >
              Join Video Call
            </button>
          </form>
        </div>
      </div>
    );
  }
export default Home
