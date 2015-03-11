//create a webserver
//that responds to GET requests
//with hello world

var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var app = express();
var port = 3000;
var ejs = require('ejs');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('_BArrEkgdN35APiBHkFK4A');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/static'));


// allows us to parse the incoming request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connects to postgres once, on server start
var conString = process.env['DATABASE_URL'];
var db;
pg.connect(conString, function(err, client) {
  if (err) {
    console.log(err);
  } else {
    db = client;
    sendQueuedMail(client);
  }
});

// homepage
app.get('/', function(request, response) {
	response.send('<h1>Project 3!</h1>');
 });

//get all users from database, send them as response
app.get('/users', function (req, res) {
    db.query("SELECT * FROM users", function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      var users = result.rows;
      res.render("emailList", {"users" : users});

    }
  });
});

//logging middleware
app.use(function(req,res,next) {
	console.log("Request at ", req.path);
	next();
});

//Respond to POST requests
app.post("/submit", function(req,res,next) {
  console.log(req.body.email)
  db.query("INSERT INTO users (email) VALUES ($1)", [req.body.email], function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});


//send emails, etc

function sendQueuedMail(db){
	sendNewUsersInitialMessage(db);
	// other mails
}
 
function sendNewUsersInitialMessage (db) {
	// Query for new users
	db.query("SELECT email FROM users WHERE last_email_sent IS NULL;", function(err, result) {
	    if (err) {
	    } else {
	    	firstEmail(result.rows);
	    }
	  })
	// Assemble a new email
 
	// Send the email to new users using mandrill
}
 
function firstEmail (users) {
	var message = {
    "text": "It's my birthday! also I am really excited about that.",
    "subject": "in-class hacking",
    "from_email": "troy@tradecrafted.com",
    "from_name": "in-class example",
    "to": users
    }
	
	
	for(var i=0; i<users.length; i++) {
		var email = users[i].email;
		updateLastEmailSent(email);
	}
}
 
function sendEmail(message){
	mandrill_client.messages.send({"message": message, "async": true }, function(result) {
	    console.log(result);
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	});
}

//update last email sent field in database
function updateLastEmailSent(email) {
	db.query("UPDATE users SET last_email_sent=now() WHERE email = ($1)", [email], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("last email sent updated to " + email);
    }
  });
}


app.listen(port);


