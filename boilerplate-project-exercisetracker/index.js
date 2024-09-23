const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  duration: Number,
  date: String,
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);


// Create a new user
app.post('/api/users',async(req,res)=>{
  try {
    const newUser=new User({username:req.body.username})
    const savedUser=await newUser.save()
    res.json({username:savedUser.username,_id:savedUser._id})
    
  } catch (error) {
    res.status(400).json({error:err.message})
  }

})

// Get all users
app.get('api/users/:_id/exercises',async(req,res)=>{
  try {
    const users=await User.find()
    res.json(users)
    
  } catch (error) {
    res.status(400).json({error:err.message})
  }
})
//Add exercise to user
app.post('api/users/:_id/exercises',async(req,res)=>{
  try {
    const user=await User.findById(req.params._id)
    if(!user) return res.status(400).json({error:'user not found'})
  
      const { description, duration, date } = req.body;
      const exerciseDate=date?new Date(date).toDateString:new Date().toDateString
  
    const newExercise=new Exercise({
      userId:user._id,
      description,
      duration,
      date:exerciseDate,

    })
    const savedExercise=await newExercise.save()
  res.json({
    username:user.username,
    description:savedExercise.description,
    duration:savedExercise.duration,
    date:savedExercise.date,
    _id:savedExercise._id,
  })
  
    } catch (error) {
      res.status(400).json({ error: err.message });
  }
})
app.get('/api/users/:_id/logs',async(req,res)=>{
  try {
    const user=await User.findById(req.params._id)
    if(!user) return res.status(400).json({error:"invalid username"})

      let{from,to,limit}=req.query

      const logsQuery={userId:user._id};
      if(from){
        from=new Date(from)
        logsQuery.date={$gte: from.toDateString()}
      }
      if(to){
        to=new Date(to)
        logsQuery.date={...logsQuery.date, $lte: to.toDateString() }
      }
      const logs=await Exercise
.find(logsQuery).limit(Number(limit))
res.json({
  username: user.username,
  count: logs.length,
  _id: user._id,
  log: logs.map(log => ({
    description: log.description,
    duration: log.duration,
    date: log.date,
  })),
});
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
