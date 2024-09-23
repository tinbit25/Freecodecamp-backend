let express = require('express');
const bodyParser = require('body-parser');

let app = express();
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }))

console.log("Hello World")
// app.get("/",function(req,res){
//     res.send("Hello Express")
// })
app.use((req,res,next)=>{
    method=req.method
    path=req.path
    ip=req.ip
    console.log(`${method} ${path} - ${ip}`)
    next()
    

})
app.get('/now',(req,res,next)=>{
    req.time=new Date().toString()
    next()}
    ,
    (req,res)=>{
        res.json({time:req.time})
    
})
app.use("/public",express.static(__dirname+"/public"))   

app.get("/",function(req,res){
    const absolutePath=__dirname+"/views/index.html"
    res.sendFile(absolutePath)
})

app.get("/json",function(req,res){
    const messagestyle=process.env.MESSAGE_STYLE 
    const message="Hello json"
    if(messagestyle=="uppercase"){
        res.json({"message": message.toUpperCase()})
    }
    else{
        res.json({"message":message})
    }
    
   
})
app.get('/:word/echo',(req,res)=>{
    const word=req.params.word
    res.json({echo:word})
})
app.route('/name')
    .get((req,res)=>
{
    const firstname=req.query.first
    const lastname=req.query.last
res.json({name:`${firstname} ${lastname}`})
})
.post((req,res)=>{
    const firstname=req.body.first
    const lastname=req.body.last
res.json({name:`${firstname} ${lastname}`})
})




 module.exports = app;
