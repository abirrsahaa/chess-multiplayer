import  { useEffect, useState } from 'react'
import { useSocket } from '../utils/useSocket'
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import Chessboard from '../components/Chessboard';

import axios from 'axios';
import { UserStore } from '../zustand/user';
import { GameStore } from '../zustand/game';


// !now the task is to establish the socket connection 
// !and get the board configuration to place our keys then we can add interactivity 

// !abir start writing clean code from now 
// !start to identify the areas how you can make your code more modular 

const Arena = () => {

  const {id,email,setting}=UserStore();
  const [player_email,setPlayerEmail]=useState<string>("");

  const {settingGame,player_color,game_id,settingColor,settingPlayerEmail}=GameStore();

  useEffect(()=>{
    async function getUserDetails(){
      const data=await axios.get("http://localhost:8080/userdetails",{
        withCredentials:true
      });

      console.log("the data is ",data.data);
      setting(Number(data?.data.id),data.data.email);
      setPlayerEmail(data.data.email);
      
    }
    getUserDetails();
  },[])

  const socket=useSocket();
  const[chess,setChess]=useState<Chess>(new Chess());
  const [board,setBoard]=useState<({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)[][]>(chess.board());

  useEffect(()=>{

    if(socket==null)return;

    console.log(" i am the useEffect in arena and i got called")

    socket.onmessage=(e)=>{
      console.log("the message received is ",e);
      const data=JSON.parse(e.data);
      // data is of the type that also depemds on which message it is 
      // so i will have to make a switch case here
      switch(data.message){
        case "INIT_GAME":
          console.log("the game is initiated and the color is ",data.color);
          alert(data.color);
          console.log("the email here before is ",email);
          if(data.color=="w"){
            settingColor("w");
          }else{
            settingColor("b");
          }
          settingGame(Number(data.gameId));
          setChess(new Chess());
          setBoard(chess.board());
          break;
        case "MOVE":
          console.log("the move is ",data.move);
          // !need to add validations here if the move is valid or not need to add toast or confetti for it 
          chess.move(data.move);
          setBoard(chess.board());
          break;
          case "INVALID_TURN":
            console.log("this is not your turn");
            alert(data.bhabna);
            break;
        case "GAME_OVER":
          console.log("the game is over and the result is ",data.result);
          break;
      }

    }

  },[socket,chess])


  return (
    <div className='h-[100vh] w-[100vw] bg-stone-700 flex justify-center items-center'>
    {email!="" && JSON.stringify(email)} 
    {player_color!="" && JSON.stringify(player_color)}
    {game_id!="" && JSON.stringify(game_id)}
    
    <div className='h-[95%] w-[90%]  rounded-xl grid grid-rows-1 grid-cols-2 mx-auto my-auto '>

      {/* !make the below fucking stuff a fucking component  */}
     <div className=' flex items-center justify-center '>

       <div className='h-full w-[90%] rounded-xl  bg-green-500 '>
       {socket&& <Chessboard board={board} socket={socket} chess={chess} setBoard={setBoard} />}
       </div>

     </div>
     <div className=' flex flex-col items-center justify-center'>
     
       <div className='h-[50%] w-full flex flex-col justify-start items-center '>
         <button className='h-[30%] w-[60%] font-bold text-center text-3xl tracking-wide text-white bg-lime-400 rounded-2xl hover:bg-lime-500' onClick={()=>{
          socket?.send(
            JSON.stringify({message:"INIT_GAME",id:id})
         );
         if(player_email!==""){
            settingPlayerEmail(player_email);
            console.log("the player email is ",player_email); 
         }
         }}>Play Online</button>
       </div>

     </div>

    </div>
   </div>
  )
}

export default Arena