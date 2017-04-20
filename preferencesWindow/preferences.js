const {ipcRenderer} = require('electron')
const settings = require('electron-settings')

let update = {
	primaryColor: ['appearance.primaryColor', (newValue, oldValue) => {
		document.querySelector(`#primary-color${newValue}`).checked = true // check correct radio box
		
		if(oldValue) document.body.classList.remove(`primary-color${oldValue}`)
		document.body.classList.add(`primary-color${newValue}`)
	}]
}

for(let key in update) {
	settings.watch(update[key][0], update[key][1])
	update[key][1](settings.get(update[key][0]))
}

function forEachQuerySelectorAll(query, callback) {
	let elements = document.querySelectorAll(query)
	for(let i = 0; i < elements.length; i++) {
		callback(elements[i])
	}
}

// Add callbacks to tabs to switch views
forEachQuerySelectorAll('input[type="radio"][name="menu-items"]', (el1) => {
	el1.addEventListener('click', (e) => {
		let targetSection = e.target.value
		forEachQuerySelectorAll('.preferences-section', (el2) => {
			if (el2.classList.contains(targetSection)) el2.style.display = null
			else el2.style.display = 'none'
		})
	})
})

// 
forEachQuerySelectorAll('input[type="radio"][name="primary-color"]', (el) => {
	el.addEventListener('click', (e) => {
		settings.set('appearance.primaryColor', Number(e.target.value))
	})
})

window.addEventListener('load', () => {
	ipcRenderer.send('preferencesLoaded')
})