"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
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
    makeMove(socket, move) {
        // we are using the library which will internally 
        // check if the move is valid or not
        // if the move is valid then we will make the move
        // and also update the board
        // and also send the updated board to the other player
        // !modify this logic to indentify which player is playing
        // !check for player1
        var _a, _b, _c;
        if (this.moveCount % 2 == 0 && this.player1 == socket) {
            // !this means until now even no of steps have been done so this will be the odd step 
            // !think as this is the first step 
            // !in my code the first step whould be done by second player as he has got white 
            return;
        }
        // !check for player2
        if (this.moveCount % 2 == 1 && this.player2 == socket) {
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
    }
}
exports.Game = Game;
