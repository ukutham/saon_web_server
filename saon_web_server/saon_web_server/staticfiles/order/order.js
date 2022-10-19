function open_or_close_order(event) {
	if (event.target.parentElement.parentElement.getAttribute('open') == 'false') {
		open_element = document.querySelector('.gradient_border_order[open="true"]')
		for (let i in open_element) {
			open_element.setAttribute('open', 'false')
		}
		event.target.parentElement.parentElement.setAttribute('open', 'true')
	} else {
		event.target.parentElement.parentElement.setAttribute('open', 'false')
	}
}

var	script_FileSaver = document.createElement('script')
script_FileSaver.src = `/static/extern_module/FileSaver.js`
document.head.appendChild(script_FileSaver)

var order_facture_url = document.getElementsByClassName('order_facture_url')

for (let i = 0; i < order_facture_url.length; i++) {
	order_facture_url[i].addEventListener('click', (event) => {
		get_facture(event.target.getAttribute('facture'))
})
}

async function get_facture(facture) {
	var data = await bearer_fetch(`${facture}`, 'GET', null, 'blob')
	saveAs(data, `SAON_facture_${facture.split('/')[facture.split('/').lenght]}`);
}

async function change_status(event, new_state) {
	var data = await bearer_fetch(`order/${event.target.getAttribute('order_id')}/change_state/`, 'POST', {'state': new_state}, 'json')

	if (data['detail'] != undefined) {
		error_message('minor_error', data['detail'])
	} else if (data['status'] != 'ok') {
		error_message('major_error', 'Unknow error, please call your best ingener')
	} else {
		event.target.parentElement.querySelector('.order_status').innerHTML = data['dev_livraison_state']
		event.target.parentElement.querySelector('.order_status').setAttribute('state', data['livraison_state'])
		if (data['livraison_state'] == '0') {
			event.target.setAttribute('state', '1')
			event.target.innerHTML = 'validez la commande'
		} else if (data['livraison_state'] == '1') {
			event.target.setAttribute('state', '0')
			event.target.innerHTML = 'dévalidez la commande'
		}
	}
}

async function search_account(event) {
	change_page(`order/?account=${event.target.value}`)
}