// const bodyParser = require("body-parser");
const expressSanitizer = require("express-sanitizer");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const Joi = require('joi');
const { bottleValidation, blogValidation } = require('./validate');
let port = process.env.PORT || 3000;

// APP CONFIG
mongoose.connect('mongodb://localhost/restful_blog_app', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connection to MongoDb was successful'))
    .catch(err => console.error('Connection to MongoDb encountered an Error!', err));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//  MONGOOSE/MODEL CONFIG
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now }
});
let Blog = mongoose.model("Blog", blogSchema);

let bottleSchema = new mongoose.Schema({
    type: String,
    number: Number,
    description: String,
    created: {type: Date, default: Date.now }
});
let Bottle = mongoose.model("Bottle", bottleSchema);


// RESTFUL ROUTES

app.get("/", function(req, res){
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index", {blogs: blogs});
        }
    });    
});

app.get('/bottles', (req, res) => {
    Bottle.find({}, (err, bottles) => {
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index2", {bottles: bottles });
        }
    })
})

// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// NEW BOTTLE ROUTE
app.get("/bottles/new", function(req, res){
    res.render("newbottle");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
    //implementing sanitizer
    req.body.blog.body = req.sanitize(req.body.blog.body);

    const {error} = blogValidation(req.body.blog);
    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        //create blog
        Blog.create(req.body.blog, function(err){
            if(err){
                res.render("new");
            } else {
                //then, redirect to the index
                res.redirect("/blogs");
            }
        }); 
    }       
});

app.post("/bottles", function(req, res){
    // implementing sanitizer
    console.log(req.body.bottle.body);
    req.body.bottle.body = req.sanitize(req.body.bottle.body);
    const {error} = bottleValidation(req.body.bottle);
    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        Bottle.create(req.body.bottle, (err) => {
            if (err){
                res.render("newbottle");
            } else {
                res.redirect("/bottles");
            }
        });
    }
})

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

/*
app.put('/blogs/:id', (req, res) => {
    //Look up the course
    const blog = blogs.find(c => c.id === parseInt(req.params.id));
    //If not existing, return 404
    if (!blog) res.status(404).send('The course with the guven ID was not found');

    //Validate
    schema = Joi.object({
        title: Joi.string().min(4).required().label('Title'),
        image: Joi.string().dataUri().required().label('Image'),
        body: Joi.string().alphanum().required().label('Body Content')
    });
    validate = (data, schema) => {
        const options = {
            abortEarly: false
        };
        const result = Joi.validate(data, schema, options);
        // result.error === null -> valid
    };
    //If invalid, return 400 - Bad request

    //Update course
    //Return the updated course
});
**/

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    //implementing sanitizer
    req.body.blog.body = req.sanitize(req.body.blog.body);

    const {error} = blogValidation(req.body.blog);
    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, foundBlog){
            if(err){
                res.redirect("/blogs");
            } else {
                res.redirect("/blogs/" + req.params.id);
            }
        });
    }

});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(port, function(){
    console.log("SERVER HAS STARTED!!...");
});