const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html'); // Make sure the file exists
});
app.use(express.static('public'))
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
// Create Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now }, // Store date as a Date type
});


const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// POST /api/users - Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User({ username: req.body.username });
    const savedUser = await newUser.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/users/:_id/exercises - Add exercise to user
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { description, duration, date } = req.body;

    // Use current date if no date is provided
    const exerciseDate = date ? new Date(date) : new Date();

    const newExercise = new Exercise({
      userId: user._id,
      description,
      duration: Number(duration),
      date: exerciseDate,
    });

    const savedExercise = await newExercise.save();
    
    // Return the response in the correct format
    res.json({
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(), // Ensure this is a string
      _id: savedExercise._id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// GET /api/users/:_id/logs - Get exercise logs for user
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let { from, to, limit } = req.query;

    const logsQuery = { userId: user._id };
    
    // Filter by 'from' and 'to' dates if provided
    if (from) {
      logsQuery.date = { $gte: new Date(from) }; // Use Date objects for comparison
    }
    if (to) {
      logsQuery.date = {
        ...logsQuery.date,
        $lte: new Date(to) // Use Date objects for comparison
      };
    }

    // Find logs with optional limit
    const logs = await Exercise.find(logsQuery).limit(Number(limit) || 0);

    // Return logs with properly formatted date strings
    res.json({
      username: user.username,
      count: logs.length,
      _id: user._id,
      log: logs.map(log => ({
        description: log.description,
        duration: log.duration,
        date: log.date.toDateString(), // Format date as string
      })),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
