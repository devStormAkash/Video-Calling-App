import React from 'react'
import { useSocket } from '../context/SocketContext'
import { useEffect, useCallback, useState , useRef} from 'react'
import ReactPlayer from 'react-player'
import PeerService from '../service/peer.js'


const VideoRoom = () => {

  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [myStream, setMyStream] = useState()
  const socket = useSocket()
  const myVideoStream = useRef(null)
  const otherVideoStream = useRef(null);

  const [remoteStream, setRemoteStream] = useState()


  const informNewUser = useCallback(
    (email, id) => {
      console.log(`${email} joined the same room with id ${id}`);
      setRemoteSocketId(id);
    },
    []
  );

  // const sendStream = useCallback(() => {
  //   for (const track of myStream.getTracks()) {
  //     PeerService.peer.addTrack(track, myStream);
  //   }
  // }, [myStream]);

  const sendStream = useCallback(() => {
    if (!myStream) {
      console.warn("⚠️ No local stream available yet!");
      return;
    }

    // Get existing senders
    const senders = PeerService.peer.getSenders();

    for (const track of myStream.getTracks()) {
      // Check if this track is already being sent
      const existingSender = senders.find((sender) => sender.track === track);

      if (!existingSender) {
        PeerService.peer.addTrack(track, myStream);
        console.log(`✅ Added ${track.kind} track`);
      } else {
        console.log(`ℹ️ ${track.kind} track already exists`);
      }
    }
  }, [myStream]);


  const handleUserCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);

    const offer = await PeerService.getOffer();
    console.log(offer);
    
    socket.emit("user:call" , {to:remoteSocketId , offer} )
    
  }, [remoteSocketId, socket]);
  



  const handleIncomingCall = useCallback(async ({ from, offer }) => {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
    setRemoteSocketId(from)
    console.log("From : ", from, "  ", "Offer : ", offer);
    const answer = await PeerService.getAnswer(offer)
    socket.emit("call:accepted", { to: from , answer })

    setTimeout(() => {
      for (const track of stream.getTracks()) {
        PeerService.peer.addTrack(track, stream);
      }
    }, 100);
    
    
  }, [remoteSocketId, socket]);

  
  const handleCallAccepted = useCallback(async ({from , answer}) => {
    await PeerService.setLocalDescription(answer);
    console.log("Call Accepted Successfully");
    setTimeout(() => {
      sendStream();
    }, 100);
  }, [])




  const handleNegoIncoming = useCallback(async({from, offer}) => {
    const answer = await PeerService.getAnswer(offer);
    socket.emit("nego:done", { to : from, answer });
  }, [socket])
  
  const handleFinalNegotiation = useCallback(async ({answer}) => {
    await PeerService.setLocalDescription(answer);
    console.log("Now video call should running......");
    
  },[])
  

  useEffect(() => {
    PeerService.peer.addEventListener('track', async(ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    })
  },[])


  useEffect(() => {
    socket.on("new:user", informNewUser);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("nego:incoming", handleNegoIncoming);
    socket.on("nego:final", handleFinalNegotiation);
    return () => {
      socket.off("new:user", informNewUser);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("nego:incoming", handleNegoIncoming);
      socket.off("nego:final", handleFinalNegotiation);
    };
  }, [
    socket,
    informNewUser,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleFinalNegotiation,
  ]);

  const handleNegotiationNeeded = useCallback(async() => {
    const offer = await PeerService.getOffer();
    socket.emit("nego:call", {to:remoteSocketId , offer})
  },[socket])

  useEffect(() => {
    PeerService.peer.addEventListener(
      "negotiationneeded",
      handleNegotiationNeeded
    );
  }, [handleNegotiationNeeded]);


  useEffect(() => {
    if (myVideoStream.current && myStream) {
      myVideoStream.current.srcObject = myStream;
    }

    if (otherVideoStream.current && remoteStream) {
      otherVideoStream.current.srcObject = remoteStream;
    }
  },[myStream , remoteStream])
  
  

  return (
    <>
      <div className="w-full h-screen bg-purple-300  flex flex-col items-center justify-start">
        <h1 className="text-5xl font-semibold text-center">Video Room</h1>
        {remoteSocketId && (
          <p className="border p-3 rounded bg-green-100 text-xl my-4 text-green-800">
            Connected Successfully
          </p>
        )}
        {!remoteSocketId && (
          <p className="border p-3 rounded bg-green-100 text-xl my-4 text-green-800">
            No user connected
          </p>
        )}
        {remoteSocketId && (
          <button
            onClick={handleUserCall}
            className="p-4 cursor-pointer transition-all duration-300 hover:bg-green-200 border-2 border-green-800 bg-green-100 rounded-md"
          >
            📞 CALL{" "}
          </button>
        )}
        {/* {myStream && (
          <button
            onClick={sendStream}
            className="p-4 mx-3 my-3 cursor-pointer transition-all duration-300 hover:bg-green-200 border-2 border-green-800 bg-green-100 rounded-md"
          >
              Send Stream{" "}
          </button>
        )} */}

        {/* {
          myStream && <ReactPlayer url={myStream} playing muted height="100px" width="200px" />
        } */}

        {myStream && (
          <>
            <h1 className="text-2xl font-semibold my-4 text-gray-500">
              My Video
            </h1>
            <div className="bg-yellow-300">
              <video
                ref={myVideoStream}
                autoPlay
                style={{ width: "400px", height: "266px", marginTop: "20px" }}
                className="border-2 border-gray-300 rounded"
              />
            </div>
          </>
        )}

        {remoteStream && (
          <>
            <h1 className="text-2xl font-semibold my-4 text-gray-500">
              Remote Video
            </h1>
            <div className="mb-10 bg-green-300">
              <video
                ref={otherVideoStream}
                autoPlay
                style={{
                  width: "400px",
                  height: "266px",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
                className="border-2 border-gray-300 rounded"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default VideoRoom
