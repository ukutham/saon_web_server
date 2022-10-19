var	script_FileSaver = document.createElement('script')
script_FileSaver.src = `/static/extern_module/FileSaver.js`
document.head.appendChild(script_FileSaver)

async function get_facture(event) {
	date = event.target.getAttribute('date')
	var facture = await bearer_fetch(`comptability/get_facture/${date}/`, 'GET', null, 'blob')
	saveAs(facture, `SAON_factures_of_${date}.pdf}`);
}