/* map code */

if (document.querySelector('script[src=\'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js\']') != null) {
	document.head.removeChild(script_location)
}

var	script_location = document.createElement('script')
script_location.src = "https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"
script_location.integrity = "sha512-/Nsx9X4HebavoBvEBuyp3I7od5tA0UzAxs+j83KgC8PU0kgB4XiK4Lfe4y4cgBtaRJQEIFCW+oC506aPT2L1zw=="
script_location.crossOrigin = ""
document.head.appendChild(script_location)

var lat = 46.169522;
var lon = 1.871533;
var map = null;

var active_marker = [];

function initmap() {
	if (typeof L == 'undefined')
	{
		change_page('location')
	}
	map = L.map('map').setView([lat, lon], 6);
	L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
            minZoom: 1,
            maxZoom: 100}).addTo(map);
}

initmap()

/* seller_extender */

var seller_container = document.getElementById('seller_container')
var seller_extender = document.getElementById('seller_extender')

var map_hidder = document.getElementById('map_hidder')

async function seller_container_extention(event) {
	if (seller_extender.getAttribute('open') == 'false') {
		map_hidder.setAttribute('open', 'true')
		seller_container.setAttribute('open', 'true')
		seller_extender.setAttribute('open', 'true')
	} else {
		map_hidder.setAttribute('open', 'false')
		seller_container.setAttribute('open', 'false')
		seller_extender.setAttribute('open', 'false')
	}
}

/* shearch code */

var shearch_button = document.getElementById('shearch_bar_icon')
var seller_lauder_drops = document.getElementById('seller_loader_drops')
var seller_result = document.getElementById('seller_result')
var shearch_bar = document.querySelector('#shearch_bar_text > input')

async function seller_reshearch_func(event, get_option) {
	if (shearch_button.getAttribute('inreshearch') == 'false') {

		shearch_button.setAttribute('inreshearch', 'true')


		if (!(seller_result.children.length === 0)) {
			for (let i = 0; i<seller_result.children.length; i++) {
				seller_result.children[i].style.animation = 'result_dissiparation 0.5s ease-in-out'
			}

			await new Promise(test => setTimeout(test, 500))
		}

		seller_lauder_drops.style.animation = "drops 5s ease-in-out infinite"

		/*request*/

		if (get_option != "") {
			get_option = `?place=${get_option}`
		}

		var data = await bearer_fetch(`api/location/${get_option}`, 'GET', null)

		if (data['results'].length === 0) {
			if (data['detail'] != undefined & data['detail'] != "Not found.") {
				console.error('Error', data['detail'])
			}
			seller_result.innerHTML = "<span style='wight=100%; display:flex; align-items: center; justify-content: center; color: #777'>Aucun resultat</span>"
			seller_lauder_drops.style.animation = ""
			shearch_button.setAttribute('inreshearch', 'false')
			return
		}

		data = data['results']

		seller_result.innerHTML = ""

		let html_element = ``

		for (let a in active_marker) {
			map.removeLayer(active_marker[a])
		}
		active_marker.splice(0, active_marker.length)


		for (let i = 0; i < data.length; i++) {
			let element_name = []
			let all_element = []

			for (a in data[i]) {
				if (!(a == 'latitude' || a == 'longitude' || a == "id")) {
					element_name.push(a)
					all_element.push(data[i][a])
				}
			}
			html_element += `<button class=\"seller_result_contain\" scale=\'false\'>`
			for (a in element_name) {
				if (element_name[a] == "web_site") {
					html_element += `<div class=\"seller_result_${element_name[a]}\"><a href="http://${data[i][element_name[a]]}" target='_blank'>${data[i][element_name[a]]}</a></div>`
				} else {
					html_element += `<div class=\"seller_result_${element_name[a]}\">${data[i][element_name[a]]}</div>`
				}
			}
			html_element += `</button>`
			if (!(data.length-1 == i)) {
				html_element += `<div class=\"seller_result_separater\"></div>`
			}

			active_marker.push(L.marker([data[i]['latitude'], data[i]['longitude']],).addTo(map))

			active_marker.push(L.marker([data[i]['latitude'], data[i]['longitude']],).addTo(map))
			active_marker[active_marker.length - 1]['location_data'] = {}
			active_marker[active_marker.length - 1]._icon.setAttribute('onclick', 'print_location(event)')
			active_marker[active_marker.length - 1]._icon.setAttribute('active_marker_id', active_marker.length - 1)

			for (a in data[i]) {
				if (!(a == 'latitude' || a == 'longitude')) {
					active_marker[active_marker.length - 1]['location_data'][a] = data[i][a]
				}
			}
		}

		map.setView([lat, lon], 6);

		seller_result.innerHTML = html_element

		const all_seller_result = document.getElementsByClassName('seller_result_contain')

		for (let i = 0; i<all_seller_result.length; i++) {
			all_seller_result[i].addEventListener('click', (event) => {
				map.setView([active_marker[i]._latlng.lat, active_marker[i]._latlng.lng], 17)
				if (window.innerWidth <= 850) {
					seller_container_extention(event)
				}
				map.closePopup()
			})
		}

		seller_lauder_drops.style.animation = ""

		shearch_button.setAttribute('inreshearch', 'false')
	}
}

async function print_location(event) {
	var marker = active_marker[event.target.getAttribute('active_marker_id')]
	var data = marker.location_data
	map.setView([marker._latlng.lat, marker._latlng.lng], 17)

	seller_result.innerHTML = ""

	html_element = ""
	html_element += `<button class=\"seller_result_contain\" scale=\'false\'>`
	for (let a in data) {
		if (a == "web_site") {
			html_element += `<div class=\"seller_result_${a}\"><a href="http://${data[a]}" target='_blank'>${data[a]}</a></div>`
		} else if (a != 'id') {
			html_element += `<div class=\"seller_result_${a}\">${data[a]}</div>`
		}
	}
	html_element += `</button>`

	seller_result.innerHTML = html_element

	if (seller_extender.getAttribute('open') == 'false') {
		seller_container_extention(event)
	}
}

async function put_all_point_in_map() {
	var data = await bearer_fetch(`api/location/`, 'GET', null)

	data = data['results']

	for (let a in active_marker) {
		map.removeLayer(active_marker[a])
	}
	active_marker.splice(0, active_marker.length)

	for (let i = 0; i < data.length; i++) {
		active_marker.push(L.marker([data[i]['latitude'], data[i]['longitude']],).addTo(map))
		active_marker[active_marker.length - 1]['location_data'] = {}
		active_marker[active_marker.length - 1]._icon.setAttribute('onclick', 'print_location(event)')
		active_marker[active_marker.length - 1]._icon.setAttribute('active_marker_id', active_marker.length - 1)

		for (a in data[i]) {
			if (!(a == 'latitude' || a == 'longitude')) {
				active_marker[active_marker.length - 1]['location_data'][a] = data[i][a]
			}
		}
	}
	map.setView([lat, lon], 6);
}

put_all_point_in_map()

shearch_button.addEventListener('click', (event) => {
	get_option = shearch_button.previousElementSibling
	get_option = get_option.querySelector('input')
	get_option = get_option.value
	seller_reshearch_func(event, get_option)
})

shearch_bar.addEventListener('keyup', (event) => {
	if (event.keyCode === 13) {
		seller_reshearch_func(event, shearch_bar.value)
	}
})
