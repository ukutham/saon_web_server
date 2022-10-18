let nav_icon = document.getElementsByClassName('nav_icon')

function navigation_pointer(icon_select) {
  for (let i of nav_icon) {
  	i.setAttribute('select', 'false')
  }

  icon_select.setAttribute('select', 'true')
}

let page = document.getElementById('page_content')
let nav_bar_loader_container = document.getElementById('nav_bar_loader_container')

let script = null
let scripts_import = []

async function change_page(page_name) {
	if (page_name == null) {
		page_name = 'article'
	}

	nav_bar_loader_container.style.display = 'flex'

	data = await bearer_fetch(`${page_name}`, 'GET', null, 'text')

	if (data.constructor === Object) {
		data = await bearer_fetch(`${page_name}`, 'GET', null, 'text')
	}

	if (Object.keys(data).length == 0 || data['detail'] != undefined) {
		if (data['detail'] != undefined) {
			error_message('major_error', data['detail'])
		}

		nav_bar_loader_container.style.display = 'none'
	}

	if (data === '{"detail":"User not found","code":"user_not_found"}') {
		sessionStorage.removeItem('refreshToken')
		sessionStorage.removeItem('accessToken')
		data = await bearer_fetch(`${page_name}`, 'GET', null, 'text')
	}

	document.getElementById('page_content').style.display = 'none'
	document.getElementById('page_content').innerHTML = data

	if (!(script == null)) {
		document.head.removeChild(script)
	}

	script = document.createElement('script')
	script.src = `/static/${page_name}/${page_name}.js`
	if (!(script.src.includes('?'))) {
		document.head.appendChild(script)
	}

	window.history.pushState("", "", `?page=${page_name}`)

	nav_bar_loader_container.style.display = 'none'
	document.getElementById('page_content').style.display = 'block'
}
change_page(page.getAttribute('page'))

for (let i of nav_icon) {
  i.addEventListener('click', async (event) => {
  	navigation_pointer(i)
  	change_page(i.getAttribute('page'))
  })
}
