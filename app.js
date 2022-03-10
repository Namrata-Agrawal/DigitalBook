var sqlite3 = require("sqlite3").verbose();
var express = require("express");
var http = require('http');
var path = require("path");
var bodyparser = require("body-parser");
var helmet = require("helmet");
const res = require("express/lib/response");
//var ratelimit = require("express-rate-limit");

var app= express();

var server = http.createServer(app);

/*const limiter = ratelimit({
    windowMs:15 * 60 * 1000,
    max : 100
});
*/
var db = new sqlite3.Database("employee.db");
app.use(bodyparser.urlencoded({
    extended:false
}));
app.use(express.static(path.join(__dirname,'./main')));

app.use(helmet());
//app.use(limiter);

db.run('CREATE TABLE IF NOT EXISTS emp (id TEXT,name TEXR)');


app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./main/index.html'));
   // res.sendFile(path.join(('index.html','../style.css')));
});

//ADD employee

app.post('/add', function(req,res){
    db.serialize(()=>{
        db.run('INSERT INTO emp(id,name) VALUES (?,?)', [req.body.id , req.body.name],function(err){
            if(err){
                return console.log(err.message);
            }
            console.log("New emp added");
            res.send("new added"+ req.body.id + "name"+ req.body.name);
        });
    });
});

// View
app.post('/view', function(req,res){
    db.serialize(()=>{
      db.each('SELECT id ID, name NAME FROM emp WHERE id =?', [req.body.id], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
        if(err){
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        res.send(` ID: ${row.ID},    Name: ${row.NAME}`);
        console.log("Entry displayed successfully");
      });
    });
  });

// update

app.post('/update',function(req,res){
    db.serialize(()=>{
        db.run("update emp set name = ? where id= ? ",[req.body.name,req.body.id],function(err){
            if(err){
                res.send('Error encountered while updating');
                return console.error(err.message);
            }
            res.send("Entry updated");
            console.log("Entry updated successfully");
        });
    });
});

//delete
app.post('/delete',function(req,res){
    db.serialize(()=>{
        db.run('delete from emp where id= ?',[req.body.id],function(err){
            if(err){
                res.send("error encountered while deleting");
                return console.error(err.message);
            }
            res.send("entry deleted");
            console.log("Entry deleted");
        });
    });
});

// closing the database connection
app.get('/close', function(req,res){
    db.close((err)=> {
        if(err){
            res.send("there is some error connecting");
            return console.error(err.message);
        }

        console.log('closing the database connection');
        res.send('Database connection successfully closed');
    });

});

server.listen(3000,function(){
    console.log("server is listening on port: 3000");
});