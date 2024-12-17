"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const ws = new ws_1.WebSocketServer({ port: 8080 });
// chalo client connection is done 
// abhi pehle sochte hai kya karna hai bohot clueless hu mai 
const gameManager = new GameManager_1.GameManager();
ws.on("connection", (socket) => {
    console.log("new client got connected");
    // !make the below code in the class itself such that the code becomes more modular 
    gameManager.addUser(socket);
    socket.on("error", (error) => {
        console.log("error occured", error.message);
    });
    // !har ak connection mai mereko agar user pending nahi hai toh usko pending mai dalna hai 
    // !and agar pending hai to let him connect  and yeh sab kuch on connection matlab main jagah pe hi hoga
    socket.send(JSON.stringify({
        message: "hey i am from the server and i am connected"
    }));
});