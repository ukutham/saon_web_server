import sys, os
from zipfile import ZipFile
import pathlib
import re

from msoffice2pdf import convert

class odtRender:
	def __init__(self, filename, source=None):
		self.filename = filename
		if source == None:
			self.source = filename
		else:
			self.source = source


	def extract_file_to_source(self, file,new_source_name=None):
		if new_source_name == None:
			self.source = f'{self.filename}/src'
		else:
			self.source = f'{self.filename}/{str(new_source_name)}'

		with ZipFile(file, 'r') as zipped_file:
			zipped_file.extractall(self.source)

		os.rename(f'{self.source}/content.xml', f'{self.source}/unfinished_content.xml')

	def render(self, data, filename, new_directory = '/home/'):
		with open(f'{self.source}/unfinished_content.xml', 'r') as unfinished_content:
			with open(f'{self.source}/content.xml', 'w') as content:
				doc = unfinished_content.read()

				for key in data:
					doc = doc.replace(f"{{{key}}}", str(data[key]))

				content_codes = []
				restant_text = doc

				while restant_text.find('{%') != -1 and restant_text.find('%}') != -1:
					content_codes.append([])

					idx1 = restant_text.index("{%")
					idx2 = restant_text.index("%}")
					  
					content_codes[-1].append(restant_text[idx1 + len("{%") + 1: idx2])

					a, b, restant_text = restant_text.partition('%}')

					if restant_text.find('{%') != -1 and restant_text.find('%}') != -1:
						idx1 = restant_text.index("{%")
						idx2 = restant_text.index("%}")

						content_codes[-1].append(restant_text[0 : restant_text.index("{%")])
						content_codes[-1].append(restant_text[idx1 + len("{%") + 1: idx2])

						a, b, restant_text = restant_text.partition("%}")

					else:
						raise SystemExit(f"ERROR: No end in your insertion code on unfinished_content.xml.{{%{content_codes[-1][-1]}%}} has no end.")

				for content_code in content_codes:
					if content_code[0].find('for') != -1 and content_code[0].find('in') != -1:
						iterable_object = content_code[0].replace('for', '').replace(' ', '').split('in')

						new_content_code = ""

						for iterable_data in data[iterable_object[1]]:
							temporary_content_code = content_code[1]
							for key in iterable_data:
								temporary_content_code = temporary_content_code.replace(f'{{{iterable_object[0]}.{key}}}', str(iterable_data[key]))

							if temporary_content_code.find("{index}") != -1:
								temporary_content_code = temporary_content_code.replace('{index}', str(data[iterable_object[1]].index(iterable_data) + 1))

							new_content_code += temporary_content_code

						doc = doc.replace(content_code[1], new_content_code)
						doc = doc.replace(f'{{% {content_code[0]}%}}', "")
						doc = doc.replace(f'{{% {content_code[2]}%}}', "")						

				content.write(doc)

		with ZipFile(f'{new_directory}/{filename}.docx', mode='w') as new_odt:
			for root, dirs, files in os.walk(self.source):
				new_root = root.replace(self.source, "")
				for directory in dirs:
					new_odt.write(f'{root}/{directory}', arcname=f'{new_root}/{directory}')
				for file in files:
					if file != "unfinished_content.xml":
						new_odt.write(f'{root}/{file}', arcname=f'{new_root}/{file}')

		test = convert(f'{new_directory}/{filename}.docx', f'{new_directory}/', soft=0)
		os.remove(f"{new_directory}/{filename}.docx")
		os.rename(test, f'{new_directory}/{filename}.pdf')

		self.render_file_url = f'{new_directory}/{filename}.pdf'


if __name__ == '__main__':
	DIRECTORY = "/home/michique/Bureau/project_perso/test_python_docx"
	SOURCE_DIRECTORY = f"{DIRECTORY}/facture_src"

	products = [
		{
			'desc': "Description",
			'quant': "Quantités",
			'unite': "Unités.",
			'unit_ht_price': "Prix Unitaire HT",
			'pourc_tva': "TVA %",
			'tva': "TVA",
			'total_ht': "Total HT",
		},
		{
			'desc': "Uyunie",
			'quant': "1",
			'unite': "pce.",
			'unit_ht_price': "60,00$",
			'pourc_tva': "20%",
			'tva': "12,00$",
			'total_ht': "60,00$",
		},
		{
			'desc': "yeiuzeiu",
			'quant': "1",
			'unite': "pce.",
			'unit_ht_price': "60,00$",
			'pourc_tva': "20%",
			'tva': "12,00$",
			'total_ht': "60,00$",
		},
	]

	data = {
		'facture_ref': 437,
		'facture_date': "12/06/2018",
		'client_n': 109,
		'send_date': "12/06/2018",
		'payment_date': "12/06/2018",
		'livraison_delay': "3 jours à 1 semaines",
		'saon_rue': "8 chemin du Bel Air",
		'saon_ville': "78200, Magnanville",
		'saon_pays': "France",
		'saon_naf_code': "20.41Z",
		'saon_siret': "913 715 496 00018",
		'saon_n_tva': "FR26 913 715 496",
		'saon_mail': "savonnerie.saon@gmail.com",
		'saon_tel': "",
		'dest_name': 'Titouan Bouchard',
		'dest_mail': "michique.pinson@gmail.com",
		'dest_rue': "34 rue des oliviers",
		'dest_ville': "78200, Magnanville",
		'dest_pays': "France",
		'products': products,
		'total_ht': '120,00$',
		'total_tva': '24,00$',
		'total_net': '144,00$',
		}

	my_odt = odtRender(DIRECTORY, SOURCE_DIRECTORY)
	my_odt.extract_file_to_source(f"{DIRECTORY}/demo_2.odt")
	my_odt.render(data, 'hello')