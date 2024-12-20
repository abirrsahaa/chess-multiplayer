import { Chess} from "chess.js";
import { prisma } from ".";
interface Move{
    from:string;
    to:string;
    promotion?:string;
}

export class Game{
    
    public player1:WebSocket | null=null;
    public player2:WebSocket | null=null;
    public Board:Chess;
    public moveCount:number=0;
    public moves:Move[];
    public startTime:Date;

    constructor(player1:WebSocket|null,player2:WebSocket|null){
        this.player1=player1;
        this.player2=player2;
        this.Board=new Chess();
        this.moves=[];
        this.startTime=new Date();
    }

   async makeMove(socket:WebSocket,move:{
        from:string;
        to:string;
        promotion?:string;
    },email:string,gameId:string){
        // we are using the library which will internally 
        // check if the move is valid or not
        // if the move is valid then we will make the move
        // and also update the board
        // and also send the updated board to the other player
        // !modify this logic to indentify which player is playing
        // !check for player1

        console.log("the move is ",move);
        console.log("the email is ",email);
        console.log("the game id is ",gameId);
        
        if(this.moveCount%2==0 && this.player1==socket){
            // !this means until now even no of steps have been done so this will be the odd step 
            // !think as this is the first step 
            // !in my code the first step whould be done by second player as he has got white 
            // !i will be sending the player 1 that this is not your turn so you cannot perform this mnove 
            this.player1.send(JSON.stringify({
                message:"INVALID_TURN",
                bhabna:"this is not your turn"
            }))
            return;
        }
        // !check for player2
        if(this.moveCount%2==1 && this.player2==socket){
            this.player2.send(JSON.stringify({
                message:"INVALID_TURN",
                bhabna:"this is not your turn"
            }))
            return;
        }

        try {

            console.log("the content here is ",this.Board);

            this.Board.move(move);
            
            
        } catch (error) {

            console.log("error occured while making the move",error);
            return;
            
        }


        // check if the game is over 
        if(this.Board.isGameOver()){
            this.player1?.send(JSON.stringify({
                message:"GAME_OVER",
                result:this.Board.turn()=="w"?"BLACK":"WHITE"
            }));
        }


        // !first save the move to the move db 
        // idhar toh mujhe pata bhi hai konsa player hai but thik hai koi na i have the email
        // !i have the email so i can get the player id from the email

        const user=await prisma.user.findUnique({
            where:{
                email:email
            }
        })

        console.log("the user is ",user);

        const moveDb=await prisma.move.create({
            data:{
                gameId:Number(gameId),
                playerId:Number(user?.id),
                from:move.from,
                to:move.to,
            }
        })

        console.log("the move saved is ",moveDb);


        // here i am sending the move which will perform the move in the frontend 
        // send the move to the other player
        if(this.player1==socket){
            this.player2?.send(JSON.stringify({
                message:"MOVE",
                move:move
            }));
        }
        if(this.player2==socket){
            this.player1?.send(JSON.stringify({
                message:"MOVE",
                move:move
            }));
        }




        this.moveCount++;
    }

}