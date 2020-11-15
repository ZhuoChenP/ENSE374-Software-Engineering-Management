
// add all your boilerplate code up here
const express=require("express")
const bodyParser=require("body-parser")
const mongoose = require("mongoose")

// new requires for passport
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
//allows using dotenv for enviroment variables
require("dotenv").config();


const app=express();
app.use(express.static(__dirname+ "/public"))
app.use(bodyParser.urlencoded({extended:true}));


// set up session
app.use(session({
    secret: process.env.SECRET, // stores our secret in our .env file
    resave: false,              // other config settings explained in the docs
    saveUninitialized: false
}));

// set up passport

app.use(passport.initialize());
app.use(passport.session());


app.set("view engine","ejs");

// passport needs to use MongoDB to store users
mongoose.connect("mongodb://localhost:27017/ense374db", 
                {useNewUrlParser: true, // these avoid MongoDB deprecation warnings
                 useUnifiedTopology: true});

// This is the database where our users will be stored
// Passport-local-mongoose handles these fields, (username, password), 
// but you can add additional fields as needed

        const UserSchema = new mongoose.Schema ({
            username: String,
            password: String
        })

        const TaskSchema = new mongoose.Schema ({
            _id:Number,
            name: String,
            owner: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
            creator:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
            done:Boolean,
            cleared:Boolean
        })

        // configure passportLocalMongoose
        UserSchema.plugin(passportLocalMongoose);
        // Collection of users
        const User = new mongoose.model("User", UserSchema);
        const Task =new  mongoose.model("Task",TaskSchema);

        // more passport-local-mongoose config
        // create a strategy for storing users with Passport
        passport.use(User.createStrategy());
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());

        const port = 3000; 

        app.listen (port, function() {
          // code in here runs when the server starts
        console.log("Server is running on port " + port);
         })

        app.get("/",function(req,res){
            res.render("login");
            });
            
        app.get("/todo",function(req,res){
            var title;
            title="To Do";
            Task.find({},function(err,results){
                res.render("todo",{title:title,task:results,user:req.user.username,u_id:req.user.id});
            })
        })

        app.get("/logout",function(req,res){
            console.log("A user logged out")
            req.logout();
            res.redirect("/");
            })
        

        app.post("/login",function(req,res){
            console.log("A user is logging in")
            //create a user
            const user = new User ({
                username: req.body.username,
                password: req.body.password
             });
             //log them in
             req.login (user, function(err) {
                if (err) {
                    // failure
                    console.log(err);
                    res.redirect("/")
                } 
                else{
                    passport.authenticate("local",{ successRedirect: 'todo',
                    failureRedirect: '/' })(req, res, function() {
                        res.redirect("todo");
                    });
                }
            });
        });

        app.post("/register",function(req,res){
            var authorization  = "123";
            if(authorization==req.body.authorization){
            User.register({username: req.body.username}, req.body.password, function(err, user){
                if (err) {
                    console.log(err);
                    res.redirect("/")
                } else {
                    console.log("Registering a new user");
                    // authenticate using passport-local
                    // what is this double function syntax?! It's called currying.
                    passport.authenticate("local",{ successRedirect: 'todo',
                    failureRedirect: '/' })(req, res, function(){
                        res.redirect("todo")
                    });
                }
            });
        }
        else{   res.redirect("/")    }
        })
        
        app.post("/addtask",function(req,res){

            const obj=new Task();
            Task.countDocuments({},function(err,results){
                obj._id=results+1;
                obj.name=req.body.content;
                obj.owner=null;
                obj.creator=req.body.pass_user;
                obj.done=0;
                obj.cleared=0;
             obj.save();
            })
        })

        app.post("/claim",function(req,res){

            Task.updateOne({_id:req.body.pass_id}, {$set: {owner:req.body.pass_username}},function(err){
                if (err) {
                    console.log(err);
                }
            })
            res.redirect("todo");
        })

        app.post("/abandonorcomplete",function(req,res){
            if(req.body.complete=="on")
            {  
                Task.updateOne({_id:req.body.pass_id}, {$set: {done:1}},function(err){
                    if (err) {
                        console.log(err);
                    }
                })
                res.redirect("todo");
            }
            else{
                Task.updateOne({_id:req.body.pass_id}, {$set: {owner:null}},function(err){
                    if (err) {
                        console.log(err);
                    }
                })
            res.redirect("todo");
            }
        })

        app.post("/unfinish",function(req,res){
            Task.updateOne({_id:req.body.pass_id}, {$set: {done:0}},function(err){
                if (err) {
                    console.log(err);
                }
            })
            res.redirect("todo");
        })

        app.post("/purge",function(req,res){

            Task.updateMany({done:1}, {$set: {cleared:1}},function(err){
                if (err) {
                    console.log(err);
                }
            })
        res.redirect("todo");
    })
