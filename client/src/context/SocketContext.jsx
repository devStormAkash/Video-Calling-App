import { useMemo } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";
import {useState} from "react";

const socketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(socketContext);
  return socket;
};


export const SocketProvider = (props) => {
  const socket = useMemo(()=>io('localhost:3000'),[])
  return (
    <socketContext.Provider value={socket}>
      {props.children}
    </socketContext.Provider>
  )
}