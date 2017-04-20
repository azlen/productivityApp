const {ipcRenderer, webFrame} = require('electron')
const hrt = require('human-readable-time')
const settings = require('electron-settings')

// Disable zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

// Settings update UI functions and watch
let update = {
	backgroundColor: ['appearance.backgroundColor', (newValue, oldValue) => {
		if(oldValue) document.body.classList.remove(`background-color${oldValue}`)
		document.body.classList.add(`background-color${newValue}`)
	}],
	primaryColor: ['appearance.primaryColor', (newValue, oldValue) => {
		if(oldValue) document.body.classList.remove(`primary-color${oldValue}`)
		document.body.classList.add(`primary-color${newValue}`)
	}]
}

for(let key in update) {
	settings.watch(update[key][0], update[key][1])
	update[key][1](settings.get(update[key][0]))
}

// Initialize state variables and functions
let currentState
let state = {
	DONE_STATE: 0,
	TIMER_STATE: 1
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function setState(newState) {
	currentState = newState
	let currentKey = getKeyByValue(state, currentState) // Turn integer (e.g. 0) into key (e.g. "DONE_STATE")
	for(let key in state) { // Go through each state
		let elements = document.querySelectorAll(`.${key}`) // Get list of all elements that show/hide based on that state
		for(let i = 0; i < elements.length; i++) { // Go through all elements that show/hide based on that state
			if(key === currentKey) elements[i].style.display = null // If it is the current state: show the element
			else elements[i].style.display = 'none' // If it is not the current state: hide the element
		}
	}
}

// Prevent newlines from being added to the contenteditable task element
// In fact, when the enter key is pressed we want to start the timer
let task = document.querySelector('.task')
task.addEventListener('keypress', (e) => {
	if(e.key === 'Enter') {
		e.preventDefault() // Prevents newline

		task.blur() // Unfocus task; hide caret

		ipcRenderer.send('startTimer') // Starts timer
	}
})
task.addEventListener('paste', (e) => {
	e.preventDefault() // Prevent paste
	let text = e.clipboardData.getData("text/plain") // Get text from clipboard
	text = text.replace(/\n/g, '') // Remove new lines from clipboard text
	document.execCommand('insertHTML', false, text) // Insert text in proper location (same place it would go in regular paste operation)
})

let progress = document.querySelector('.progress')
let circle = document.querySelector('.circle')
let time = document.querySelector('.time')
let radius = 50

document.querySelector('.start-timer-button').addEventListener('click', () => {
	if (task.textContent !== '') {
		ipcRenderer.send('startTimer')
	} else {
		task.focus()
	}
})

document.querySelector('.settings-button').addEventListener('click', () => {
	ipcRenderer.send('openPreferenceWindow')
})

let circumference = 2 * Math.PI * radius

progress.style.strokeDasharray = `${ circumference }, ${ circumference }`

function setProgress(percent) { // takes value between 0 and 1
	progress.style.strokeDashoffset = circumference * (percent - 1.0)
	circle.setAttribute('transform', `translate(${
		Math.cos(-2 * Math.PI * (percent - 1.0) - Math.PI/2) * radius
	}, ${
		Math.sin(-2 * Math.PI * (percent - 1.0) - Math.PI/2) * radius
	})`)
}

ipcRenderer.on('updateTime', (event, arg) => {
	time.textContent = hrt(new Date(arg.ms), '%mm%:%ss%')
	setProgress(arg.ms / arg.max)
})

ipcRenderer.on('updateState', (event, arg) => {
	console.log(arg)
	setState(arg)
})
