const {ipcRenderer, webFrame} = require('electron')
const hrt = require('human-readable-time')

// Disable zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

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
	let currentKey = getKeyByValue(state, currentState)
	for(let key in state) {
		let elements = document.querySelectorAll(`.${key}`)
		for(let i = 0; i < elements.length; i++) {
			if(key === currentKey) elements[i].style.display = null
			else elements[i].style.display = 'none'
		}
	}
}

let task = document.querySelector('.task')
task.addEventListener('keypress', (e) => {
	if(e.key === 'Enter') {
		e.preventDefault()
	}
})
task.addEventListener('paste', (e) => {
	e.preventDefault()
	let text = e.clipboardData.getData("text/plain")
	text = text.replace(/\n/g, '') // remove new lines
	document.execCommand('insertHTML', false, text)
})

let progress = document.querySelector('.progress')
let circle = document.querySelector('.circle')
let time = document.querySelector('.time')
let radius = 50

document.querySelector('.start-timer-button').addEventListener('click', () => {
	ipcRenderer.send('startTimer')
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
