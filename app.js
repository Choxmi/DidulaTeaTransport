const express = require("express");
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const publicPath = path.resolve(__dirname, "public");
const { BrowserWindow } = require('electron');
var bodyParser = require('body-parser');
const fs = require('fs');
app.use(express.static('css'));
app.use(express.static('img'));
app.use(express.static('js'));
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(publicPath));
app.use(bodyParser.json())
 
const db = new sqlite3.Database('./didula_db.db');

db.run('CREATE TABLE IF NOT EXISTS users(nic VARCHAR(20) PRIMARY KEY NOT NULL, name VARCHAR(100), mobile INT, account VARCHAR(50), address VARCHAR(500))');
{/* <option value="0">අත්තිකාරම්</option>
<option value="1">පොහොර/25Kg</option>
<option value="2">වල් නාශක/Bottle</option>
<option value="3">ඩොලමයිට්/Pkt</option>
<option value="4">තේ කොළ/Pkt</option>
<option value="5">වෙනත්</option> */}
db.run(`CREATE TABLE IF NOT EXISTS transactions(
    date TEXT,
    nic VARCHAR(20),
    username VARCHAR(100),
    grossWeight INTEGER DEFAULT 0,
    add0_amount INTEGER DEFAULT 0,
    add1_units INTEGER DEFAULT 0,
    add1_unit_price INTEGER DEFAULT 0,
    add1_amount INTEGER DEFAULT 0,
    add2_units INTEGER DEFAULT 0,
    add2_unit_price INTEGER DEFAULT 0,
    add2_amount INTEGER DEFAULT 0,
    add3_units INTEGER DEFAULT 0,
    add3_unit_price INTEGER DEFAULT 0,
    add3_amount INTEGER DEFAULT 0,
    add4_units INTEGER DEFAULT 0,
    add4_unit_price INTEGER DEFAULT 0,
    add4_amount INTEGER DEFAULT 0,
    add5_amount INTEGER DEFAULT 0,
    add5_comments TEXT  DEFAULT NULL,
    PRIMARY KEY(nic,date)
)`);
db.run('CREATE TABLE IF NOT EXISTS rates(year INT, month INT, price REAL, stamp REAL, transport REAL)');

app.get('/', function (req, res) {
    res.render("index",{});
});

app.get('/addTransaction',(req, res)=>{
    var query = "INSERT INTO transactions(date,nic,username,grossweight";
    (req.query.additionals).forEach(additional => {
        if(additional.index === "0"){
            query += (",add0_amount");
        } else if(additional.index === "5"){
            query += (",add5_amount");
            query += (",add5_comments");
        } else {
            query += (",add"+additional.index+"_units");
            query += (",add"+additional.index+"_unit_price");
            query += (",add"+additional.index+"_amount");
        }
    });
    query += (") VALUES (");
    query += "?,?,?,?";
    (req.query.additionals).forEach(additional => {
        if(additional.index === "0"){
            query += ",?";
        } else if(additional.index === "5"){
            query += ",?,?";
        } else {
            query += (",?,?,?");
        }
    });
    query += ")";

    var params = [];
    params.push(req.query.date);
    params.push(req.query.nic);
    params.push(req.query.username);
    params.push(req.query.grossweight);
    (req.query.additionals).forEach(additional => {
        if(additional.index === "0"){
            params.push(additional.col2);
        } else if(additional.index === "5"){
            params.push(additional.col2);
            params.push(additional.col3);
        } else {
            params.push(additional.col2);
            params.push(additional.col3);
            params.push(parseInt(additional.col2)*parseInt(additional.col3));
        }
    });

    console.log(query);
    

    db.run(query, params, function(err) {
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

app.get('/saveRates',(req,res)=>{
    let sql = "INSERT OR REPLACE INTO rates(year,month,price,stamp,transport) VALUES(?,?,?,?,?)";
    let params = [req.query.year,req.query.month,req.query.price,req.query.stamp,req.query.transport];
    db.run(sql, params, function(err) {
    if (err) {
        res.status(500).send("Failed");
        return console.log(err);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    res.status(200).send({"res": "Success"});
    });
});

app.get('/getRates',(req,res)=>{
    let sql = "SELECT * FROM rates WHERE year = ? AND month = ?";
    let params = [req.query.year,req.query.month];
    db.get(sql, params, (err, row) => {
        if(err){
            return;
        }
        res.status(200).send(row);
    });
});

app.get('/generateReport',(req,res)=>{
    res.render("report",{});
});

app.get('/generatePDF',(req,res)=>{
    // var doc = new jsPDF();
    // console.log("Generating PDF");
    
    // doc.fromHTML(req.query.element, 15, 15, {
    //     'width': 170,
    //           'elementHandlers': req.query.handler
    //   });
    //   doc.save('sample-file.pdf');
    console.log("Generate Started");
    var fullUrl = req.protocol + '://' + req.get('host') + '/generateReport';
    console.log(fullUrl);
    
    let window_to_PDF = new BrowserWindow({});//to just open the browser in background
    window_to_PDF.loadURL(fullUrl); //give the file link you want to display
    console.log("HTML Loaded");
    
    function pdfSettings() {
        var paperSizeArray = ["A4", "A5"];
        var option = {
            landscape: false,
            marginsType: 0,
            printBackground: false,
            printSelectionOnly: false,
            pageSize: paperSizeArray[1],
        };
    return option;
    }

    console.log("Setting Calculated");
    

    window_to_PDF.webContents.on('did-finish-load', () => {
        console.log("Loaded");
        
        window_to_PDF.webContents.printToPDF(pdfSettings(), function(err, data) {
            console.log("Started Printing");
            
            if (err) {
                console.log(err);
                return;
            }
            try{
                fs.writeFileSync('./generated_pdf.pdf', data);
                console.log("Generated");
                window_to_PDF.close();
                res.status(200).send();
            }catch(err){
                console.log(err);
                return;
            }
        
        })
    });
});
 
app.listen(3000)