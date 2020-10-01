const express = require('express')
require('./db/mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const userRouter = require('./router/user')

const app = express()
const port = process.env.PORT

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());
app.use(cors());

app.use(express.json())
// app.use(express.multipart())
app.use(userRouter)


app.listen(port, ()=>{
    console.log('server is running on port '+ port)
})