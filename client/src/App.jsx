import { useState } from 'react'
import { useEffect } from 'react'
import { useSocket } from './context/SocketContext.jsx'
import {Route , Routes} from 'react-router-dom'
import Home from './pages/Home.jsx'
import VideoRoom from './pages/VideoRoom.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/video/room/:roomId' element={<VideoRoom/>} ></Route>
      </Routes>
    </>
  );
}

export default App
