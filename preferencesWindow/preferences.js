const {ipcRenderer} = require('electron')

let preferences = ipcRenderer.send('getPreferences')

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
