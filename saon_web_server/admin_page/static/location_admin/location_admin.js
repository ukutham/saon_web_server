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
		change_page('location_admin')
	}
	map = L.map('map').setView([lat, lon], 6);
	L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
            minZoom: 1,
            maxZoom: 100}).addTo(map);
}

initmap()

function open_modify_element(event) {
	var modify_location = document.getElementById('modify_location')
	var create_location = document.getElementById('create_location')

	target = event.target
	if (target.className != 'seller_result_contain')
	{
		target = target.parentElement
	}

	modify_location.querySelector('#modify_location_submit').setAttribute('location_id', target.getAttribute('location_id'))
	modify_location.querySelector('#del_location').setAttribute('location_id', target.getAttribute('location_id'))
	modify_location.querySelector('#modify_location_name').value = target.querySelector('.seller_result_name').innerHTML
	modify_location.querySelector('#modify_location_header > h3').innerHTML = target.querySelector('.seller_result_address').innerHTML
	modify_location.querySelector('#modify_location_horaire').value = target.querySelector('.seller_result_horaire').innerHTML
	modify_location.querySelector('#modify_location_web_site').value = target.querySelector('.seller_result_web_site').innerHTML

	create_location.setAttribute('open', 'false')
	modify_location.setAttribute('open', 'true')
	modify_location.setAttribute('save', 'true')
}

function open_create_element(event) {
	var modify_location = document.getElementById('modify_location')
	var create_location = document.getElementById('create_location')

	var create_location_input = create_location.querySelectorAll('input')

	for (i in create_location_input) {
		create_location_input[i].value = ''
	}

	create_location.setAttribute('open', 'true')
	modify_location.setAttribute('open', 'false')
}


var seller_result = document.getElementById('map_finder_result')

async function research_location(event) {
	var location_search = event.target.value
	var map_finder_loader = document.getElementById('map_finder_loader')

	if (map_finder_loader.getAttribute('in_research') == 'false') {
		map_finder_loader.setAttribute('in_research', 'true') 

		var data = await bearer_fetch(`../api/location/?place=${location_search}`)

		if (data['results'].length === 0) {
			if (data['detail'] != undefined & data['detail'] != "Not found.") {
				console.error('Error', data['detail'])
			}
			seller_result.innerHTML = "<span style='wight=100%; display:flex; align-items: center; justify-content: center; color: #777'>Aucun resultat</span>"
			map_finder_loader.setAttribute('in_research', 'false')
			return
		}

		data = data['results']
		console.log(data)
		
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
				if (!(a == 'latitude' || a == 'longitude' || a == 'id')) {
					element_name.push(a)
					all_element.push(data[i][a])
				}
			}
			html_element += `<button class=\"seller_result_contain\" scale=\'false\' onclick='open_modify_element(event)' location_id='${data[i]['id']}''>`
			for (a in element_name) {
				if (element_name[a] == "web_site") {
					html_element += `<a class=\"seller_result_${element_name[a]}\" href="http://${data[i][element_name[a]]}" target='_blank'>${data[i][element_name[a]]}</a>`
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

		map_finder_loader.setAttribute('in_research', 'false') 
	}
}

async function print_location(event) {
	var data = active_marker[event.target.getAttribute('active_marker_id')].location_data

	seller_result.innerHTML = ""

	html_element = ""
	html_element += `<button class=\"seller_result_contain\" scale=\'false\' onclick='open_modify_element(event)' location_id='${data['id']}''>`
	for (let a in data) {
		if (a == "web_site") {
			html_element += `<a class=\"seller_result_${a}\" href="http://${data[a]}" target='_blank'>${data[a]}</a>`
		} else if (a != 'id') {
			html_element += `<div class=\"seller_result_${a}\">${data[a]}</div>`
		}
	}
	html_element += `</button>`

	seller_result.innerHTML = html_element
}

async function put_all_point_in_map() {
	var data = await bearer_fetch(`../api/location/`, 'GET', null)

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

/* ############################################################################################# */

async function create_location(event) {
	var create_new_article = document.getElementById('create_new_article')
	create_new_article.classList.add('.disabled')

	var posted_data = {
		'name': document.getElementById('create_location_name').value,
		'horaire': document.getElementById('create_location_horaire').value,
		'web_site': document.getElementById('create_location_web_site').value,
		'rue': document.getElementById('create_location_rue').value,
		'ville': document.getElementById('create_location_ville').value,
		'code_postal': document.getElementById('create_location_postal_code').value,
		'pays': document.getElementById('create_location_pays').value,
	}

	var response = await bearer_fetch('../api/location/', 'POST', posted_data)
	test = response

	if (response['code_postal'] != undefined && response['code_postal'][0] == "Not an int") {
		document.getElementById('create_location_error').innerHTML = "le code postal n'ai pas correct"
	} else if (response['detail'] == ["fields may not be blank."]) {
		document.getElementById('create_location_error').innerHTML = "des valeurs ne sont pas rentrées"
	} else if (response['detail'] != undefined) {
		document.getElementById('create_location_error').innerHTML = response.detail
	} else {
		var modify_location = document.getElementById('modify_location')
		var create_location = document.getElementById('create_location')

		modify_location.querySelector('#modify_location_submit').setAttribute('location_id', response.Object.id)
		modify_location.querySelector('#del_location').setAttribute('location_id', response.Object.id)
		modify_location.querySelector('#modify_location_name').value = response.Object.name
		modify_location.querySelector('#modify_location_horaire').value = response.Object.horaire
		modify_location.querySelector('#modify_location_header > h3').innerHTML = response.Object.address
		modify_location.querySelector('#modify_location_web_site').value = response.Object.web_site

		create_location.setAttribute('open', 'false')
		modify_location.setAttribute('open', 'true')
		modify_location.setAttribute('save', 'true')
	}

	create_new_article.classList.remove('.disabled')
}

async function modify_location(event) {
	var modify_location = document.getElementById('modify_location')
	if (modify_location.getAttribute('save') != 'true') {

		var posted_data = {
			'name': document.getElementById('modify_location_name').value,
			'horaire': document.getElementById('modify_location_horaire').value,
			'web_site': document.getElementById('modify_location_web_site').value,
		}

		var data = await bearer_fetch(`../api/location/${event.target.getAttribute('location_id')}/modify/`, 'POST', posted_data)

		element_select = document.querySelector(`.seller_result_contain[location_id="${event.target.getAttribute('location_id')}"]`)
		if (element_select != undefined) {
			element_select.querySelector('.seller_result_name').innerHTML = data.name
			element_select.querySelector('.seller_result_horaire').innerHTML = data.horaire
			element_select.querySelector('.seller_result_web_site').innerHTML = data.web_site
			element_select.querySelector('.seller_result_web_site').setAttribute('href','http://'+data.web_site)
		}
		modify_location.setAttribute('save', 'true')
	}
}

async function remove_location(event) {
	var response = await bearer_fetch(`../api/location/${event.target.getAttribute('location_id')}/remove/`, 'DELETE')

	var element_select = document.querySelector(`.seller_result_contain[location_id="${event.target.getAttribute('location_id')}"]`)

	if (element_select != undefined) {
		document.getElementById('map_finder_result').removeChild(element_select) 
	}

	document.getElementById('modify_location').setAttribute('open', 'false')
}