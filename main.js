const {app, BrowserWindow, ipcMain} = require('electron')
const menubar = require('menubar')
const Stopwatch = require('timer-stopwatch')
const path = require('path')
const url = require('url')
const notifier = require('node-notifier')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let timer = new Stopwatch(25 /* * 60 */ * 1000)

let currentState
let state = {
  DONE_STATE: 0,
  TIMER_STATE: 1
}

mb = new menubar({
  dir: 'menubarWindow',
  width: 300,
  height: 350,
  alwaysOnTop: true,
  preloadWindow: true
})

let setState = function(newState) {
  currentState = newState
  mb.window.webContents.send('updateState', currentState)

  if (currentState === state.DONE_STATE) mb.setOption('alwaysOnTop', true)
  if (currentState === state.TIMER_STATE) mb.setOption('alwaysOnTop', false)
}

ipcMain.on('startTimer', (event, arg) => {
  timer.start()

  setState(state.TIMER_STATE)
})

function updateTime(time) {
  if(mb.window === undefined) return
  mb.window.webContents.send('updateTime', Object.assign(time, {max: timer.countDownMS}))
}

timer.onTime(updateTime)

timer.onStop(() => {
  setState(state.DONE_STATE)

  notifier.notify({
    title: `Time's Up!`,
    message: 'Time to take a 5 minute break.',
    sound: true
  })

  timer.reset(25 * 60 * 1000)
  updateTime({ms: timer.countDownMS})
})

mb.on('ready', () => {
  mb.window.on('ready-to-show', () => {
    // mb.window.openDevTools()
    mb.showWindow()
    setState(state.DONE_STATE)
    updateTime({ms: timer.countDownMS})
  })
})

// never lets itself disappear
mb.on('focus-lost', () => {
  if(currentState === state.DONE_STATE) {
    setTimeout(mb.showWindow, 1000)
  }
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