let nav_pointer = document.querySelector('#nav_bar_pointer_container > div')

let all_label_nav = document.getElementsByClassName('label_nav_icon')
let all_nav_radio = document.getElementsByClassName("nav_radio")

navigation_pointer(document.querySelector('input[name="nav_radio"]:checked').getAttribute('position_pointer'), 
  document.querySelector('input[name="nav_radio"]:checked').nextElementSibling,
)

function navigation_pointer(posi_pointer, label_select) {
  nav_pointer.style.marginLeft = posi_pointer

  for (let i of all_label_nav) {
  	i.classList.remove('label_nav_icon_select')
  }

  label_select.classList.add('label_nav_icon_select')
}

let page = document.getElementById('page_content').getAttribute('page')
let nav_bar_loader_container = document.getElementById('nav_bar_loader_container')

let script = null
let scripts_import = []

async function change_page(page_name) {
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
	document.head.appendChild(script)

	window.history.pushState("", "", `/?page=${page_name}`)

	nav_bar_loader_container.style.display = 'none'
	document.getElementById('page_content').style.display = 'block'
}

change_page(page)

for (let i of all_label_nav) {
  i.addEventListener('click', async (event) => {
  	navigation_pointer(i.getAttribute('position_pointer'), i)
  	change_page(i.getAttribute('page'))
  })
}
