/*
 * Koneksi Nodejs dengan MongoDB menggunakan Mongoose
 *
 * Author By Equan Pr.
 * http://equan.me
 *
 * License :  Whatever you want! :D
 */

var express = require("express"),
    app = express(),
    mongoose = require('mongoose'),
    path = require('path'),
    engines = require('consolidate');

app.configure(function () {
    app.use(express.logger());

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type')
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    })

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname+'/public'));

    app.engine('html', engines.handlebars);

    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');

    app.set('PORT', process.env.PORT || 5000);
    app.set('MONGODB_URI', process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL || 'mongodb://localhost/account');

});

// /**
 // * MongoDB connection
 // */
var db = mongoose.createConnection(app.get('MONGODB_URI'));

db.on('connected', function () {
    console.log('Connected to MongoDB.');

});

db.on('error', function (err) {
    console.error.bind(console, 'Connection to MongoDB error!.');
});

db.on('close', function () {
    console.log('Connection to MongoDB closed.');
});

// Schema
var PersonsSchema = new mongoose.Schema({
        fullname: 'string',
        username: 'string',
        email: 'string',
        password: 'string',
        address: 'string'
    }),

Persons = db.model('Account', PersonsSchema);

// Routes
app.get("/", function (req, res) {
    res.render('index',{
        data: 'Silly RESTful sample app built with Node.js, Express, Mongoose and MongoDB. ' +
            'Maybe it\'s useful for beginners ;)'
    });
});

// GET /persons (account setting)
app.get("/persons", function (req, res) {
    // Find All
    Persons.find(function (err, persons) {
        if (err) res.json({error: err})

        if(persons)
            res.json({persons: persons});
    })
});

// POST (proses register)
app.post("/persons", function(req, res){
    // /**
     // * Get data from post
     // * @type {Persons}
     // */
    var person = new Persons({
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        address: req.body.address,
        password: req.body.password 
    });

    person.save(function (err, person) {
        if (err) {
            res.send({error:err});
        }else {
            console.log('Save data: ' + person);
            res.json({message: ' save ok'});
        }
    })
});

// GET /persons/:username (login)
app.get('/persons/:username', function(req, res){
    var param_username = req.params.username;

    Persons.find({username:param_username}, function(err, person){
        if(err) {
            res.json({
                data:"Error finding person."
            });
        }else {
            res.json({
                person: person
            });
        }
    })
});

//Upload
// server.post('/upload', (req, res) => {
  // let form = new formidable.IncomingForm()
  // form.uploadDir = path.join(__dirname, 'uploads')
  // form.hash = true
  // form.multiples = false
  // form.keepExtensions = true

  // form.parse(req, (err, fields, files) => {
    // if (!err) {
      // console.log(files.file.name)
      // console.log(files.file.path)
      // console.log(files.file.type)
    // }
    // res.end()
  // })
// })

// Download
// function download(url, dest, callback) {
    // var file = fs.createWriteStream(dest);
    // var request = http.get(url, function (response) {
        // response.pipe(file);
        // file.on('finish', function () {
            // file.close(callback);  
        // });
        // file.on('error', function (err) {
            // fs.unlink(dest);  
            // if (callback)
                // callback(err.message);
        // });
    // });
// }


app.listen(app.get('PORT'));
console.log("Server Port: " + app.get('PORT'));