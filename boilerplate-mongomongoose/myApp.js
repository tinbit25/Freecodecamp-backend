require('dotenv').config();
const mongoose = require('mongoose');



const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  favoriteFoods: { type: [String] }
});

const Person = mongoose.model('Person', personSchema);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully!');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

const createAndSavePerson = (done) => {
  const person=new Person({
    name:"tinbite",
    age:22,
    favoriteFoods:["biscuit"]
  })
  person.save((err,data)=>{
    if(err) return done(err)
      console.log("Saved Person: ", JSON.stringify(data, null, 2));
    done(null ,data);

  })

  
};

const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople,(err,data)=>{
    
    if (err) {
      return done(err); 
    }
    
    done(null,data);
  })
  
};

const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, (err, data) => {
    if (err) {
      return done(err);  
    }
    done(null, data);     
  });
};


const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods:food},(err,data)=>
  {if(err) {
    return done(err)
  }
  done(null,data);
})
  
};

const findPersonById = (personId, done) => {
  Person.findById(personId,(err,data)=>{
    if(err){return done(err)}
    done(null,data);
  })
  
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  Person.findById(personId, (err, person) => { 
    if (err) {
      return done(err); 
    }

    
    person.favoriteFoods.push(foodToAdd);

   
    person.save((err, updatedPerson) => {
      if (err) {
        return done(err); 
      }

      
      done(null, updatedPerson);
    });
  });
};


  


const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate({name:personName},
    {age:ageToSet},
    {new:true},
    (err,updatedage)=>{
    if(err) {return done(err)}
    done(null,updatedage);
  })  
};

const removeById = (personId, done) => {
  Person.findOneAndRemove({ _id: personId }, (err, deleted) => {
    if (err) return done(err); 
    done(null, deleted); 
  });
};


const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({name:nameToRemove},(err,removedname)=>{
    if(err) {return done(err)}
      done(null,removedname)
    
  })

};

const queryChain = (done) => {
  const foodToSearch = "burrito";
Person.find({favoriteFoods:foodToSearch})
.sort({name:1})
.limit(2)
.select({age:0})
.exec((err,data)=>{
  if(err){return done(err)}
  done(null,data);
})
  
};


/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
