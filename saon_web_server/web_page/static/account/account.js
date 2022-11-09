var page_name = document.getElementById('account_page_identification').getAttribute('page_name')

/* CONNECTION */

document.onkeydown = (e) => {
  if (e.key === "Enter") {
    document.activeElement.click();
 }
}

if (page_name === 'connection') {

	if (document.getElementById('compte_connection_input_mail_input').value != "") {
		document.getElementById('compte_connection_input_mail_label').style.transform = 'translateY(0px)'
	}

	function InputValueChange(event) {
		if (event.target.value != "") {
			event.target.nextElementSibling.style.transform = 'translateY(0px)'
		} else {
			event.target.nextElementSibling.style.transform = ''
		}
	}

	/*var compte_creation_input_type_option_gradient_border = document.getElementById('compte_creation_input_type_option_gradient_border')

	var compte_creation_input_type_label = document.getElementById('compte_creation_input_type_label')

	compte_creation_input_type_label.addEventListener('click', (event) => {
		if (compte_creation_input_type_option_gradient_border.getAttribute('open') === 'false') {
			compte_creation_input_type_option_gradient_border.setAttribute('open', 'true')
			compte_creation_input_type_label.querySelector('svg').setAttribute('open', 'true')
		} else {
			compte_creation_input_type_option_gradient_border.setAttribute('open', 'false')
			compte_creation_input_type_label.querySelector('svg').setAttribute('open', 'false')
		}
	})

	var compte_creation_input_type_option = document.getElementsByClassName('compte_creation_input_type_option')

	var compte_creation_container = document.getElementById('compte_creation_container')

	for (let i = 0; i < compte_creation_input_type_option.length; i++) {
		compte_creation_input_type_option[i].querySelector('label').addEventListener('click', (event) => {
			compte_creation_input_type_label.querySelector('span').innerHTML = compte_creation_input_type_option[i].querySelector('label').innerHTML

			compte_creation_container.setAttribute('type', compte_creation_input_type_option[i].querySelector('label').getAttribute('type'))
		})
	} */

	var password_input_show = document.getElementsByClassName('password_input_show')

	for (let i = 0; i < password_input_show.length; i++) {
		password_input_show[i].addEventListener('click', (event) => {
			if (password_input_show[i].getAttribute('show_password') === 'false') {
				password_input_show[i].previousElementSibling.querySelector('input').setAttribute('type', 'text')
				password_input_show[i].setAttribute('show_password', 'true')
			} else {
				password_input_show[i].previousElementSibling.querySelector('input').setAttribute('type', 'password')
				password_input_show[i].setAttribute('show_password', 'false')
			}
		})
	}

	var scroller_text = document.getElementsByClassName('scroller_text')
	var compte_container = document.getElementById('compte_container')

	for (let i = 0; i < scroller_text.length; i++) {
		scroller_text[i].addEventListener('click', (event) => {
			compte_container.style.transform = `translateY(${scroller_text[i].getAttribute('position')}%)`
		})
	}

	var compte_connection_input_send = document.getElementById('compte_connection_input_send')
	var response = undefined

	compte_connection_input_send.addEventListener('click', async (event) => {
		const url = "/api/token/"

		const data = {
			"email": document.getElementById('compte_connection_input_mail_input').value,
			"password": document.getElementById('compte_connection_input_password_input').value,
		}

		const options = {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
			},
		}

		await fetch(url, options)
		.then((res) => {
			if (!(res.ok)) {
				throw res.status
			}
			response = res
			return res.json()
		})
		.then((res) => {
			window.sessionStorage.accessToken = res.access
			window.sessionStorage.refreshToken = res.refresh
			change_page('account')
		})
		.catch((err_status) => {
			var compte_connection_error_message = document.querySelector('#compte_connection_error_message > span')
			if (err_status === 400) {
				compte_connection_error_message.innerHTML = "votre addresse mail et votre mot de passe sont vide"
			}
			else if (err_status === 401) {
				compte_connection_error_message.innerHTML = "addresse mail ou mot de passe incorrect"
			}
			else {
				compte_connection_error_message.innerHTML = `${err_status} error`
			}
			document.querySelector('#compte_connection_error_message').style.display = "flex"
		})
	})

	var compte_creation_submit_button = document.getElementById('compte_creation_submit_input')

	compte_creation_submit_button.addEventListener('click', (event) => {
		var compte_connection_error = document.getElementsByClassName('compte_connection_error')
		for (let i = 0; i<compte_connection_error.length; i++) {
			compte_connection_error[i].innerHTML = ""
		}

		var compte_creation_people_name_input = document.getElementById('compte_creation_people_name_input').value
		var compte_creation_people_surname_input = document.getElementById('compte_creation_people_surname_input').value
		var compte_creation_people_phonenumber_input = document.getElementById('compte_creation_people_phonenumber_input').value
		var compte_creation_email_value = document.getElementById('compte_creation_people_mail_input').value
		var compte_creation_password_value = document.getElementById('compte_creation_people_password_input').value
		var compte_creation_confirm_password = document.getElementById('compte_creation_people_confirm_password_input').value

		if (compte_creation_password_value === compte_creation_confirm_password) {
			const options = {
				method: 'POST',
				headers: {
					'Accept': "application/json",
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken'),
				},
				body: JSON.stringify({
					'name' : compte_creation_people_name_input,
					'surname' : compte_creation_people_surname_input,
					'phone_number': compte_creation_people_phonenumber_input,
					'email': compte_creation_email_value,
					'password': compte_creation_password_value,
					'is_proffesional': false,
				}),
			}

			fetch('api/account/', options)
			.then(async (res) => {
				if (!(res.ok)) {
					throw await res.json()
				}
				return res.json()
			})
			.then(async (data) => {
				get_token_options = {
					method: 'POST',
					body: JSON.stringify({
						'email': compte_creation_email_value,
						'password': compte_creation_password_value,
					}),
					headers: {
						'Accept': "application/json",
						'Content-Type': 'application/json',
						'X-CSRFToken': getCookie('csrftoken'),
					},
				}

				await fetch('api/token/', get_token_options)
				.then((response) => {
					return response.json()
				})
				.then((response) => {
					window.sessionStorage.accessToken = response.access
					window.sessionStorage.refreshToken = response.refresh
					window.location = '/account/mail_send_page'
				})
			})
			.catch(error => {
				if (error['non_field_errors'] != undefined) {
					document.getElementById('compte_creation_general_error').innerHTML = error['non_field_errors'][0]
				}
				if (error[0] != undefined) {
					document.getElementById('compte_creation_general_error').innerHTML = error[0]
				}
				if (error['name'] != undefined) {
					document.getElementById('compte_creation_name_error').innerHTML = error['name']
				}
				if (error['surname'] != undefined) {
					document.getElementById('compte_creation_surname_error').innerHTML = error['surname']
				}
				if (error['phone_number'] != undefined) {
					document.getElementById('compte_creation_phonenumber_error').innerHTML = error['phone_number']
				}
				if (error['email'] != undefined) {
					document.getElementById('compte_creation_mail_error').innerHTML = error['email']
				}
				if (error['password'] != undefined) {
					document.getElementById('compte_creation_password_error').innerHTML = error['password']
				}
				console.log('error : '+error)
			})

		} else {
			document.getElementById('compte_creation_confirm_error').innerHTML = 'le mot de passe de confirmation ne correspond pas'
		}
		/*
		var compte_creation_type_value = document.querySelector('#compte_creation_input_type_label > span').innerHTML

		if (compte_creation_type_value === 'particulier') {
			var compte_creation_people_name_input = document.getElementById('compte_creation_people_name_input').value
			var compte_creation_people_surname_input = document.getElementById('compte_creation_people_surname_input').value
			var compte_creation_people_phonenumber_input = document.getElementById('compte_creation_people_phonenumber_input').value
			var compte_creation_email_value = document.getElementById('compte_creation_people_mail_input').value
			var compte_creation_password_value = document.getElementById('compte_creation_people_password_input').value
			var compte_creation_confirm_password = document.getElementById('compte_creation_people_confirm_password_input').value

			if (compte_creation_password_value === compte_creation_confirm_password) {
				const options = {
					method: 'POST',
					headers: {
						'Accept': "application/json",
						'Content-Type': 'application/json',
						'X-CSRFToken': getCookie('csrftoken'),
					},
					body: JSON.stringify({
						'name' : compte_creation_people_name_input,
						'surname' : compte_creation_people_surname_input,
						'phone_number': compte_creation_people_phonenumber_input,
						'email': compte_creation_email_value,
						'password': compte_creation_password_value,
						'is_proffesional': false,
					}),
				}

				fetch('api/account/', options)
				.then(async (res) => {
					if (!(res.ok)) {
						throw await res.json()
					}
					return res.json()
				})
				.then(async (data) => {
					get_token_options = {
						method: 'POST',
						body: JSON.stringify({
							'email': compte_creation_email_value,
							'password': compte_creation_password_value,
						}),
						headers: {
							'Accept': "application/json",
							'Content-Type': 'application/json',
							'X-CSRFToken': getCookie('csrftoken'),
						},
					}

					await fetch('api/token/', get_token_options)
					.then((response) => {
						return response.json()
					})
					.then((response) => {
						window.sessionStorage.accessToken = response.access
						window.sessionStorage.refreshToken = response.refresh
						window.location = '/account/mail_send_page'
					})
				})
				.catch(error => {
					if (error['non_field_errors'] != undefined) {
						document.getElementById('compte_creation_general_error').innerHTML = error['non_field_errors'][0]
					}
					if (error[0] != undefined) {
						document.getElementById('compte_creation_general_error').innerHTML = error[0]
					}
					if (error['name'] != undefined) {
						document.getElementById('compte_creation_name_error').innerHTML = error['name']
					}
					if (error['surname'] != undefined) {
						document.getElementById('compte_creation_surname_error').innerHTML = error['surname']
					}
					if (error['phone_number'] != undefined) {
						document.getElementById('compte_creation_phonenumber_error').innerHTML = error['phone_number']
					}
					if (error['email'] != undefined) {
						document.getElementById('compte_creation_mail_error').innerHTML = error['email']
					}
					if (error['password'] != undefined) {
						document.getElementById('compte_creation_password_error').innerHTML = error['password']
					}
					console.log('error : '+error)
				})

			} else {
				document.getElementById('compte_creation_confirm_error').innerHTML = 'le mot de passe de confirmation ne correspond pas'
			}

		} else if (compte_creation_type_value === 'professionnel') {
			var compte_creation_prof_name_input = document.getElementById('compte_creation_prof_name_input').value
			var compte_creation_prof_surname_input = document.getElementById('compte_creation_prof_surname_input').value
			var compte_creation_prof_phonenumber_input = document.getElementById('compte_creation_prof_phonenumber_input').value
			var compte_creation_email_value = document.getElementById('compte_creation_prof_mail_input').value
			var compte_creation_password_value = document.getElementById('compte_creation_prof_password_input').value
			var compte_creation_confirm_password = document.getElementById('compte_creation_prof_confirm_password_input').value
			var compte_creation_siren = document.getElementById('compte_creation_prof_siren_input').value

			if (compte_creation_password_value === compte_creation_confirm_password) {
				const options = {
					method: 'POST',
					headers: {
						'Accept': "application/json",
						'Content-Type': 'application/json',
						'X-CSRFToken': getCookie('csrftoken'),
					},
					body: JSON.stringify({
						'name': compte_creation_prof_name_input,
						'surname' : compte_creation_prof_surname_input,
						'phone_number' : compte_creation_prof_phonenumber_input,
						'email': compte_creation_email_value,
						'password': compte_creation_password_value,
						'siren': compte_creation_siren,
						'is_proffesional': true,
					}),
				}

				fetch('api/account/', options)
				.then(async (res) => {
					if (!(res.ok)) {
						throw await res.json()
					}
					return res.json()
				})
				.then(async (data) => {
					get_token_options = {
						method: 'POST',
						body: JSON.stringify({
							'email': compte_creation_email_value,
							'password': compte_creation_password_value,
						}),
						headers: {
							'Accept': "application/json",
							'Content-Type': 'application/json',
							'X-CSRFToken': getCookie('csrftoken'),
						},
					}

					await fetch('api/token/', get_token_options)
					.then((response) => {
						return response.json()
					})
					.then((response) => {
						window.sessionStorage.accessToken = response.access
						window.sessionStorage.refreshToken = response.refresh
						window.location = '/account/mail_send_page'
					})
				})
				.catch(error => {
					console.log(error)

					if (error['non_field_errors'] != undefined) {
						if (error['non_field_errors'][0] === "siren non valide") {
							document.getElementById('compte_creation_siren_error').innerHTML = error['non_field_errors'][0]
						} else {
							document.getElementById('compte_creation_general_error').innerHTML = error['non_field_errors'][0]
						}
					}
					if (error[0] != undefined) {
						document.getElementById('compte_creation_general_error').innerHTML = error[0]
					}
					if (error['name'] != undefined) {
						document.getElementById('compte_creation_prof_name_error').innerHTML = error['name']
					}
					if (error['surname'] != undefined) {
						document.getElementById('compte_creation_prof_surname_error').innerHTML = error['surname']
					}
					if (error['phone_number'] != undefined) {
						document.getElementById('compte_creation_prof_phonenumber_error').innerHTML = error['phone_number']
					}
					if (error['email'] != undefined) {
						document.getElementById('compte_creation_prof_mail_error').innerHTML = error['email']
					}
					if (error['password'] != undefined) {
						document.getElementById('compte_creation_prof_password_error').innerHTML = error['password']
					}
					if (error['siren'] != undefined) {
						document.getElementById('compte_creation_siren_error').innerHTML = error['siren']
					}
				})

			} else {
				document.getElementById('compte_creation_prof_confirm_error').innerHTML = 'le mot de passe de confirmation ne correspond pas'
			}
		}
		*/
	})
}

/* COMPTE STATE */

if (page_name === 'account') {

	/* open and close the popup for add new address */

	var compte_state_dashbord_add_button_container = document.getElementsByClassName('compte_state_dashbord_add_button_container')[0]
	if (compte_state_dashbord_add_button_container != undefined)
	{
		compte_state_dashbord_add_button_container.children[0].addEventListener('click', (event) => {
			if (compte_state_dashbord_add_button_container.getAttribute('open') === 'false') {
				compte_state_dashbord_add_button_container.setAttribute('open', 'true')
			} else {
				compte_state_dashbord_add_button_container.setAttribute('open', 'false')
			}
		})
	}

	/* close th popup for add new address */

	var compte_state_dashbord_add_del = document.getElementsByClassName('compte_state_dashbord_add_del')[0]
	if (compte_state_dashbord_add_del != undefined) {
		compte_state_dashbord_add_del.addEventListener('click', (event) =>  {
			if (compte_state_dashbord_add_button_container.getAttribute('open') === 'false') {
				compte_state_dashbord_add_button_container.setAttribute('open', 'true')
			} else {
				compte_state_dashbord_add_button_container.setAttribute('open', 'false')
			}
	})
	}


	var password_input_show = document.getElementsByClassName('password_input_show')

	for (let i = 0; i < password_input_show.length; i++) {
		password_input_show[i].addEventListener('click', (event) => {
			if (password_input_show[i].getAttribute('show_password') === 'false') {
				password_input_show[i].previousElementSibling.setAttribute('type', 'text')
				password_input_show[i].setAttribute('show_password', 'true')
			} else {
				password_input_show[i].previousElementSibling.setAttribute('type', 'password')
				password_input_show[i].setAttribute('show_password', 'false')
			}
		})
	}

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

	var compte_title = document.getElementById('compte_title')
	var compte_order_title = document.getElementById('compte_order_title')

	var compte_state_content = document.getElementById('compte_state_content')
	var compte_order = document.getElementById('compte_order')

	compte_title.addEventListener('click', (event) => {
		compte_title.setAttribute('select', 'true')
		compte_order_title.setAttribute('select', 'false')

		compte_state_content.setAttribute('open', 'true')
		compte_order.setAttribute('open', 'false')
	})
	compte_order_title.addEventListener('click', (event) => {
		compte_order_title.setAttribute('select', 'true')
		compte_title.setAttribute('select', 'false')

		compte_state_content.setAttribute('open', 'false')
		compte_order.setAttribute('open', 'true')
	})

	var compte_log_out_button = document.getElementById('compte_log_out_button')

	compte_log_out_button.addEventListener('click', (event) => {
		window.sessionStorage.clear();
		change_page('account')
	})

	// name surname //

	var compte_state_name_surname = document.querySelector('#compte_state_name_surname > .compte_state_validation > .gradient_border')

	compte_state_name_surname.addEventListener('click', async (event) => {
		var compte_new_name = document.getElementById('compte_state_change_name_input').value
		var compte_new_surname = document.getElementById('compte_state_change_surname_input').value

		const body = {
			"name": compte_new_name,
			"surname": compte_new_surname,
		}

		var status = await bearer_fetch('api/account/change_name_surname/', 'POST', body)
		
		if (status['name'] != undefined) {
			document.getElementById('name_surname_error_message').innerHTML = status['name']
		} else if (status['surname'] != undefined) {
			document.getElementById('name_surname_error_message').innerHTML = status['surname']
		} else {
			change_page('account')
		}
	})

	// phone_number //

	var compte_state_phonenumber = document.querySelector('#compte_state_phonenumber > .compte_state_validation > .gradient_border')

	compte_state_phonenumber.addEventListener('click', async (event) => {
		var compte_new_phone_number = document.getElementById('compte_state_change_phonenumber_input').value

		const body = {
			"phone_number": compte_new_phone_number,
		}

		var status = await bearer_fetch('api/account/change_phone_number/', 'POST', body)
		
		if (status['phone_number'] != undefined) {
			document.getElementById('phonenumber_error_message').innerHTML = status['phone_number']
		} else {
			change_page('account')
		}
	})

	// email //

	var compte_validation_mail = document.querySelector('#compte_state_mail > .compte_state_validation > .gradient_border')

	compte_validation_mail.addEventListener('click', async (event) => {
		var compte_new_mail = document.getElementById('compte_state_change_mail_input').value

		const body = {
			"email": compte_new_mail,
		}

		var status = await bearer_fetch('api/account/change_email/', 'POST', body)
		console.log(status)
		
		if (status['email'] != 'ok') {
			document.getElementById('mail_error_message').innerHTML = status['email']
		} else {
			change_page('account')
		}
	})

	// password //

	var compte_state_password = document.querySelector('#compte_state_password > .compte_state_validation > .gradient_border')

	compte_state_password.addEventListener('click', async (event) => {
		var old_password = document.getElementById('compte_state_change_password_basic_input').value
		var new_password = document.getElementById('compte_state_change_password_new_input').value
		var second_new_password = document.getElementById('compte_state_change_password_confirm_input').value

		if (new_password === second_new_password) {
			const body = {
				"old_password": old_password,
				"new_password": new_password,
			}

			var status = await bearer_fetch('api/account/change_password/', 'POST', body)
			
			if (status['password'] != undefined) {
				document.getElementById('password_error_message').innerHTML = status['password']
			} else if (status['request'] == 'ok') {
				document.getElementById('compte_state_change_password_basic_input').value = ""
				document.getElementById('compte_state_change_password_new_input').value = ""
				document.getElementById('compte_state_change_password_confirm_input').value = ""

				document.getElementById('password_validation_message').innerHTML = 'votre mot de passe à bien été modifier'
			}
		} else {
			document.getElementById('password_error_message').innerHTML = 'les mots de passe ne correspondent pas'
		}
	})


	/* add new address */

	var compte_state_dashbord_add_confirm = document.getElementsByClassName('compte_state_dashbord_add_confirm')[0]

	var compte_state_dashbord_add_error = document.getElementById('compte_state_dashbord_add_error')

	var compte_state_dashbord_content = document.getElementsByClassName('compte_state_dashbord_content')

	if (compte_state_dashbord_add_confirm != undefined) {
		compte_state_dashbord_add_confirm.addEventListener('click', async (event) => {
			var rue = document.querySelector('.compte_state_dashbord_add_input input[placeholder="rue"]').value
			var ville = document.querySelector('.compte_state_dashbord_add_input input[placeholder="ville"]').value
			var pays = document.querySelector('.compte_state_dashbord_add_input input[placeholder="pays"]').value

			if (rue === "" || ville === "" || pays === "")
			{
				compte_state_dashbord_add_error.innerHTML = "Veuillez remplir tous les champs"
			} else {
				const body = {
					'rue': rue,
					'ville': ville,
					'pays': pays,
				}

				var data = await bearer_fetch('api/delivery_choice/', 'POST', body)

				if (data.details != "success") {
					compte_state_dashbord_add_error.innerHTML = data.details
				} else {
					compte_state_dashbord_add_error.innerHTML = ""
					document.querySelector('.compte_state_dashbord_add_input input[placeholder="rue"]').value = ""
					document.querySelector('.compte_state_dashbord_add_input input[placeholder="ville"]').value = ""
					document.querySelector('.compte_state_dashbord_add_input input[placeholder="pays"]').value = ""

					var all_address = ""
					compte_state_dashbord_content = document.getElementsByClassName('compte_state_dashbord_content')

					for (let i = 0; i < compte_state_dashbord_content.length; i++)
					{
						all_address += `<div class='compte_state_dashbord_content' id='${compte_state_dashbord_content[i].getAttribute('id')}'>` + compte_state_dashbord_content[i].innerHTML + "</div>"
					}
					all_address += `<div class='compte_state_dashbord_content' id='${data.id}'><div class='compte_state_addr_dashbord_content_addr'>${data.new_address}</div><div style='flex: auto'></div><div class='compte_state_dashbord_content_del'><svg height='30'width='30'viewBox='0 0 100 100'><path fill='none' stroke='#ba2d0b' stroke-width='15' stroke-linecap='round' stroke-linejoin='round' d='M 20 20 L 80 80 z M 80 20 L 20 80 z'/></svg></div></div>`
					document.getElementById('compte_state_dashbord_content_container').innerHTML = all_address
					compte_state_dashbord_content = document.getElementsByClassName('compte_state_dashbord_content')

					for (let i = 0; i < compte_state_dashbord_content.length; i++)
					{
						compte_state_dashbord_content[i].querySelector('.compte_state_dashbord_content_del').addEventListener('click', (event) => {
							address_remover(compte_state_dashbord_content[i])
						})
					}
				}
			}
		})
	}

	for (let i = 0; i < compte_state_dashbord_content.length; i++)
	{
		compte_state_dashbord_content[i].querySelector('.compte_state_dashbord_content_del').addEventListener('click', (event) => {
			address_remover(compte_state_dashbord_content[i])
		})
	}

	async function address_remover(address){
		var id = address.getAttribute('id')

		let data = await bearer_fetch(`api/delivery_choice/${id}/remove`, 'DELETE')

		if (data.Object === 'remove') {
			address.remove()
		}
	}


	
	var remove_account_button = document.getElementById('remove_account_button')
	var remove_pop_up_cache = document.getElementById('remove_pop_up_cache')

	remove_account_button.addEventListener('click', async (event) => {
		remove_pop_up_cache.setAttribute('open', 'true')
	})

	var remove_pop_up_choide_yes = document.getElementById('remove_pop_up_choide_yes')
	var remove_pop_up_choide_no = document.getElementById('remove_pop_up_choide_no')

	remove_pop_up_choide_yes.addEventListener('click', async (event) => {
		var data = await bearer_fetch('api/account/remove/', 'DELETE')

		window.location.reload(true)
	})

	remove_pop_up_choide_no.addEventListener('click', (event) => {
		remove_pop_up_cache.setAttribute('open', 'false')
	})

	/* get facture */

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

}

/* go_to_mail_send_page */

if (page_name === 'go_to_mail_send_page') {
	window.location = "account/mail_send_page"
}