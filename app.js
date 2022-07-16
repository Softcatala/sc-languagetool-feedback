var express = require("express");
var mysql = require('mysql');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var uuidValidator = require('uuid-validate');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(err, req, res, next) {
    res.status(500).send("No s'ha pogut fer parsing dels request!");
});

var pool = mysql.createPool({
    connectionLimit: 20, //important
    host: process.env.dbhost,
    user: process.env.dbuser,
    password: process.env.dbpass,
    database: "lt_stats",
    debug: false
});

app.get("/create_db/", function (req, res) {
  
    var $query = `CREATE DATABASE IF NOT EXISTS lt_stats;`;

    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("Error in connection database - db create");
            return;
        }

        connection.query($query, function (err, rows) {
            connection.release();
            if (!err) {
                console.log("database created");
            } else {
                console.log("Cannot create database");
            }
        });
    });
    
      var $query = `CREATE TABLE IF NOT EXISTS lt_stats (id bigint(20) NOT NULL AUTO_INCREMENT, type varchar(45) DEFAULT NULL, rule_id varchar(45) DEFAULT NULL, rule_sub_id int(11) DEFAULT NULL, incorrect_text text, incorrect_position int(11) DEFAULT NULL, context text, suggestion text, suggestion_position int(11) DEFAULT NULL, datetime timestamp NULL DEFAULT CURRENT_TIMESTAMP, user_uuid varchar(36) DEFAULT NULL, PRIMARY KEY (id), KEY rule (rule_id,rule_sub_id), KEY user (user_uuid));`;
    
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("Error in connection database - db create");
            return;
        }

        connection.query($query, function (err, rows) {
            connection.release();
            if (!err) {
                console.log("Table created");
            } else {
                console.log("Cannot create table");
            }
        });
    });
    
    res.json({"code":200, "status": "DB created"});
});

console.log("Host:" + process.env.dbhost);
console.log("User:" + process.env.dbuser);


var defLog = {
    'type': 'unknown',
    'rule_id': '',
    'rule_sub_id' : -1,
    'incorrect_text' : '',
    'incorrect_position' : -1,
    'context' : '',
    'suggestion' : '',
    'suggestion_position': -1
};

var sanitizeLog = function (log) {

    // old api
    if (!isNaN(log.rule_id)) {
        return false;
    }

    log.rule_sub_id = parseInt(log.rule_sub_id);
    if (isNaN(log.rule_sub_id)) {
        log.rule_sub_id = -1;
    }
	
    return log;
}

var getLog = function(log, cookies) {
    var $log = Object.assign({"correctorUuid": ""}, defLog, log);

    $log = sanitizeLog($log);

    if (!$log) {
        return false;
    }

    if (!cookies.correctorUuid) {
        $log.correctorUuid = uuid.v4();
    } else {
        $log.correctorUuid = cookies.correctorUuid;
    }

    return [$log.type, $log.rule_id, $log.rule_sub_id, $log.incorrect_text, $log.incorrect_position, $log.context, $log.suggestion, $log.suggestion_position, $log.correctorUuid];
}

app.get('/format/', function (req, res) {
    res.json(defLog);
});

app.get('/stats/', function (req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }

        var $query = 'select count(*) as total from lt_stats';

        connection.query($query, function (err, rows) {
            connection.release();
            if (!err) {
                res.json(Object.assign({}, {"code": 200}, rows[0]));
            } else {
                res.json({"code": 500, "status": "Error in database"});
            }
        });
    });
});

app.post("/log/", function (req, res) {

    var $log = getLog(req.body, req.cookies, res);

    if (!$log) {
        res.json({"code": 200, 'status': 'Not yet ready'});
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                res.json({"code": 100, "status": "Error in connection database"});
                return;
            }

            res.cookie('correctorUuid', $log[8]);

            var $query = 'insert into lt_stats(type, rule_id, rule_sub_id, incorrect_text, incorrect_position, context, suggestion, suggestion_position, user_uuid) values(?,?,?,?,?,?,?,?,?)';

            connection.query($query, $log , function (err, rows) {
                connection.release();
                if (!err) {
                    res.json({"code": 200, "status": "log added"});
                } else {
                    res.json({"code": 500, "status": "Error in database"});
                }
            });
        });
    }
});

app.listen(3000);
