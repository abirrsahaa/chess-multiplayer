import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { useEffect, useState } from 'react';


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

    const [from,setFrom]=useState<string >("");
    const [to,setTo]=useState<string >("");
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
                socket.send(JSON.stringify({
                    message:"MOVE",
                    move:{
                        from:from,
                        to:to
                    }
                }));
                // !reset the from and to
                
                // !khud bhi toh move perform karo and let the ui update 
                // !this is the frontend move
                chess.move({
                    from:from,
                    to:to
                });
                setBoard(chess.board());

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