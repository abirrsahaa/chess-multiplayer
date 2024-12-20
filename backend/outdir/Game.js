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
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const _1 = require(".");
class Game {
    constructor(player1, player2) {
        this.player1 = null;
        this.player2 = null;
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.Board = new chess_js_1.Chess();
        this.moves = [];
        this.startTime = new Date();
    }
    makeMove(socket, move, email, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            // we are using the library which will internally 
            // check if the move is valid or not
            // if the move is valid then we will make the move
            // and also update the board
            // and also send the updated board to the other player
            // !modify this logic to indentify which player is playing
            // !check for player1
            var _a, _b, _c;
            console.log("the move is ", move);
            console.log("the email is ", email);
            console.log("the game id is ", gameId);
            if (this.moveCount % 2 == 0 && this.player1 == socket) {
                // !this means until now even no of steps have been done so this will be the odd step 
                // !think as this is the first step 
                // !in my code the first step whould be done by second player as he has got white 
                // !i will be sending the player 1 that this is not your turn so you cannot perform this mnove 
                this.player1.send(JSON.stringify({
                    message: "INVALID_TURN",
                    bhabna: "this is not your turn"
                }));
                return;
            }
            // !check for player2
            if (this.moveCount % 2 == 1 && this.player2 == socket) {
                this.player2.send(JSON.stringify({
                    message: "INVALID_TURN",
                    bhabna: "this is not your turn"
                }));
                return;
            }
            try {
                console.log("the content here is ", this.Board);
                this.Board.move(move);
            }
            catch (error) {
                console.log("error occured while making the move", error);
                return;
            }
            // check if the game is over 
            if (this.Board.isGameOver()) {
                (_a = this.player1) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                    message: "GAME_OVER",
                    result: this.Board.turn() == "w" ? "BLACK" : "WHITE"
                }));
            }
            // !first save the move to the move db 
            // idhar toh mujhe pata bhi hai konsa player hai but thik hai koi na i have the email
            // !i have the email so i can get the player id from the email
            const user = yield _1.prisma.user.findUnique({
                where: {
                    email: email
                }
            });
            console.log("the user is ", user);
            const moveDb = yield _1.prisma.move.create({
                data: {
                    gameId: Number(gameId),
                    playerId: Number(user === null || user === void 0 ? void 0 : user.id),
                    from: move.from,
                    to: move.to,
                }
            });
            console.log("the move saved is ", moveDb);
            // here i am sending the move which will perform the move in the frontend 
            // send the move to the other player
            if (this.player1 == socket) {
                (_b = this.player2) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({
                    message: "MOVE",
                    move: move
                }));
            }
            if (this.player2 == socket) {
                (_c = this.player1) === null || _c === void 0 ? void 0 : _c.send(JSON.stringify({
                    message: "MOVE",
                    move: move
                }));
            }
            this.moveCount++;
        });
    }
}
exports.Game = Game;
