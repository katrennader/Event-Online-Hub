require("dotenv").config()
const express = require("express")
const app = express();
const Port = process.env.PORT || 5000
const connectDB = require('./DB/connect')
const router = require('./routes/auth')
const RoleRouter = require('./routes/role')
const adminRouter = require('./routes/admin')
const organizerRouter = require('./routes/organizer')
const attendeeRouter = require('./routes/attendee')
const path = require('path');




// middleware
app.use(express.json()) // to have access on request body


// routes 
app.use("/api/auth",router)
app.use("/api/users/admin", adminRouter)
app.use("/api/users/organizer", organizerRouter)
app.use("/api/users/attendee", attendeeRouter)
// app.use("/api/users", RoleRouter)



app.use(express.static(path.join(__dirname, 'public')));

//  start server (listen)
const start = async()=>{
   try {
    await connectDB(process.env.MONGO_URI)
    console.log("Database connect")
    app.listen(Port, ()=>{
        console.log(`server is running at port ${Port}`)
    })
   } catch (error) {
    console.log("DateBase faild to connect", error);
   }
    
}

start()

