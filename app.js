require('dotenv').config();

var express   =    require("express");
var mysql     =    require('mysql');
var app       =    express();

var pool      =    mysql.createPool({
    connectionLimit : 10, //important
    host     : process.env.dbhost,
    user     : process.env.dbuser,
    password : process.env.dbpass,
    database : "lt_stats",
    debug    :  false
});

app.post("/log/",function(req,res){-
    pool.getConnection(function(err,connection){
        if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }

        connection.query(/* run the query */,function(err,rows){
            connection.release();
            if(!err) {
                res.json({"code" : 200, "status": "log added"});
            }
        });

        connection.on('error', function(err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        });
    });
});

app.listen(3000);