import { useEffect, useState } from "react";



export const useSocket=()=>{

    const [socket,setSocket]=useState<WebSocket | null>(null)
     useEffect(()=>{
       // here i need to connect to the socket 
       const ws=new WebSocket('ws://localhost:8080');
       if(ws){
         setSocket(ws);
         ws.onopen=()=>{
           console.log("connection established");
        
          
         }
   
         ws.onclose=()=>{
           setSocket(null);
           console.log("connection closed");
         }
   
         ws.onmessage=(e)=>{
           console.log("the message received is ",e);
         }
   
         return ()=>{
           ws.close();
         }
       }
     },[])


     return socket;
   
}