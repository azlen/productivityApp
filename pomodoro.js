
let progress = document.querySelector('.progress')
let circle = document.querySelector('.circle')
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

setProgress(0.89)