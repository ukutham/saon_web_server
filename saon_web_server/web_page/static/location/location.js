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

function scale_icon_of_marker(marker, factor) {
	let new_icon = marker.options.icon
	const size = [25, 41]
	const shadow_size = [41, 41]
	const anchor = [12, 41]
	new_icon.options.iconSize = [size[0]*factor, size[1]*factor]
	new_icon.options.shadowSize = [shadow_size[0]*factor, shadow_size[1]*factor]
	new_icon.options.iconAnchor = [anchor[0]*factor, anchor[1]*factor]
	return new_icon
}

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

var extender_bar_1 = document.getElementById('extender_bar_1')
var extender_bar_2 = document.getElementById('extender_bar_2')

var map_hidder = document.getElementById('map_hidder')

async function seller_container_extention(event) {
	if (seller_extender.getAttribute('open') == 'false') {
		seller_container.style.transform = 'translateX(0px)'

		extender_bar_1.style.transform = 'translateY(0px)'
		extender_bar_1.children[0].style.height = '30px'
		extender_bar_1.children[0].style.bottom = '15px'
		extender_bar_1.children[0].style.transform = 'rotate(45deg)'

		extender_bar_2.style.transform = 'translateY(0px)'
		extender_bar_2.children[0].style.height = '30px'
		extender_bar_2.children[0].style.bottom = '15px'
		extender_bar_2.children[0].style.transform = 'rotate(-45deg)'

		if (window.innerWidth <= 850) {
			map_hidder.style.zIndex = '1'
			map_hidder.style.opacity = '0.5'
		}

		await sleep(1000);
		seller_extender.setAttribute('open', 'true')
	} else {
		seller_container.style.transform = 'translateX(-100%)'

		extender_bar_1.style.transform = 'translateY(5px)'
		extender_bar_1.children[0].style.height = '20px'
		extender_bar_1.children[0].style.bottom = '10px'
		extender_bar_1.children[0].style.transform = 'rotate(55deg)'

		extender_bar_2.style.transform = 'translateY(-5px)'
		extender_bar_2.children[0].style.height = '20px'
		extender_bar_2.children[0].style.bottom = '10px'
		extender_bar_2.children[0].style.transform = 'rotate(-55deg)'

		map_hidder.style.opacity = '0'
		map_hidder.style.zIndex = '-1'

		await sleep(1000);
		seller_extender.setAttribute('open', 'false')
	}
}

/* shearch code */

var shearch_button = document.getElementById('shearch_bar_icon')
var seller_lauder_drops = document.getElementById('seller_loader_drops')
var seller_result = document.getElementById('seller_result')
var shearch_bar = document.querySelector('#shearch_bar_text > input')

var text_in_shearch_bar = document.querySelector('#shearch_bar_text > input').value

async function seller_reshearch_func(event, get_option) {
	if (text_in_shearch_bar == shearch_bar.value) {
		return
	}
	if (shearch_button.getAttribute('inreshearch') == 'false') {

		shearch_button.setAttribute('inreshearch', 'true')

		text_in_shearch_bar = shearch_bar.value

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
					html_element += `<div class=\"seller_result_${element_name[a]}\"><a href="http://${data[i][element_name[a]]}">${data[i][element_name[a]]}</a></div>`
				} else {
					html_element += `<div class=\"seller_result_${element_name[a]}\">${data[i][element_name[a]]}</div>`
				}
			}
			html_element += `</button>`
			if (!(data.length-1 == i)) {
				html_element += `<div class=\"seller_result_separater\"></div>`
			}

			active_marker.push(L.marker([data[i]['latitude'], data[i]['longitude']],).addTo(map))
			active_marker[active_marker.length-1].bindPopup(`<div style='margin: 5px; font-weight: bold;'>${data[i]['name']}</div`)
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
