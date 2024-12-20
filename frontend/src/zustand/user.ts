import {create} from "zustand";


interface UserState {
    id:number,
    email:string,
    setting:(id:number,email:string)=>void;
}


export const UserStore=create<UserState>((set)=>({
    id:0,
    email:"",
    setting:(id,email)=>set({id,email})
}))

