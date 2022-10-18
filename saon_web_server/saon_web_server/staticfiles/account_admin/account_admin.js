async function search_account(event) {
	document.getElementById('all_account').setAttribute('display', 'false')
	document.getElementById('loading_search').setAttribute('display', 'true')

	var data = await bearer_fetch('account_admin/search_account/', 'POST', {'account': event.target.value})

	all_account = ''

	for (account in data['all_acccount'])
	{
		all_account += `<div class="gradient_border gradient_border_account" open='false'>
							<div style="background: white; border-radius: 10px; height: 100%; overflow: hidden;">
		   						<div class="account" tabindex="0" role='button'>
									<div class="account_name_surname">
		    							${ data['all_acccount'][account].name } ${ data['all_acccount'][account].surname }
		    						</div>
		    						<div class="account_email">
		    							${ data['all_acccount'][account].email }
		    						</div>
		    						<div class="account_tel">
		    							${ data['all_acccount'][account].phone_number }
		    						</div>
		    					</div>
		   					</div>
						</div>`
	}

	document.getElementById('all_account').innerHTML = all_account

	document.getElementById('all_account').setAttribute('display', 'true')
	document.getElementById('loading_search').setAttribute('display', 'false')
}