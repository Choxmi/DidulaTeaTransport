const express = require("express");
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const publicPath = path.resolve(__dirname, "public");
var bodyParser = require('body-parser')
app.use(express.static('css'));
app.use(express.static('img'));
app.use(express.static('js'));
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(publicPath));
app.use(bodyParser.json())
 
const db = new sqlite3.Database('./didula_db.db');

db.run('CREATE TABLE users(nic VARCHAR(20) PRIMARY KEY NOT NULL, name VARCHAR(100), mobile INT, account VARCHAR(50), address VARCHAR(500))');
db.run('CREATE TABLE transaction(nic VARCHAR(20) PRIMARY KEY NOT NULL, name VARCHAR(100), mobile INT, account VARCHAR(50), address VARCHAR(500))');

app.get('/', function (req, res) {
    res.render("index",{});
});

app.get('/addUser',(req, res)=>{
    db.run(`INSERT INTO users(nic,name,mobile,account,address) VALUES(?,?,?,?,?)`, [req.query.nic,req.query.name,req.query.mobile,req.query.account,req.query.address], function(err) {
    if (err) {
        if(err.errno === 19){
            res.status(406).send("User Exist");
            return;
        }
        res.status(500).send("Failed");
        return console.log(err);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    res.status(200).send({"res": "Success"});
    });
});

app.get('/listUsers',(req,res)=>{
    let sql = `SELECT * FROM users`;
    var userData =[];
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            userData.push(row);
        });
        res.send(userData);
    });
});
 
app.listen(3000)