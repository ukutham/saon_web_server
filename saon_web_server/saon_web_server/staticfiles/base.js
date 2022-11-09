document.onkeydown = (e) => {
  if (e.key === "Enter") {
    document.activeElement.click();
 }
}

/* sleep */

function sleep(ms) {
	return new Promise(ILoveUkrain => setTimeout(ILoveUkrain, ms))
}

/* getCookie */

function getCookie(cname) {
	let name = cname + "=";
	let ca = document.cookie.split(';');
	for(let i = 0; i < ca.length; i++) {
	    let c = ca[i];
	    while (c.charAt(0) == ' ') {
	      c = c.substring(1);
	    }
	    if (c.indexOf(name) == 0) {
	      return c.substring(name.length, c.length);
	    }
	}
	return "";
}

/* setCookie */

function setCookie(c_name, value, exdays) {
	var exdate = new Date()
	exdate.setDate(exdate.getDate() + exdays)
	var c_value = escape(value) + ((exdays == null) ? "" : ("; expires="+exdate.toUTCString())) + '; samesite=lax'
	document.cookie=c_name + "=" + c_value
}

/* error message */

async function error_message(type, message) {
	let error_container = document.getElementById('error_container')
	let minor_error = document.getElementById('minor_error')
	let major_error = document.getElementById('major_error')
	let error_text = document.getElementById('error_text')

	error_container.style.display = 'flex'
	if (type === 'minor_error') {
		minor_error.style.display = 'block'
		major_error.style.display = 'none'
	} else {
		minor_error.style.display = 'none'
		major_error.style.display = 'block'
	}

	error_text.innerHTML = message

	await sleep(4000)
	error_container.style.display = 'none'
}

/* TOKEN */

function set_access_token(accessToken) {
	window.sessionStorage.accessToken = accessToken
}

function set_refresh_token(refreshToken) {
	window.sessionStorage.refreshToken = refreshToken
}

function get_access_token() {
	return window.sessionStorage.accessToken
}

function get_refresh_token() {
	return window.sessionStorage.refreshToken
}

/* get header */

function get_headers() {
	var GlobalHearders = new Headers()
	if (get_access_token() != undefined) {
		GlobalHearders.append('Authorization', `Bearer ${window.sessionStorage.accessToken}`)
	}
	GlobalHearders.append('Accept', "application/json")
	GlobalHearders.append('Content-Type', 'application/json')
	GlobalHearders.append('X-CSRFToken', getCookie('csrftoken'))
	return GlobalHearders
}

function get_headers_without_Ct() {
	var GlobalHearders = new Headers()
	if (get_access_token() != undefined) {
		GlobalHearders.append('Authorization', `Bearer ${window.sessionStorage.accessToken}`)
	}
	GlobalHearders.append('X-CSRFToken', getCookie('csrftoken'))
	return GlobalHearders
}

/* refresh_token */

async function refresh_token() {
	if (get_refresh_token() === undefined) {
		return("unconnected")
	}

	var options = {
			method: 'POST',
			headers: {
				'Accept': "application/json",
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			},
			body: JSON.stringify({
				'refresh': get_refresh_token(),
			}),
		}

	return_value = await fetch(`${window.location.origin}/api/token/refresh/`, options)
	.then(res => {
		if (!(res.ok)) {
			throw res.status
		}
		return res.json()
	})
	.then(new_token => {
		set_access_token(new_token.access)
		return('ok')
	})
	.catch(status_error => {
		if (status_error === 401) {
			return("unconnected")
		} else {
			error_message('minor_error', status_error)
			console.log(status_error)
			return status_error
		}
	})
	return return_value
}

/* bearer_fetch */

async function bearer_fetch(url, method, body_request, data_type='json') {
	let status = null
	let data = null
	let res = null

	let options = null

	if (method == 'POST') {
		if(data_type === 'form_data') {
			options = {
				method: method,
				headers: get_headers_without_Ct(),
				body: body_request,
			}
		} else {
			options = {
				method: method,
				headers: get_headers(),
				body: JSON.stringify(body_request),
			}
		}
	}
	else {
		options = {
			method: method,
			headers: get_headers(),
		}
	}

	res = await fetch(url, options)
	status = res.status
	if (data_type === 'json' || data_type === 'form_data') {
		data = await res.json()
	} else if (data_type === 'text') {
		data = await res.text()
	} else if (data_type === 'blob') {
		data = await res.blob()
	}

	if (status === 401) {
		refresh_status = await refresh_token()

		if (refresh_status == 'unconnected') {
			error_message('minor_error', "Veuillez vous connecter")
			sessionStorage.removeItem('refreshToken')
			sessionStorage.removeItem('accessToken')
			return {}

		} else if (refresh_status == 'ok') {
			options.headers = get_headers()

			res = await fetch(url, options)
			status = res.status

			if (data_type === 'json') {
				data = await res.json()
			} else if (data_type === 'text') {
				data = await res.text()
			} else if (data_type === 'blob') {
				data = await res.blob()
			}

			return data

		} else {
			error_message("major_error", 'Error : '+refresh_status)
		}
	}
	return data
}