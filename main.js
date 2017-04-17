const {app, BrowserWindow, ipcMain} = require('electron')
const menubar = require('menubar')
const Stopwatch = require('timer-stopwatch')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let timer = new Stopwatch(25 * 60 * 1000)

function createWindow () {
  // Create the browser window.
  mb = new menubar({
    width: 300,
    height: 350,
    alwaysOnTop: true
  })

  // and load the index.html of the app.
  mb.on('after-create-window', () => {
    // mb.showWindow()

    console.log('ready')

    // setInterval(() => mb.window.webContents.send('updateTime', 1), 1000)
    timer.onTime((time) => {
      mb.window.webContents.send('updateTime', Object.assign(time, {max: timer.countDownMS}))
    })
    timer.start()

    mb.window.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))

    
  })

  



  // never lets itself disappear
  mb.on('focus-lost', () => {
    console.log('focus-lost')
    setTimeout(mb.showWindow, 1000) // this should be 0, 1000 makes it easier to close for now
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

/*
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
*/

/*
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.