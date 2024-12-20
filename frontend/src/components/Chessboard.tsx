import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { useEffect, useState } from 'react';
import { UserStore } from '../zustand/user';
import { GameStore } from '../zustand/game';
import axios from 'axios';


// !agar koi element hoga tohi mereko woh position milega else nahi milega 

// !do make this code modular once the code starts working 

const Chessboard = ({board,socket,chess,setBoard}:{
    board:({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket:WebSocket;
    chess:Chess;
    setBoard:(value: React.SetStateAction<({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]>) => void;
}) => {

    const {id}=UserStore();
    const {game_id,player_email,player_color}=GameStore();


    const [moves,setMoves]=useState<any[]>([]);

    const [from,setFrom]=useState<string >("");
    const [to,setTo]=useState<string >("");

    async function getting_moves(game_id:string){

        try {

            const getting=await axios.get("http://localhost:8080/movesList",{
                params:{
                    gameId:game_id
                },
                withCredentials:true
            })


            console.log("the moves received is ",getting.data.moves);

            setMoves(getting.data.moves);
            
        } catch (error) {
            console.log("error occured while getting the moves ",error);
        }

    }
    useEffect(()=>{
        if(from=="" || to==""){
            console.log("kuch to update nahi ho rha hai ");
            console.log("the from is ",from);
            console.log("the to is ",to);
            return;
        }
        console.log("the move is from ",from);
            console.log("the move is to ",to);
           
            try {
                 // !now send the move to the server
                 if(from=="" || to==""){
                    console.log("kuch to update nahi ho rha hai ");
                    console.log("the from is ",from);
                    console.log("the to is ",to);
                    return;
                 }
                //  !the frontend is able to perform both the move which should not be the case
                // !comeup with a logic to identify which player is making the move and whether the player is allowed to move that colour or not 
                // !i really need this info at a global level the player colour 

                console.log("the player email is ",player_email);   
                console.log("the game id is ",game_id);
                socket.send(JSON.stringify({
                    message:"MOVE",
                    move:{
                        from:from,
                        to:to
                    },
                    email:player_email,
                    gameId:game_id
                    
                }));
                // !reset the from and to
                
                // !khud bhi toh move perform karo and let the ui update 
                // !this is the frontend move

                // !dont you think i should be trying the move in the frontend and then we should pass it to the backend the justified move so that the testing overload gets checked in the first move as well

                chess.move({
                    from:from,
                    to:to
                });
                setBoard(chess.board());

                // !everytime a make a move i should also be rendering it 
                // !for now let it be of first principles that i am calling the db again and again 
                // !next i can be improving it in the way i can optimize the application 

                getting_moves(game_id);
                

                // !every time a move is done write the code which checks first if that move is valid or not 
                // !get the game id and the player id and then we can set the move db all set for it 

                // frontend mai thori save kar sakte hai bro??


                setFrom("");
                setTo("");

            } catch (error) {
                console.log("error occured while sending the move to the server ",error);
                
            }
        
    },[from,to])

    const handler=(square:Square|undefined,i:number,j:number)=>{
        
        console.log("the row is ",i);
        console.log("the column is ",j);
        // now lets seee if i can extract the number 
        const row_number=(8-i).toString();
        console.log("the row number in string number is ",row_number);
        const column_number=String.fromCharCode(97+j);
        console.log("the column number in string is ",column_number);
        console.log("the final naming of selected square is ",column_number+row_number);

        const actual_position=column_number+row_number;

        // !idhar dono updation ke logic mai dikkat hai 

        console.log("the square is ",square);

        if(from==""){
            // check if from has a square or not
            console.log("ami from er modhey update korte aisi")
            if(square!=undefined){
            if(chess.get(square).color!=player_color){
                console.log("laude dusro ki goti kyu chuta hai");
                return;
            }
            setFrom(actual_position);
            console.log("the from is selected");
            }else{
                console.log("bhai from ke liye goti pe click kar laudeya");
                return;
            }
        }else{
            // !to er karbar 
            console.log("ami to er modhey update korte aisi")
            if(square!=undefined){
                console.log("bhai toh kya kar raha hai khali jaga pe hi jayegi na ");
                // console.log("the square is ",square);
                // setFrom(undefined);
                // setTo(undefined);
                return;
            }else{
                console.log("to the update kortasi");
                console.log("the actual position is ",actual_position);
                setTo(actual_position); //i feel like this operation is taking time 
            }
        }


       



    }
  return (
    <div className='h-[100%] w-[100%] grid grid-rows-8 grid-cols-8'>
      {board.map((row, i) => (
        // here i would be the row number that is for me the row number would be 0 to 7 and i want 0 to be 8 so 8-0=8
        row.map((square, j) => (
            // here j would be the column number that is for me the column number would be 0 to 7 and i want it to be a to h so nothing just extract the number and add it to a 
          <div key={i * 8 + j} onClick={()=>handler(square?.square,i,j)} className={`h-full w-full flex items-center justify-center ${i % 2 === j % 2 ? 'bg-stone-500' : 'bg-stone-400'}`}>
            {square && square.type}
          </div>
        ))
      ))}
    </div>
  )
}

export default Chessboard