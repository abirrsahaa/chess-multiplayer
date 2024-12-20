"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const constants_1 = require("./constants");
const _1 = require(".");
class GameManager {
    constructor() {
        this.pendingPlayer = null;
        this.Games = [];
        this.users = [];
        this.pendingPlayerId = undefined;
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandlers(socket);
    }
    addHandlers(socket) {
        socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            const message = JSON.parse(data);
            console.log("the parsed data from the web socket is ", message);
            if (message.message == constants_1.INIT_GAME) {
                if (this.pendingPlayer == null) {
                    this.pendingPlayer = socket;
                    // !check if i can use socket id ,,, and can i regenerate a socket connection with socket id 
                    this.pendingPlayerId = message.id;
                }
                else {
                    console.log("idhar toh naya game initiate karna padega re baba ");
                    // !new game initiate karna padega
                    //@ts-ignore
                    const game = new Game_1.Game(this.pendingPlayer, socket);
                    // !game db mai entry create karo
                    const GameBana = yield _1.prisma.game.create({
                        data: {
                            player1Id: Number(message.id),
                            player1_colour: "w",
                            player2Id: Number(this.pendingPlayerId), // Ensure player2Id is either a number or null
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
                    console.log("new game initiated and the game is ", game);
                    // !je pore connect hoise hai white and ager ta black 
                    socket.send(JSON.stringify({
                        message: message.message,
                        color: "w",
                        gameId: GameBana.id
                    }));
                    this.pendingPlayer.send(JSON.stringify({
                        message: message.message,
                        color: "b",
                        gameId: GameBana.id
                    }));
                    this.Games.push(game);
                    this.pendingPlayer = null;
                    this.pendingPlayerId = undefined;
                }
            }
            else if (message.message == constants_1.MOVE) {
                // aikhane obviously just akta function call koro jeta game r property 
                //@ts-ignore
                const game = this.Games.find((game) => game.player1 == socket || game.player2 == socket);
                if (game) {
                    console.log("the message is ", message);
                    //@ts-ignore
                    game.makeMove(socket, message.move, message.email, message.gameId);
                }
            }
        }));
    }
}
exports.GameManager = GameManager;
