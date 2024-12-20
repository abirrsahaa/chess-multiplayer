import {ErrorEvent, WebSocket, WebSocketServer} from "ws";
import express from "express";
import { GameManager } from "./GameManager";
import { createServer } from "http";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieparser from "cookie-parser";


dotenv.config();


const jwt_secret=process.env.JWT_SECRET;

const app=express();
const server=createServer(app);

export const prisma=new PrismaClient();

app.use(express.json());
app.use(cookieparser());
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true
    }
));




const ws= new WebSocketServer({server});

// chalo client connection is done 
// abhi pehle sochte hai kya karna hai bohot clueless hu mai 

const gameManager=new GameManager();

ws.on("connection",(socket:WebSocket)=>{
    console.log("new client got connected");
    // !make the below code in the class itself such that the code becomes more modular 
    gameManager.addUser(socket);
    socket.on("error",(error:ErrorEvent)=>{
        console.log("error occured",error.message);
    })

    // !har ak connection mai mereko agar user pending nahi hai toh usko pending mai dalna hai 
    // !and agar pending hai to let him connect  and yeh sab kuch on connection matlab main jagah pe hi hoga

    socket.send(JSON.stringify({
        message:"hey i am from the server and i am connected"
    }));

})

app.get("/",(req,res)=>{
    res.send("this is the default route of chess game ");
})

// !make sure you fix the ts error here 

//@ts-ignore
app.post("/signup",async (req,res)=>{
    try {

        const {name,email,password}=req.body;
        console.log("the name is ",name);
        console.log("the email is ",email);
        console.log("the password is ",password);

        // !apply the validations here 
        const existing =await prisma.user.findUnique({
            where:{
                email:email
            }
        }); 

        if(existing!=null){
            return res.status(400).send("user already exists you should login ");
        }

        // !hash the password 
        // !store the user in the database
        const user=await prisma.user.create({
            data:{
                name:name,
                email:email,
                password:password,
                gamesAsPlayer1: {
                    create: []
                },
                gamesAsPlayer2: {
                    create: []
                }
            }
        });

        // !creating the jwt token 
        // !send the jwt token to the user
        
        const token=  jwt.sign({
            email:email,
            id:user.id
        },jwt_secret as jwt.Secret);
        console.log("the token is ",token);

    // Set the JWT token as a cookie in the response
        if(token){
           return  res.cookie('token', token, {
            httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not accessible via JavaScript
            secure:false, // Ensures the cookie is sent only over HTTPS in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict', // Ensures the cookie is sent only to the same domain
            
      }).send("user created successfully");
    }else{
        return res.status(500).send("error occured while creating the jwt");
    }

        
        
    } catch (error) {
        console.log("error occured while signing up ",error);
        return res.status(500).send("error occured while signing up");
        
    }
})

// !fix the typescript errors 
// @ts-ignore
app.get("/userdetails",async (req,res)=>{
    try {

        const token = req.cookies.token;
        console.log("the token is ",token);
        if(token==null){
            return res.status(400).send("no token found ");
        }
        const verified=jwt.verify(token,jwt_secret as jwt.Secret);
        if(verified){
            return res.status(200).json({
                //@ts-ignore
                email:verified.email,
                //@ts-ignore
                id:verified.id
            })
        }else{
            return res.status(400).send("token is invalid")
        }

        
    } catch (error) {

        console.log("error occured while fetching the user details ",error);
        return res.status(500).send("error occured while fetching the user details ");
        
    }
})


// @ts-ignore
app.get("/movesList",async (req,res)=>{
    try {

        const {gameId}=req.query;

        console.log("the query is ",req.query);

        console.log("the game id is ",gameId);

        const moves=await prisma.game.findUnique({
            where:{
                id:Number(gameId)
            },
            include:{
                moves:{
                    orderBy:{
                        doneAt:"desc"
                    }
                }
            }
        })

        return res.status(200).json(moves);
        
    } catch (error) {
        console.log("error occured while fetching the moves list ",error);
        return res.status(500).send("error occured while fetching the moves list ");
    }
})

//@ts-ignore
app.post("/login",async (req,res)=>{
    try {

        const {email,password}=req.body;
        console.log("the email is ",email);
        console.log("the password is ",password);

        const user=await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(user==null){
            return res.status(400).send("user does not exist please signup ");
        }

        if(password!=user.password){
            return res.status(400).send("password is incorrect ");
        }   

        // !creating the jwt token
        // !send the jwt token to the user
        const token=  jwt.sign({
            email:email,
            id:user.id
        },jwt_secret as jwt.Secret);

        console.log("the token is ",token);

    // Set the JWT token as a cookie in the response
        if(token){
            return res.cookie('token', token, {
            httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not accessible via JavaScript
            secure: false, // Ensures the cookie is sent only over HTTPS in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict', // Ensures the cookie is sent only to the same domain
        }).send("user logged in successfully ");

        
    }else {
        return res.status(500).send("error occured while logging in");
    }
        
    } catch (error) {
        console.log("error occured while logging in ",error);
        return res.status(500).send("error occured while logging in");
        
    }
})

server.listen(8080,()=>{
    console.log("server started at 8080");
})