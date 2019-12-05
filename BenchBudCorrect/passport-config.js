var LocalStrategy = require("passport-local").Strategy
var bcrypt = require("bcryptjs");


function initialize(passport, getUserByUserName, getUserById){

    var authenticateUser = async (mainUserName, mainPassword, done) =>{
        var user = getUserByUserName(mainUserName); //would return null if there is no userName for that user

        if(user == null){ //might need to refactor this to go with when the user from the database with that username does not exist!
            return done(null, false, {message: "No user with that userName"});
        }

        try{
            if(bcrypt.compareSync(mainPassword, user.Password)){ //might change as the user.mainPassword in this case changes
                return done(null, user, {message: "User added correctly!"})
            }else{
                return done(null, false, {message: "Password incorrect"})
            }
        }catch (e){
            return done(e);
        }
    }
    


    passport.use(new LocalStrategy({ usernameField: 'mainUserName', passwordField: "mainPassword"}, authenticateUser))
    passport.serializeUser((user, done) => {
        done(null,user.id)  //might change to actually make it reference the user id
    })
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}


module.exports = initialize;