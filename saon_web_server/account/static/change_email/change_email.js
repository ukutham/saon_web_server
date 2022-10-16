var compte_validation_mail = document.querySelector('.compte_state_validation > .gradient_border')

compte_validation_mail.addEventListener('click', async (event) => {
	var compte_new_mail = document.getElementById('compte_state_change_mail_input').value

	const body = {
		"email": compte_new_mail,
	}

	var status = await bearer_fetch(`${window.location.origin}/api/account/change_email/`, 'POST', body)
	
	if (status['email'] != undefined && status['email'] != 'ok') {
		document.getElementById('mail_error_message').innerHTML = status['email']
	} else if (status['email'] === "ok") {
		window.location = `${window.location.origin}/?page=account`
	}
})