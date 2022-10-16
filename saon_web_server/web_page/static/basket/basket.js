/*var soap_cost = []
var number_of_product = []

function refresh_total_cost_container() {
	let total_number_of_cost = null
	for (let a in number_of_product) {
		total_number_of_cost = number_of_product[a] + total_number_of_cost
	}

	total_cost_label.innerHTML = total_number_of_cost

	let total_soap_cost = null
	for (let a in soap_cost) {
		total_soap_cost = soap_cost[a] + total_soap_cost
	}

	total_cost_price.innerHTML = total_soap_cost.toFixed(2) + '€'
	total_cost_TTC_price.innerHTML = total_soap_cost.toFixed(2) + '€'
}

var total_cost_label = document.getElementById('total_cost_label').children[0]
var total_cost_price = document.getElementById('total_cost_price')
var total_cost_TTC_price = document.getElementById('total_cost_TTC_price')

async function product_func (target) {
	let product = document.getElementById(target.getAttribute('product'))
	let product_cost = parseFloat(target.getAttribute('product_cost'))

	let cost = (target.value * product_cost).toFixed(2)

	var data = await bearer_fetch(`https://savons-saon.fr/api/product/${product.getAttribute("product_id")}/add/`, 'POST', {'new_number': target.value})

	if (data['detail'] != undefined) {
		target.value = product.getAttribute('number')
		return
	}

	product.setAttribute('number', target.value)
	product.getElementsByClassName('product_in_basket_final_cost')[0].innerHTML = cost + '€'

	soap_cost[target.getAttribute('soap_number')] = parseFloat(cost)
	number_of_product[target.getAttribute('soap_number')] = parseInt(target.value)

	refresh_total_cost_container()
}

var product_in_basket_add = document.getElementsByClassName('product_in_basket_add')

for (let i = 0; i<product_in_basket_add.length; i++) {
	product_func(product_in_basket_add[i].children[0])
}

var product_in_basket_delete = document.getElementsByClassName('product_in_basket_delete')

for (let i = 0; i<product_in_basket_delete.length; i++) {
	product_in_basket_delete[i].children[0].addEventListener('click', async (event) => {
		let product = document.getElementById(event.target.getAttribute('product'))
		let soap_number = product.getElementsByClassName('product_in_basket_add')[0].children[0].getAttribute('soap_number')

		var data = await bearer_fetch(`https://savons-saon.fr/api/product/${product.getAttribute("product_id")}/remove/`, 'DELETE')

		soap_cost[soap_number] = null
		number_of_product[soap_number] = null

		refresh_total_cost_container()

		product.remove()
	})
}
*/

var all_product = {}

var html_product = document.querySelectorAll('.product_in_basket_add > input')

for (let i = 0; i<html_product.length; i++) {
	all_product[html_product[i].getAttribute('product_id')] = {
		'option_name': html_product[i].getAttribute('product'),
		'cost': html_product[i].getAttribute('product_cost'),
		'soap_number': parseInt(html_product[i].value),
	}
}

var total_cost_label = document.getElementById('total_cost_label').children[0]
var total_cost_price = document.getElementById('total_cost_price')
var total_cost_TTC_price = document.getElementById('total_cost_TTC_price')

function refresh_total_cost() {
	total_cost = 0
	total_article = 0

	Object.keys(all_product).forEach(function(key) {
		total_cost += all_product[key]['cost'] * all_product[key]['soap_number']
		total_article += all_product[key]['soap_number']
	});

	total_cost_price.innerHTML = total_cost.toFixed(2) + '€'
	total_cost_TTC_price.innerHTML = total_cost.toFixed(2) + '€'

	if (total_article == 0) {
		total_cost_label.innerHTML = 'aucun'
	} else {
		total_cost_label.innerHTML = total_article
	}
}

refresh_total_cost()

async function product_func (event) {
	let target = event.target
	let product = document.getElementById(target.getAttribute('product'))
	let product_cost = parseFloat(target.getAttribute('product_cost'))

	let cost = (target.value * product_cost).toFixed(2)

	var data = await bearer_fetch(`api/product/${product.getAttribute("product_id")}/add/`, 'POST', {'new_number': target.value})

	if (data['detail'] != undefined) {
		if (target.value > data.stock) {
			target.value = data.stock
		} else if (target.value < 1) {
			target.value = 1
		} else {
			target.value = product.getAttribute('number')
		}
		return
	}

	all_product[target.getAttribute('product_id')]['soap_number'] = parseInt(target.value)

	product.setAttribute('number', target.value)
	product.getElementsByClassName('product_in_basket_final_cost')[0].innerHTML = cost + '€'

	refresh_total_cost()
}

var product_in_basket_delete = document.getElementsByClassName('product_in_basket_delete')

for (let i = 0; i<product_in_basket_delete.length; i++) {
	product_in_basket_delete[i].children[0].addEventListener('click', async (event) => {
		let product = document.getElementById(event.target.getAttribute('product'))
		let soap_number = product.getElementsByClassName('product_in_basket_add')[0].children[0].getAttribute('soap_number')

		var data = await bearer_fetch(`api/product/${product.getAttribute("product_id")}/remove/`, 'DELETE')

		delete(all_product[product.getAttribute("product_id")])

		refresh_total_cost()

		product.remove()
	})
}

async function got_to_delivery_choice() {
	if(Object.keys(all_product).length === 0) {
		await error_message('minor_error', 'Vous n\'avez pas de produit dans votre panier, dommage')
		return
	} else {
		window.location.href = 'delivery_choice/'
	}
}