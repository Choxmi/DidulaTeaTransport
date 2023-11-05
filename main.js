// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');
require('./app.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

async function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 420,
        height: 595,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        fullscreen: true,
        frame: false
    })

    // and load the index.html of the app.
    // mainWindow.loadFile('index.html');
    mainWindow.loadURL('http://localhost:3000/');
    // mainWindow.webContents.print({silent: true});
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    const fs = require('fs')

    const root = fs.readdirSync('./')

    // This will print all files at the root-level of the disk,
    // either '/' or 'C:\'.
    // console.log(root)

    // var con = mysql.createConnection({
    //     host: "localhost",
    //     user: "root",
    //     password: ""
    // });
    

    // con.connect(function(err) {
    //     if (err) throw err;
    //     console.log("Connected!");
    //     con.query("CREATE DATABASE diduladb", function(err, result) {
    //         if (err) throw err;
    //         console.log("Database created");

    //         // con.end(() => {
    //         //     console.log("Connection closed");
    //         // })
    //     });
    // });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.