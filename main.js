const {app, BrowserWindow, ipcMain} = require('electron')
const menubar = require('menubar')
const Stopwatch = require('timer-stopwatch')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let timer = new Stopwatch(25 * 60 * 1000)
timer.start()

let currentState
let state = {
  DONE_STATE: 0,
  TIMER_STATE: 1
}

mb = new menubar({
  width: 300,
  height: 350,
  alwaysOnTop: true,
  preloadWindow: true
})

let setState = function(newState) {
  currentState = newState
  mb.window.webContents.send('updateState', newState)
}

timer.onTime((time) => {
  if(mb.window === undefined) return
  mb.window.webContents.send('updateTime', Object.assign(time, {max: timer.countDownMS}))
})

mb.on('ready', () => {
  mb.window.on('ready-to-show', () => {
    // mb.window.openDevTools()
    mb.showWindow()
    setState(state.DONE_STATE)
  })
})

// never lets itself disappear
mb.on('focus-lost', () => {
  console.log('focus-lost')
  setTimeout(mb.showWindow, 1000) // this should be 0, 1000 makes it easier to close for now
})


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