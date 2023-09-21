import mongoose from "mongoose";

mongoose.connect('mongodb://0.0.0.0:27017/BotTelegarm')
.then(() => console.log('conect to db successfully'))
.catch(() => console.log('error conect to db'))