const {app, BrowserWindow, ipcMain} = require('electron')
const menubar = require('menubar')
const Stopwatch = require('timer-stopwatch')
// const path = require('path')
// const url = require('url')
const notifier = require('node-notifier')

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

mb = new menubar({
  dir: 'menubarWindow',
  width: 300,
  height: 350,
  alwaysOnTop: true,
  preloadWindow: true
})

// Initialize state variables and function
let currentState
let state = {
  DONE_STATE: 0,
  TIMER_STATE: 1
}

let setState = function(newState) {
  currentState = newState
  mb.window.webContents.send('updateState', currentState)

  if (currentState === state.DONE_STATE) mb.setOption('alwaysOnTop', true)
  if (currentState === state.TIMER_STATE) mb.setOption('alwaysOnTop', false)
}

// Create and initialize timer
let timer = new Stopwatch(25 * SECOND)

function updateTime(time) {
  if(mb.window === undefined) return
  mb.window.webContents.send('updateTime', Object.assign(time, {max: timer.countDownMS}))
}

timer.onTime(updateTime)

// Start timer when we receive event from renderer (when start button is pressed)
ipcMain.on('startTimer', (event, arg) => {
  timer.start()
  // Stops nagging user; allows window to unfocus
  setState(state.TIMER_STATE)
})

// Call when timer ends
timer.onStop(() => {
  // Set state to DONE_STATE to start nagging user again
  setState(state.DONE_STATE) 

  // Create notification so that user knows that they've run out of time
  notifier.notify({
    title: `Time's Up!`,
    message: 'Time to take a 5 minute break.',
    sound: "Submarine"
  })

  // Reset the timer to 25 minutes
  timer.reset(25 * MINUTE)
  // Send updateTime event to renderer to show full progress bar and updated time
  updateTime({ms: timer.countDownMS})
})


mb.on('ready', () => {
  mb.window.on('ready-to-show', () => {
    // mb.window.openDevTools()
   
    mb.showWindow()
    // Send event to renderer to update UI; locks window into focus
    setState(state.DONE_STATE)
    // Send updateTime event to renderer to show full progress bar and updated time
    updateTime({ms: timer.countDownMS})
  })
})

// Never lets itself disappear
mb.on('focus-lost', () => {
  // Only activates in DONE_STATE
  if(currentState === state.DONE_STATE) {
    // Immediately opens itself again
    setTimeout(mb.showWindow, 0)
  }
})

// Preferences Window
function createPreferencesWindow() {
  let pref = new BrowserWindow({
    dir: 'preferencesWindow',
    width: 500,
    height: 300,
    titleBarStyle: 'hidden', // Hides title bar, leaves window controls ("traffic lights")
    resizable: false,
    center: true, // Positions itself at the center of the screen
  })

  pref.loadURL(`file://${__dirname}/preferencesWindow/index.html`)
}

ipcMain.on('openPreferences', (event, arg) => {
  createPreferencesWindow()
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