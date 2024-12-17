import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./constants";



export class GameManager {
    // pehle iske bhi attributes and methods define karne hai 
    // and then isko use karna hai
    public pendingPlayer:WebSocket | null ;
    public Games:Game[];
    private users:WebSocket[];

    constructor(){
        this.pendingPlayer=null;
        this.Games=[];
        this.users=[];
    }

    addUser(socket:WebSocket){
        this.users.push(socket);
        this.addHandlers(socket);
    }

    private addHandlers(socket:WebSocket){
        socket.on("message",(data:any)=>{
            const message=JSON.parse(data);
            console.log("the parsed data from the web socket is ",message);
            if(message.message==INIT_GAME){
                if(this.pendingPlayer==null){
                    this.pendingPlayer=socket;
                }else{
                    console.log("idhar toh naya game initiate karna padega re baba ")
                    // !new game initiate karna padega
                    //@ts-ignore
                    const game=new Game(this.pendingPlayer,socket);
                    console.log("new game initiated and the game is ",game);
                    // !je pore connect hoise hai white and ager ta black 
                    socket.send(JSON.stringify({
                        message:message.message,
                        color:"w"
                    }));
                    this.pendingPlayer.send(JSON.stringify({
                        message:message.message,
                        color:"b"
                    }));
                    this.Games.push(game);
                    this.pendingPlayer=null;
                    
                }
            }
            else if(message.message==MOVE){
                // aikhane obviously just akta function call koro jeta game r property 
                //@ts-ignore
                const game=this.Games.find((game)=>game.player1==socket||game.player2==socket);
                if(game){
                    //@ts-ignore
                    game.makeMove(socket,message.move);
                }
            }
        })
    }


}