import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./constants";
import { prisma } from ".";




export class GameManager {
    // pehle iske bhi attributes and methods define karne hai 
    // and then isko use karna hai
    public pendingPlayer:WebSocket | null ;
    public Games:Game[];
    private users:WebSocket[];
    public pendingPlayerId:number| undefined ;

    constructor(){
        this.pendingPlayer=null;
        this.Games=[];
        this.users=[];
        this.pendingPlayerId=undefined;
    }

    addUser(socket:WebSocket){
        this.users.push(socket);
        this.addHandlers(socket);
    }

    private addHandlers(socket:WebSocket){
        socket.on("message",async (data:any)=>{
            const message=JSON.parse(data);
            console.log("the parsed data from the web socket is ",message);
            if(message.message==INIT_GAME){
                if(this.pendingPlayer==null){
                    this.pendingPlayer=socket;
                    // !check if i can use socket id ,,, and can i regenerate a socket connection with socket id 
                    this.pendingPlayerId=message.id;
                    
                }else{
                    console.log("idhar toh naya game initiate karna padega re baba ")
                    // !new game initiate karna padega
                    //@ts-ignore
                    const game=new Game(this.pendingPlayer,socket);
                    // !game db mai entry create karo

                    const GameBana=await prisma.game.create({
                        data: {
                          player1Id:Number( message.id),
                          player1_colour: "w",
                          player2Id: Number(this.pendingPlayerId)  , // Ensure player2Id is either a number or null
                          player2_colour: "b",
                          board: JSON.stringify(game.Board),
                          moveCount: 0,
                          moves: {
                            create: [] // Initialize moves as an empty array
                          },
                          startTime: new Date()
                        }
                      });

                    //   !send this game id to frontend but wont be a thing as i am saving it in the db also and the user db 


                      



                    console.log("new game initiated and the game is ",game);
                    // !je pore connect hoise hai white and ager ta black 
                    socket.send(JSON.stringify({
                        message:message.message,
                        color:"w",
                        gameId:GameBana.id
                    }));
                    this.pendingPlayer.send(JSON.stringify({
                        message:message.message,
                        color:"b",
                        gameId:GameBana.id
                    }));
                    this.Games.push(game);
                    this.pendingPlayer=null;
                    this.pendingPlayerId=undefined;
                    
                }
            }
            else if(message.message==MOVE){
                // aikhane obviously just akta function call koro jeta game r property 
                //@ts-ignore
                const game=this.Games.find((game)=>game.player1==socket||game.player2==socket);
                if(game){
                    
                    console.log("the message is ",message);
                    //@ts-ignore
                    game.makeMove(socket,message.move,message.email, message.gameId);
                }
            }
        })
    }


}