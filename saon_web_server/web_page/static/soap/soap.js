var soap_info = document.getElementById('soap_info')
var soap_info_body = document.getElementById('soap_info_body')
var soap_info_loader = document.getElementById('soap_info_loader')

var all_soap = document.getElementsByClassName('product')

var main_soap_img = document.getElementById('soap_info_main_img')
var all_soap_img = document.getElementsByClassName('soap_info_others_img')
var soap_info_name = document.getElementById('soap_info_name')
var soap_info_ingr = document.getElementById('soap_info_ingr')
var soap_info_desc = document.getElementById('soap_info_desc')
var soap_info_price = document.getElementById('soap_info_price')
var soap_stock = document.getElementById('soap_stock')
var soap_command_number = document.getElementById('soap_command_number')
var add_basket_input = document.getElementById('add_basket_input')
var basket_input_loader = document.getElementById('basket_input_loader')

var soap_options = document.getElementById('soap_options')

function reset_stock_status(stock) {
	if (stock === 0) {
		soap_stock.innerHTML = '<span id=\'stock\' style="margin-right: 0.4em;">aucun</span>savon en stock'
		soap_command_number.children[0].disabled = 'true'
		add_basket_input.nextElementSibling.className = 'disabled'
		add_basket_input.nextElementSibling.children[0].innerHTML = 'aucun savon en stock'

	} else if (stock === 1) {
		soap_stock.innerHTML = '<span id=\'stock\' style="margin-right: 0.4em;">1</span>savon en stock'
		add_basket_input.nextElementSibling.children[0].innerHTML = 'ajouter au panier'
		soap_command_number.children[0].disabled = ''
		add_basket_input.nextElementSibling.className = ''
		soap_command_number.children[0].value = '1'
	} else {
		soap_stock.innerHTML = `<span id=\'stock\' style="margin-right: 0.4em;">${stock}</span>savons en stock`
		add_basket_input.nextElementSibling.children[0].innerHTML = 'ajouter au panier'
		soap_command_number.children[0].disabled = ''
		add_basket_input.nextElementSibling.className = ''
		soap_command_number.children[0].value = '1'
	}

	soap_command_number.children[0].setAttribute('min', '1')
	soap_command_number.children[0].setAttribute('max', data['stock'])
}

for (let i = 0; i < all_soap.length; i++) {
	all_soap[i].addEventListener('click', async (event) => {
		add_basket_input.nextElementSibling.setAttribute('inloading', 'false')
		soap_info.style.transform = 'translateX(0%)'
		soap_info_body.style.display = "none"
		document.children[0].style.overflowY = 'clip'
		add_basket_input.nextElementSibling.style.pointerEvents = ''
		await sleep(1000)
		soap_info_loader.style.display = "flex"

		if (!(soap_info_name.children[0].innerHTML === all_soap[i].children[0].children[0].innerHTML)) {

			/*request*/

			var data = await bearer_fetch(`api/article/${all_soap[i].getAttribute('product')}`, 'GET', null)

			/*request end*/

			if (Object.keys(data).length == 0 || data['detail'] != undefined) {
				if (data['detail'] != undefined) {
					error_message('major_error', data['detail'])
				}

				document.children[0].style.overflowY = 'auto'
				soap_info.style.transform = 'translateX(100%)'
			}

			main_soap_img.style.backgroundImage = `url(${data['image_1']})`
			for (let a = 0; a < all_soap_img.length; a++) {
				all_soap_img[a].style.backgroundImage = `url(${data[`image_${a+1}`]})`	
			}
			soap_info_name.children[0].innerHTML = data['name']
			soap_info_ingr.querySelector('p').innerHTML = data['ingredients']
			soap_info_ingr.setAttribute('display', data['ingredients']) 
			soap_info_desc.children[0].innerHTML = data['description']

			add_basket_input.setAttribute('soap_id', data['id'])
			soap_info_price.children[0].innerHTML = data.options.options[0]['cost']
			soap_info_price.children[1].innerHTML = data.options.options[0]['masse']

			let html_options = ""

			for (let a in data.options.options) {
				let options = data.options.options[a]
				html_options = html_options + `<div class='soap_options'><input type="radio" id='soap_options_${options['id']}' name="soap_options" stock="${options['stock']}" masse="${options['masse']}" cost="${options['cost']}" value="${options['id']}"><div><label tabindex="0" role="button" for="soap_options_${options['id']}">${options['view_name']}</label></div></div>`
			}

			soap_options.innerHTML = html_options

			for (let a in data.options.options) {
				let options = data.options.options[a]
				let input = document.querySelector(`#soap_options_${options['id']}`)
				if (a == 0) {
					input.checked = true
				}
				let label = document.querySelector(`#soap_options_${options['id']} + div > label`)
				label.addEventListener('click', (event) => {
					soap_info_price.children[0].innerHTML = options['cost']
					soap_info_price.children[1].innerHTML = options['masse']
					reset_stock_status(parseInt(document.getElementById(label.getAttribute('for')).getAttribute('stock')))
				})
			}

			reset_stock_status(data.options.options[0]['stock'])			
		}
		else {
			 /*request*/

			var data = await bearer_fetch(`api/article/${all_soap[i].getAttribute('product')}`, 'GET', null)
			var all_options = document.querySelector('#soap_options')

			for (let i in data.options.options) {
				all_options.querySelector(`input[value="${data.options.options[i].id}"]`).setAttribute('stock', data.options.options[i].stock)
				if (all_options.querySelector(`input[value="${data.options.options[i].id}"]`).checked) {
					var new_stock = data.options.options[i].stock
				}
			}

			/*request end*/

			reset_stock_status(new_stock)
		}

		soap_info_loader.style.display = "none"
		soap_info_body.style.display = "block"
	})
}

var soap_info_closer = document.getElementById('soap_info_closer')

soap_info_closer.addEventListener('click', (event) => {
	document.children[0].style.overflowY = 'auto'
	soap_info.style.transform = 'translateX(100%)'
})

for (let i = 0; i < all_soap_img.length; i++) {
	all_soap_img[i].addEventListener('click', async (event) => {
		if (all_soap_img[i].getAttribute('checked') === 'false') {
			for (let a = 0; a < all_soap_img.length; a++) {
				if (all_soap_img[a].getAttribute('checked') === 'true') {
					all_soap_img[a].setAttribute('checked', 'false')
				}
			}
			all_soap_img[i].setAttribute('checked', 'true')
			main_soap_img.style.backgroundImage = all_soap_img[i].style.backgroundImage
		}
	})
}

add_basket_input.nextElementSibling.addEventListener('click', async (event) => {
	add_basket_input.nextElementSibling.setAttribute('inloading', 'true')
	soap_command_number.children[0].disabled = true
	add_basket_input.nextElementSibling.style.pointerEvents = 'none'

	let soap_id = add_basket_input.getAttribute('soap_id')
	let soap_options = document.querySelector('.soap_options > input:checked').value
	let soap_number = soap_command_number.querySelector('input').value

	/*post request*/

	let post_request_body = {
		'option_id': soap_options,
		"number": soap_number,
	}

	let request_data = await bearer_fetch(`api/article/${soap_id}/add_in_basket/`, 'POST', post_request_body)

	/*request end*/

	if (request_data['error'] != undefined) {
		document.getElementById('add_in_basket_error').innerHTML = request_data['error']
	}
	else if (Object.keys(request_data).length == 0) {
		document.getElementById('add_in_basket_error').innerHTML = 'veuillez vous connecter'
	}
	else {
		document.getElementById('add_in_basket_error').innerHTML = ''
	}

	add_basket_input.nextElementSibling.setAttribute('inloading', 'false')
	soap_command_number.children[0].disabled = false
	add_basket_input.nextElementSibling.style.pointerEvents = 'all'
})