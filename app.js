require('dotenv').config();

var express = require("express");
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(err, req, res, next) {
    res.status(500).send("No s'ha pogut fer parsing dels request!");
});

var pool = mysql.createPool({
    connectionLimit: 10, //important
    host: process.env.dbhost,
    user: process.env.dbuser,
    password: process.env.dbpass,
    database: "lt_stats",
    debug: false
});

var defLog = {
    'type': 'unknown',
    'rule': '',
    'rule_id' : -1,
    'incorrect_text' : '',
    'incorrect_position' : -1,
    'context' : '',
    'suggestion' : '',
    'suggestion_position': -1
};

var getLog = function(log) {
    var $log = Object.assign(defLog, log);

    return [$log.type, $log.rule_id, $log.rule, $log.incorrect_text, $log.incorrect_position, $log.context, $log.suggestion, $log.suggestion_position];
}

app.get('/stats/', function (req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }

        var $query = 'select count(*) as total from lt_stats';

        connection.query($query, function (err, rows) {

            if (!err) {
                res.json(Object.assign({"code": 200}, rows[0]));
            } else {
                res.json({"code": 500, "status": "Error in database"});
            }
        });
    });
});

app.post("/log/", function (req, res) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }

        var $log = getLog(req.body);

        var $query = 'insert into lt_stats(type, rule_id, rule, incorrect_text, incorrect_position, context, suggestion, suggestion_position) values(?,?,?,?,?,?,?,?)';

        connection.query($query, $log , function (err, rows) {
            connection.release();
            if (!err) {
                res.json({"code": 200, "status": "log added"});
            } else {
                res.json({"code": 500, "status": "Error in database"});
            }
        });
    });
});

app.listen(3000);