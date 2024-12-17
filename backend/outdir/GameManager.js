"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const constants_1 = require("./constants");
class GameManager {
    constructor() {
        this.pendingPlayer = null;
        this.Games = [];
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandlers(socket);
    }
    addHandlers(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data);
            console.log("the parsed data from the web socket is ", message);
            if (message.message == constants_1.INIT_GAME) {
                if (this.pendingPlayer == null) {
                    this.pendingPlayer = socket;
                }
                else {
                    console.log("idhar toh naya game initiate karna padega re baba ");
                    // !new game initiate karna padega
                    //@ts-ignore
                    const game = new Game_1.Game(this.pendingPlayer, socket);
                    console.log("new game initiated and the game is ", game);
                    // !je pore connect hoise hai white and ager ta black 
                    socket.send(JSON.stringify({
                        message: message.message,
                        color: "w"
                    }));
                    this.pendingPlayer.send(JSON.stringify({
                        message: message.message,
                        color: "b"
                    }));
                    this.Games.push(game);
                    this.pendingPlayer = null;
                }
            }
            else if (message.message == constants_1.MOVE) {
                // aikhane obviously just akta function call koro jeta game r property 
                //@ts-ignore
                const game = this.Games.find((game) => game.player1 == socket || game.player2 == socket);
                if (game) {
                    //@ts-ignore
                    game.makeMove(socket, message.move);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
