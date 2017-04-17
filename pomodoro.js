const {ipcRenderer} = require('electron')
const hrt = require('human-readable-time')


let progress = document.querySelector('.progress')
let circle = document.querySelector('.circle')
let time = document.querySelector('.time')
let radius = 50

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

setProgress(0.89)