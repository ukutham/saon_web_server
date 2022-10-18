var product = document.getElementsByClassName('product')
var soap_info = document.getElementById('soap_info')
var article_option_container = document.getElementById('article_option_container')
var article_info = document.getElementById('article_info')

var article_option_lenght = 0
var article_id = 0

function not_allow(data) {
	if (data.detail != undefined) {
		if (data.detail === 'You do not have permission to perform this action.')
		{	
			error_message('minor_error', 'Vous n\'etes pas autorisé a faire cela')
			return true
		}
	}
	return false

}

function open_soap_info(mode, article_data) {
	soap_info.setAttribute('open', 'true')
	soap_info.setAttribute('mode', mode)

	length = article_option_container.getElementsByClassName('article_option').length

	for (let i = 0; i < length; i++)
	{
		article_option_container.querySelector(`.article_option[id="${i}"]`).remove()
		article_option_container.querySelector(`.article_option_separation[id="${i}"]`).remove()
	}

	if (article_data.options != undefined) {
		options = article_data.options.options

		article_option_lenght = Object.keys(options).length
		article_id = article_data.id

		for (let i = 0; i < Object.keys(options).length; i++) {
			article_option_container.innerHTML += `
						<div class="article_option_separation" id='${i}'></div>
						<div class='article_option' id='${i}' article_id='${article_id}' save='true'>
							<div class="article_option_name_container">
								<label for="article_option_name_${i}">Nom :</label>
								<input type="text" name="article_option_name" value='${options[i].view_name}' id="article_option_name_${i}" onchange='put_save_on_false(event)'>
								<div style="flex: auto;"></div>
								<svg
									viewBox=' 0 0 600 600'
									id='ok_icon'
									class='info_icon'>
									<path stroke-width='90' stroke-linecap='round' stroke-linejoin='round' fill='none' d='M 150 350 L 300 500 L 500 150'></path>
								</svg>
							</div>
							<div class="article_option_cost_container">
								<label for="article_option_cost_${i}">cout :</label>
								<input type="number" name="article_option_cost" value='${options[i].cost}' id="article_option_cost_${i}" onchange='put_save_on_false(event)'>
								<label for="article_option_cost">€</label>
							</div>
							<div class="article_option_masse_container">
								<label for="article_option_masse_${i}">poid :</label>
								<input type="number" name="article_option_masse" value='${options[i].masse}' id="article_option_masse_${i}" onchange='put_save_on_false(event)'>
								<label for="article_option_masse_${i}"> en gramme</label>
							</div>
							<div class="article_option_stock_container">
								<label for="article_option_stock_${i}">stock :</label>
								<input type="number" name="article_option_stock" value='${options[i].stock}' id="article_option_stock_${i}" onchange='put_save_on_false(event)'>
							</div>
							<div class="article_option_importance_container">
								<label for="article_option_importance_${i}">niveau d'apparation :</label>
								<input type="number" name="article_option_importance" value='${options[i].importance}' id="article_option_importance_${i}" onchange='put_save_on_false(event)'>
							</div>
							<div class="submit_remove_button">
								<div style="flex: auto;"></div>
								<div class="gradient_border">
									<button class="save_button" in_creation='false' real_id='${options[i].id}' onclick='save_article_option(event)'>Sauvegarder</button>
								</div>
								<div class="gradient_border">
									<button class="remove_button" in_creation='false' real_id='${options[i].id}' onclick='remove_article_option(event)'>Supprimer</button>
								</div>
							</div>
						</div>`
		}
	}

	if (mode == 'create') {
		article_info.setAttribute('save', 'false')

		all_input = article_info.querySelectorAll('input')
		for (let input in all_input) {
			all_input[input].value = ''
		}

		all_text_area = article_info.querySelectorAll('textarea')
		for (let text_area in all_text_area) {
			all_text_area[text_area].value = ""
		}

		all_img = article_info.querySelectorAll('img')
		for (let img in all_img) {
			all_img[img].src = ""
		}

		article_info.querySelector('#soap_name_title > span').innerHTML = 'Nouveau Savon'

	} else if (mode == 'modify') {
		article_info.setAttribute('save', 'true')
		article_info.setAttribute('article_id', article_data.id)
		article_info.querySelector('#soap_name_title > span').innerHTML = article_data.name

		article_info.querySelector('#article_option_article_type').value = article_data.article_type
		article_info.querySelector('#article_option_article_type').setAttribute('ancien_value', article_data.article_type)

		article_info.querySelector('#soap_name_input').value = article_data.name
		article_info.querySelector('#soap_name_input').setAttribute('ancien_value', article_data.name)

		article_info.querySelector('#soap_principal_ingredient_input').value = article_data.principal_ingredients
		article_info.querySelector('#soap_principal_ingredient_input').setAttribute('ancien_value', article_data.principal_ingredients)

		article_info.querySelector('#soap_ingredient_input').innerHTML = article_data.ingredients
		article_info.querySelector('#soap_ingredient_input').setAttribute('ancien_value', article_data.ingredients)

		article_info.querySelector('#soap_description_input').innerHTML = article_data.description
		article_info.querySelector('#soap_description_input').setAttribute('ancien_value', article_data.description)

		article_info.querySelector('#soap_principal_image > img').src = article_data.principal_image
		article_info.querySelector('#soap_image_1 > img').src = article_data.image_1
		article_info.querySelector('#soap_image_2 > img').src = article_data.image_2
		article_info.querySelector('#soap_image_3 > img').src = article_data.image_3

		article_info.querySelector('#soap_available_input').checked = article_data.available
		article_info.querySelector('#soap_available_input').setAttribute('ancien_value', article_data.available)
	}
}

function previewFile(event) {
  var preview = event.target.previousElementSibling
  var file    = event.target.files[0]
  var reader  = new FileReader()

  reader.onloadend = function () {
    preview.src = reader.result
  }

  if (file) {
    reader.readAsDataURL(file)
  } else {
    preview.src = ""
  }
}

document.getElementById('soap_info_closer').addEventListener('click', (event) => {
	soap_info.setAttribute('open', 'false')
})

var soap_container = document.getElementById('soap_container')
var create_new_type_article_button = document.getElementById('create_new_type_article_button')
var create_new_type_article_input = document.getElementById('create_new_type_article_input')

create_new_type_article_button.addEventListener('click', () => add_new_article_type())

async function add_new_article_type() {
	var new_article_type = create_new_type_article_input.value
	create_new_type_article_input.value = ''
	if (new_article_type == null || new_article_type == "") {
	  return
	} else {
		var data = await bearer_fetch(`../api/article_type/`, 'POST', {'name': new_article_type})

		if(not_allow(data)) {
			return
		}

		if (data.name != null || data.name != undefined) {
			if (data.name[0] === "article_type with this name already exists.")
			{
				await error_message('minor_error', "ce nom est deja utilisé")
				return
			}
			change_page('article')
		} else {
			await error_message('major_error', "un probleme est survenue, veuillez contacter l'équipe technique.")
		}

		return
	} 
}

async function modify_name_article_type(event) {
	var new_name = event.target.parentElement.parentElement.querySelector('input').value

	var data = await bearer_fetch(`../api/article_type/${event.target.getAttribute('article_type_id')}/modify_name/`, 'POST', {"new_name": new_name})

	if(not_allow(data)) {
		return
	}

	if (data[`Modification`] != null || data[`Modification`] != undefined) {
		event.target.parentElement.parentElement.querySelector('.product_type_title').innerHTML = event.target.parentElement.parentElement.querySelector('input').value
	} else if (data['error'] === 'nouveau nom deja utilisé') {
		await error_message('minor_error', 'nouveau nom deja utilisé')
	} else {
		await error_message('major_error', "un probleme est survenue, veuillez contacter l'équipe technique.")
	}

	event.target.parentElement.parentElement.querySelector('input').value = ""
}

async function remove_article_type(event) {
	if (!(confirm("Si vous supprimer se type d'article, tous les articles associées seront supprimer !!! voulez vous vraiment faire ca ?"))) {
		return
	}

	var data = await bearer_fetch(`../api/article_type/${event.target.getAttribute('article_type_id')}/remove/`, 'DELETE', null)

	if(not_allow(data)) {
		return
	}

	if (data[`Object ${event.target.getAttribute('article_type_id')}`] != null || data[`Object ${event.target.getAttribute('article_type_id')}`] != undefined) {
		change_page('article')
	} else {
		await error_message('major_error', "un probleme est survenue, veuillez contacter l'équipe technique.")
	}

	return
}


function open_create_popup(event) {
	open_soap_info('create', {})
}

/* create */

async function create_new_article(event) {

	var posted_data = new FormData()

	var select_article_type = document.getElementById('article_option_article_type')

	posted_data.append('article_type', select_article_type.options[select_article_type.selectedIndex].value)
	posted_data.append('name', article_info.querySelector('#soap_name_input').value)
	posted_data.append('principal_ingredients', article_info.querySelector('#soap_principal_ingredient_input').value)
	posted_data.append('ingredients', article_info.querySelector('#soap_ingredient_input').value)
	posted_data.append('description', article_info.querySelector('#soap_description_input').value)
	posted_data.append('image_1', article_info.querySelector('#soap_image_1_input').files[0])
	posted_data.append('image_2', article_info.querySelector('#soap_image_2_input').files[0])
	posted_data.append('image_3', article_info.querySelector('#soap_image_3_input').files[0])
	posted_data.append('available', false)
	posted_data.append('principal_image', article_info.querySelector('#soap_principal_image_input').files[0])

	if (article_info.querySelector('#soap_name_input').value == '' || article_info.querySelector('#soap_principal_ingredient_input').value == '' || article_info.querySelector('#soap_ingredient_input').value == '' || article_info.querySelector('#soap_description_input').value == '' || article_info.querySelector('#soap_image_1_input').files[0] === undefined || article_info.querySelector('#soap_image_2_input').files[0] === undefined || article_info.querySelector('#soap_image_3_input').files[0] === undefined || article_info.querySelector('#soap_principal_image_input').files[0] === undefined)
	{
		await error_message('minor_error', 'veuillez remplir tous les champs !!!!!!!!!!!')
		return
	}

	var get_data = await bearer_fetch('../api/article/', 'POST', posted_data, data_type='form_data')

	if(not_allow(get_data)) {
		return
	}

	if (get_data.name != undefined) {
		if (get_data.name[0] === 'article with this name already exists.') {
			await error_message('minor_error', 'nom deja utilisé')
			return
		} else if (get_data.name === article_info.querySelector('#soap_name_input').value) {
			change_page('article')
		} else {
			await error_message('major_error', 'erreur inattendu, veuillez contacter le service informatique svp mamouazelle')
		}
	}
	else {
		await error_message('major_error', 'erreur inattendu, veuillez contacter le service informatique svp mamouazelle')
	}
}


/* open */

for (let i = 0; i< product.length; i++) {
	product[i].addEventListener('click', async(event) => {
		var article_data = await bearer_fetch(`../api/article/${product[i].getAttribute('id')}`, 'GET')
		open_soap_info('modify', article_data)
	})
}

/* add new article option in innerHTML */

function add_new_article_option_in_innerHTML(event) {
	article_option_container.innerHTML += `
					<div class="article_option_separation" id='${article_option_lenght}'></div>
					<div class='article_option' id='${article_option_lenght}' article_id='${article_id}' save='false'>
						<div class="article_option_name_container">
							<label for="article_option_name_${article_option_lenght}">Nom :</label>
							<input type="text" name="article_option_name" value='Nouvelle option' id="article_option_name_${article_option_lenght}" onchange='put_save_on_false(event)'>
							<div style="flex: auto;"></div>
							<svg
								viewBox=' 0 0 600 600'
								id='ok_icon'
								class='info_icon'>
								<path stroke-width='90' stroke-linecap='round' stroke-linejoin='round' fill='none' d='M 150 350 L 300 500 L 500 150'></path>
							</svg>
						</div>
						<div class="article_option_cost_container">
							<label for="article_option_cost_${article_option_lenght}">cout :</label>
							<input type="number" name="article_option_cost" value='0' id="article_option_cost_${article_option_lenght}" onchange='put_save_on_false(event)'>
							<label for="article_option_cost">€</label>
						</div>
						<div class="article_option_masse_container">
							<label for="article_option_masse_${article_option_lenght}">poid :</label>
							<input type="number" name="article_option_masse" value='0' id="article_option_masse_${article_option_lenght}" onchange='put_save_on_false(event)'>
							<label for="article_option_masse_${article_option_lenght}"> en gramme</label>
						</div>
						<div class="article_option_stock_container">
							<label for="article_option_stock_${article_option_lenght}">stock :</label>
							<input type="number" name="article_option_stock" value='0' id="article_option_stock_${article_option_lenght}" onchange='put_save_on_false(event)'>
						</div>
						<div class="article_option_importance_container">
							<label for="article_option_importance_${article_option_lenght}">niveau d'apparation :</label>
							<input type="number" name="article_option_importance" value='0' id="article_option_importance_${article_option_lenght}" onchange='put_save_on_false(event)'>
						</div>
						<div class="submit_remove_button">
							<div style="flex: auto;"></div>
							<div class="gradient_border">
								<button class="save_button" in_creation='true' real_id='0' onclick='save_article_option(event)'>Sauvegarder</button>
							</div>
							<div class="gradient_border">
								<button class="remove_button" in_creation='true' real_id='0' onclick='remove_article_option(event)'>Supprimer</button>
							</div>
						</div>
					</div>`

	article_option_lenght += 1
}

/* save article option */

function put_save_on_false(event) {
	var parent = event.target.parentNode.parentNode
	parent.setAttribute('save', 'false')
}

async function save_article_option(event) {
	if (event.target.getAttribute('in_creation') === 'true') {
		var parent = event.target.parentNode.parentNode.parentNode
		var posted_data = {}

		posted_data['view_name'] = parent.querySelector('input[name="article_option_name"]').value
		posted_data['cost'] = parent.querySelector('input[name="article_option_cost"]').value
		posted_data['masse'] = parent.querySelector('input[name="article_option_masse"]').value
		posted_data['stock'] = parent.querySelector('input[name="article_option_stock"]').value
		posted_data['importance'] = parent.querySelector('input[name="article_option_importance"]').value
		posted_data['article'] = parent.getAttribute('article_id')

		if (parent.querySelector('input[name="article_option_name"]').value == '' || parent.querySelector('input[name="article_option_cost"]').value == '' || parent.querySelector('input[name="article_option_masse"]').value == '' || parent.querySelector('input[name="article_option_stock"]').value == '' || parent.querySelector('input[name="article_option_importance"]').value == '')
		{
			await error_message('minor_error', 'veuillez remplir tous les champs !!!!!!!!!!!')
			return
		}

		var data = await bearer_fetch('../api/article_options/', 'POST', posted_data)

		if(not_allow(data)) {
			return
		}
		else if (data.view_name === parent.querySelector('input[name="article_option_name"]').value) {
			parent.setAttribute('save', 'true')
			parent.querySelector('button[real_id="0"]').setAttribute('in_creation', 'false')
			parent.querySelector('button[real_id="0"]').setAttribute('real_id', data.id)
			parent.querySelector('button[real_id="0"]').setAttribute('in_creation', 'false')
			parent.querySelector('button[real_id="0"]').setAttribute('real_id', data.id) 
		}
		else if(data.non_field_errors[0] != null || data.non_field_errors[0] != undefined) {
			await error_message('minor_error', data.non_field_errors[0])
		}
		else {
			await error_message('major_error', 'erreur inattendu, veuillez contacter le service informatique svp mamouazelle')
		}

	} else {
		var parent = event.target.parentNode.parentNode.parentNode
		if(parent.getAttribute('save') == 'true') {
			return
		}
		var posted_data = {}

		posted_data['view_name'] = parent.querySelector('input[name="article_option_name"]').value
		posted_data['cost'] = parent.querySelector('input[name="article_option_cost"]').value
		posted_data['masse'] = parent.querySelector('input[name="article_option_masse"]').value
		posted_data['stock'] = parent.querySelector('input[name="article_option_stock"]').value
		posted_data['importance'] = parent.querySelector('input[name="article_option_importance"]').value
		posted_data['article'] = parent.getAttribute('article_id')

		if (parent.querySelector('input[name="article_option_name"]').value == '' || parent.querySelector('input[name="article_option_cost"]').value == '' || parent.querySelector('input[name="article_option_masse"]').value == '' || parent.querySelector('input[name="article_option_stock"]').value == '' || parent.querySelector('input[name="article_option_importance"]').value == '')
		{
			await error_message('minor_error', 'tous les champs ne sont pas remplient')
			return
		}

		var data = await bearer_fetch(`../api/article_options/${event.target.getAttribute('real_id')}/modify/`, 'POST', posted_data)

		if(not_allow(data)) {
			return
		}
		else if (data['detail'] != null || data['detail'] != undefined) {
			await error_message('minor_error', data['detail'])
		}
		else if (data['Modification'] === 'ok') {
			parent.setAttribute('save', 'true')
		}
		else {
			await error_message('major_error', 'erreur inattendu, veuillez contacter le service informatique svp mamouazelle')
		}

	}
}

/* remove article option */

async function remove_article_option(event) {
	if (event.target.getAttribute('in_creation') === 'true') {
		var parent = event.target.parentNode.parentNode.parentNode
		var his_bar = parent.previousElementSibling

		var next_element = parent.nextElementSibling
		var id = Number(parent.getAttribute('id'))
		while (next_element != null)
		{
			next_element.setAttribute('id', id)
			next_element = next_element.nextElementSibling
			next_element.setAttribute('id', id)
			next_element = next_element.nextElementSibling
			id+=1
		}

		parent.remove()
		his_bar.remove()

	} else {
		var data = await bearer_fetch(`../api/article_options/${event.target.getAttribute('real_id')}/remove/`, 'DELETE', null)

		if(not_allow(data)) {
			return
		}
		var parent = event.target.parentNode.parentNode.parentNode
		var his_bar = parent.previousElementSibling

		var next_element = parent.nextElementSibling
		var id = Number(parent.getAttribute('id'))
		while (next_element != null)
		{
			next_element.setAttribute('id', id)
			next_element = next_element.nextElementSibling
			next_element.setAttribute('id', id)
			next_element = next_element.nextElementSibling
			id+=1
		}

		parent.remove()
		his_bar.remove()
	}
}

/* modify article */

function put_article_save_on_false(event) {
	article_info.setAttribute('save', 'false')
}

async function modify_article(event) {
	if (article_info.getAttribute('save') == 'true') {
		return
	}

	var posted_data = new FormData()

	if (article_info.querySelector('#article_option_article_type').value != article_info.querySelector('#article_option_article_type').getAttribute('ancien_value')) {
		posted_data.append('article_type', article_info.querySelector('#article_option_article_type').value)
	}
	if (article_info.querySelector('#soap_name_input').value != article_info.querySelector('#soap_name_input').getAttribute('ancien_value')) {
		posted_data.append('name', article_info.querySelector('#soap_name_input').value)
	}
	if (article_info.querySelector('#soap_principal_ingredient_input').value != article_info.querySelector('#soap_principal_ingredient_input').getAttribute('ancien_value')) {
		posted_data.append('principal_ingredients', article_info.querySelector('#soap_principal_ingredient_input').value)
	}
	if (article_info.querySelector('#soap_ingredient_input').value != article_info.querySelector('#soap_ingredient_input').getAttribute('ancien_value')) {
		posted_data.append('ingredients', article_info.querySelector('#soap_ingredient_input').value)
	}
	if (article_info.querySelector('#soap_description_input').value != article_info.querySelector('#soap_description_input').getAttribute('ancien_value')) {
		posted_data.append('description', article_info.querySelector('#soap_description_input').value)
	}

	if (article_info.querySelector('#soap_principal_image_input').files[0] != undefined) {
		posted_data.append('principal_image', article_info.querySelector('#soap_principal_image_input').files[0])
	}
	if (article_info.querySelector('#soap_image_1_input').files[0] != undefined) {
		posted_data.append('image_1', article_info.querySelector('#soap_image_1_input').files[0])
	}
	if (article_info.querySelector('#soap_image_2_input').files[0] != undefined) {
		posted_data.append('image_2', article_info.querySelector('#soap_image_2_input').files[0])
	}
	if (article_info.querySelector('#soap_image_3_input').files[0] != undefined) {
		posted_data.append('image_3', article_info.querySelector('#soap_image_3_input').files[0])
	}

	if (article_info.querySelector('#soap_available_input').checked.toString() != article_info.querySelector('#soap_available_input').getAttribute('ancien_value')) {
		posted_data.append('available', article_info.querySelector('#soap_available_input').checked)
	}

	var get_data = await bearer_fetch(`../api/article/${article_info.getAttribute('article_id')}/modify/`, 'POST', posted_data, data_type='form_data')

	if(not_allow(get_data)) {
		return
	}
	else if (get_data['Modification'] === 'ok') {
		article_info.setAttribute('save', 'true')
		article_info.querySelector('#soap_name_title > span').innerHTML = article_info.querySelector('#soap_name_input').value
		article_info.querySelector('#article_option_article_type').setAttribute('ancien_value', article_info.querySelector('#article_option_article_type').value)
		article_info.querySelector('#soap_name_input').setAttribute('ancien_value', article_info.querySelector('#soap_name_input').value)
		article_info.querySelector('#soap_principal_ingredient_input').setAttribute('ancien_value', article_info.querySelector('#soap_principal_ingredient_input').value)
		article_info.querySelector('#soap_ingredient_input').setAttribute('ancien_value', article_info.querySelector('#soap_ingredient_input').value)
		article_info.querySelector('#soap_description_input').setAttribute('ancien_value', article_info.querySelector('#soap_description_input').value)
		article_info.querySelector('#soap_available_input').setAttribute('ancien_value', article_info.querySelector('#soap_available_input').checked)

		article_in_menu = document.querySelector(`.product[id='${article_info.getAttribute('article_id')}']`)
		article_in_menu.querySelector('.product_name').innerHTML = article_info.querySelector('#soap_name_input').value
		article_in_menu.querySelector('.product_major_ingredients').innerHTML = article_info.querySelector('#soap_principal_ingredient_input').value
	}
	else {
		await error_message('major_error', 'erreur inattendu, veuillez contacter le service informatique svp mamouazelle')
	}
}

/* remove article */

async function remove_article(event) {
	var data = await bearer_fetch(`../api/article/${article_info.getAttribute('article_id')}/remove/`, 'DELETE', null)

	if(not_allow(data)) {
		return
	}
	else if (data[`Object ${article_info.getAttribute('article_id')}`] === 'remove') {
		change_page('article')
	}
	else {
		await error_message('major_error', 'erreur inattendu, veuillez contacter le service informatique svp mamouazelle')
	}
}