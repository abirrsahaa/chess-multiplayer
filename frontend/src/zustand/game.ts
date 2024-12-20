import {create} from "zustand";

interface GameState{
    player_email:string;
    player_color:string;
    game_id:number;
    settingGame:(game_id:number)=>void;
    settingColor:(color:string)=>void;
    settingPlayerEmail:(email:string)=>void;
}

export const GameStore=create<GameState>((set)=>({
    player_email:"",
    player_color:"",
    game_id:0,
    settingGame:(game_id)=>set({game_id}),
    settingColor:(color)=>set({player_color:color}),
    settingPlayerEmail:(email)=>set({player_email:email})
}))