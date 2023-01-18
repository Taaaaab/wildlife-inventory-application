#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Animal = require('./models/animal')
var Class = require('./models/class')
var Order = require('./models/order')
var PreserveStatus = require('./models/preservestatus')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var classes = []
var orders = []
var animals = []
var preservestatuses = []

function classCreate(name, cb) { 
  var animalClass = new Class({ name: name });
       
  animalClass.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Class: ' + animalClass);
    classes.push(animalClass)
    cb(null, animalClass)
  }  );
}

function orderCreate(name, cb) {
  var order = new Order({ name: name });
       
  order.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Class: ' + order);
    orders.push(order)
    cb(null, order);
  }   );
}

function animalCreate(name, binomial, description, animalclass, order, img, cb) {
  animaldetail = { 
    name: name,
    binomial: binomial,
    description: description,
    animalclass: animalclass,
    img: img
  }
  if (order != false) animaldetail.order = order
    
  var animal = new Animal(animaldetail);    
  animal.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Animal: ' + animal);
    animals.push(animal)
    cb(null, animal)
  }  );
}


function preserveStatusCreate(animal, name, expected_back, status, cb) {
  preservestatusdetail = { 
    animal: animal,
    name: name,
  }    
  if (expected_back != false) preservestatusdetail.expected_back = expected_back
  if (status != false) preservestatusdetail.status = status
    
  var preservestatus = new PreserveStatus(preservestatusdetail);    
  preservestatus.save(function (err) {
    if (err) {
      console.log('ERROR CREATING PreserveStatus: ' + preservestatus);
      cb(err, null)
      return
    }
    console.log('New PreserveStatus: ' + preservestatus);
    preservestatuses.push(preservestatus)
    cb(null, preservestatus)
  }  );
}


function createOrderClasses(cb) {
    async.series([
        function(callback) {
          classCreate('Mammalia', callback);
        },
        function(callback) {
          orderCreate("Primates", callback);
        },
        function(callback) {
          orderCreate("Diprotodontia", callback);
        },
        function(callback) {
          orderCreate("Carnivora", callback);
        },
        ],
        // optional callback
        cb);
}


function createAnimals(cb) {
    async.series([
        function(callback) {
          animalCreate('Meerkat', 'Suricata suricatta', 'The meerkat (Suricata suricatta) or suricate is a small mongoose found in southern Africa. It is characterised by a broad head, large eyes, a pointed snout, long legs, a thin tapering tail, and a brindled coat pattern.', classes[0], [orders[2],], 'img1.png', callback);
        },
        function(callback) {
          animalCreate("Sugar Glider", 'Petaurus breviceps', 'The sugar glider (Petaurus breviceps) is a small, omnivorous, arboreal, and nocturnal gliding possum belonging to the marsupial infraclass. The common name refers to its predilection for sugary foods such as sap and nectar and its ability to glide through the air, much like a flying squirrel.', classes[0], [orders[1],], 'img1.png', callback);
        },
        function(callback) {
          animalCreate("Mohol bushbaby", 'Galago moholi', 'The Mohol bushbaby (Galago moholi) is a species of primate in the family Galagidae which is native to mesic woodlands of the southern Afrotropics. It is physically very similar to the Senegal bushbaby, and was formerly considered to be its southern race. The two species differ markedly in their biology however, and no hybrids have been recorded in captivity.', classes[0], [orders[0],], 'img1.png', callback);
        },
        function(callback) {
          animalCreate("Crab-eating macaque", "Macaca fascicularis", "The crab-eating macaque (Macaca fascicularis), also known as the long-tailed macaque and referred to as the cynomolgus monkey in laboratories, is a cercopithecine primate native to Southeast Asia. A species of macaque, the crab-eating macaque has a long history alongside humans.", classes[0], [orders[0],], 'img1.png', callback);
        },
        function(callback) {
          animalCreate("Northern pig-tailed macaque","Macaca leonina", 'The northern pig-tailed macaque (Macaca leonina) is a vulnerable species of macaque in the subfamily Cercopithecidae. It is found in Bangladesh, Cambodia, China, India, Laos, Myanmar, Thailand, and Vietnam. Traditionally, M. leonina was considered a subspecies of the southern pig-tailed macaque (M. nemestrina), but is now classified as an individual species.', classes[0], [orders[0],], 'img1.png', callback);
        },
        function(callback) {
          animalCreate('Mona monkey', 'Cercopithecus mona', 'The mona monkey (Cercopithecus mona) is an Old World monkey that lives in western Africa between Ghana and Cameroon. The mona monkey can also be found on the island of Grenada as it was transported to the island aboard slave ships headed to the New World during the 18th century.', classes[0], [orders[0],], 'img1.png', callback);
        },
        ],
        // optional callback
        cb);
}


function createPreserveStatuses(cb) {
    async.parallel([
        function(callback) {
          preserveStatusCreate(animals[0], 'Dobby', false, 'Currently not in preserve', callback)
        },
        function(callback) {
          preserveStatusCreate(animals[1], 'Mini', false, 'Currently in preserve', callback)
        },
        function(callback) {
          preserveStatusCreate(animals[2], 'Beebit', false, false, callback)
        },
        function(callback) {
          preserveStatusCreate(animals[3], 'Shally', false, false, callback)
        },
        function(callback) {
          preserveStatusCreate(animals[4], 'YaYa', false, 'Currently not in preserve', callback)
        },
        function(callback) {
          preserveStatusCreate(animals[5], 'Mona', false, 'Currently not in preserve', callback)
        },
        ],
        // Optional callback
        cb);
}



async.series([
    createOrderClasses,
    createAnimals,
    createPreserveStatuses
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('PreserveStatuses: '+ preservestatuses);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




