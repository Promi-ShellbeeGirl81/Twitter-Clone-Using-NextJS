import mongoose from "mongoose";

const MONGODB_URI=process.env.MONGODB_URI;
if(!MONGODB_URI){
    throw new Error("Mongodb uri variable is not defined");
}
export default async function connectToDatabase(){
    if(mongoose.connection.readyState === 1){
        return mongoose;
    }
    const opts = {
        bufferCommands: false,
    }
    await mongoose.connect(MONGODB_URI, opts);
    return mongoose;
}