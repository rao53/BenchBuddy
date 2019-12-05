if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}
var express = require('express');
var app = express();
var mysql = require('mysql');
var pass = require('./sqlpass.json');
var port = "8080";
var bcrypt = require("bcryptjs");
var passport = require("passport");
var flash = require("express-flash");
var session = require("express-session");
var initializePassport = require("./passport-config");
var methodOverride = require("method-override")

initializePassport(
    passport, 
    mainUserName => {
        var string = JSON.stringify(result);
        var jsonRows = JSON.parse(string);
        return jsonRows.find(user => user.userName === mainUserName)
    },
    id => {
        var string = JSON.stringify(result);
        var jsonRows = JSON.parse(string);
        return jsonRows.find(user => user.id === id)
    }
)


var con = mysql.createConnection ({
	host: 'localhost',
	user: 'root',
	password: pass.password,
	database: 'BenchBuddyData'
});


app.set("view-engine", "ejs");
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(__dirname + '/'));
app.use(express.urlencoded({ extended: false})); //allows us to acceess form data in our get and post stuff here
app.use(methodOverride("_method"))


var server = app.listen(port, function () {
    var host = "localhost";
    var port = server.address().port;
    
    console.log("BenchBuddy app listening at http://%s:%s", host, port)
});


con.connect(function(err){
    if(!err) {
        console.log("Database is connected successfully!");
    } else {
        console.log("Error connecting database ... nn");
    }
});

var result = [];

function updateUsers(){
    var  getInformationFromDB = function(callback) {
        result = [];
        con.query('SELECT * FROM users', function(err, res, fields){
            if (err){
                return callback(err);
            }
            if(res.length){
                for(var i = 0; i<res.length; i++ ){     
                    result.push(res[i]);
                }
            }
            callback(null, result);
        });
    };
    
    getInformationFromDB(function (err, result) {
      if (err) {
        console.log("Database error!");
      }else {
          //do nothing
    
      }
    });
}

updateUsers();

app.get("/",checkAuthenticated, (req, res)=>{
    res.render("index.ejs", {name: req.user.userName});  // the second object parameter can pass the users information retrieved from the database!
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");

    updateUsers();
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs");
})

app.get('/leaderboard', checkAuthenticated, (req, res) => {
    res.render("leaderboard.ejs");
})

app.get("/popLeader", function(req, res) {
	console.log("Server received request, gathering leaderboard");
	con.query('SELECT * FROM users ORDER BY Points DESC;',
		function(err,rows,fields) {
			if (err) {
				console.log('Error during leaderboard creation');
			}	
			else {
				var leader = "<tr><th>User</th><th>Points</th></tr>";
				for (i = 0; i < rows.length; i++){
					leader += "<tr><td>" + rows[i].userName + "</td><td>" + rows[i].Points + "</td></tr>";
				};
				res.send(leader);
			}
		});
});


// CORRECT POST REQUEST ENDPOINT USED CORRECTLY TO REGISTER A USER!
app.post('/register', async (req, res) => {
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(req.body.mainPassword, salt);

    // const hashedPassword = await bcrypt.hash(req.body.mainPassword, 10);

    var userName = req.body.mainUserName;
	var password = hashedPassword;
	var firstName = req.body.FirstName;
	var lastName = req.body.LastName;
	var mainGoal = req.body.tables;
    var mainGym = req.body.gymSelect;
    
    var command = 'INSERT INTO users( username, Password, firstName, lastName, goals, gym) VALUES(' + '\"' + String(userName) + '\",\"' + String(password) + '\",\"' + String(firstName) + '\",\"' + String(lastName) + '\",\"' + String(mainGoal) + '\",\"' + String(mainGym) + '\");'; 


    con.query(command , function(err, result) {
        if (err) { 
            console.log('Error while adding user to database');
            res.redirect('/register')
        }	
        else {
            console.log('User added to database');
            updateUsers();
            res.redirect("/login")
        }
    });
})

app.get("/popGyms", (req, res) =>{
    con.query('SELECT * FROM gyms;',
    function(err,rows,fields) {
        if (err) {
            console.log('Error during gym population');
        }	
        else {
            var gyms = "";
            for (i = 0; i < rows.length; i++){
                gyms += "<option value =" + "\'" + rows[i].gymName + "\'>" + rows[i].gymName + "</option>";
            };
            res.send(gyms);
        }
    });
})


app.get("/calcDist", function(req, res) {
	console.log("Getting user's gym location");
	// Make pull actual userID once signIn is implemented
	userID = req.user.id;
	con.query('SELECT gym FROM users where id =\'' + String(userID) + '\';',
		function(err,rows,fields) {
			if (err) {
				console.log('Error during gym name seach');
			}	
			else {
					gym = rows[0].gym;
					console.log(gym);
					con.query('SELECT lat,lon FROM gyms where gymName =\'' + String(gym) + '\';',
						function(err,rows,fields) {
							if (err) {
								console.log('Error during gym location seach');
							}	
							else {
								lat = rows[0].lat;
								lon = rows[0].lon;
								console.log(lat);
								console.log(lon);
								coords = {"lat":lat,"lon":lon}
								console.log(coords);
								res.send(coords);
							 }
						});
				};

			}
		);
});


app.get("/addPoint", function(req, res) {
	userID = req.user.id;
	con.query('SELECT Points FROM users where id =\'' + String(userID) + '\';',
		function(err,rows,fields) {
			if (err) {
				console.log('Error during point seach');
			}	
			else {
				points = rows[0].Points;
				newPoints = points + 1
				console.log(points);
				console.log(newPoints);
				query = 'Update users Set Points =\'' + String(newPoints) + '\' Where id =\'' + String(userID) + '\';';
				console.log(query);
				con.query(query,
					function(err,rows,fields) {
						if (err) {
							console.log('Error during point add');
						}	
						else {
							console.log('New Points = ' + String(newPoints));
							res.send('New Points Added');
						}	
					})
			}	
		})
})	



function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return res.redirect("/")
    }

    next()
}

app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login")
})
