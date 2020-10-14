import os
from parser import name_resolver, tokenise
from config import location
# $0 = file path name
# $1 = capitlized name
# $2 = name with dashes


def removeDashes(s):
	tokens = [x.capitalize() for x in s.split('/')]
	n1 = ''.join(tokens)
	return n1


def checkExists(name0):
	suffixes = ['/element.js', '/style.css', '/template.html']
	files = [location + name0 + suffix for suffix in suffixes]
	for name in files:
		if os.path.isfile(name):
			return True
	else:
		return False


def copy(fin, fout, n0, n1, n2, n3, n4 = ''):
	fin = open(fin)
	fout = open(fout, 'w')
	for line in fin:
		line = line.replace('$0', n0)
		line = line.replace('$1', n1)
		line = line.replace('$2', n2)
		line = line.replace('$3', n3)
		line = line.replace('$4', n4)
		fout.write(line)
	fin.close()
	fout.close()


def main():
	name2 = input('Enter element name (with dashes): ')
	if not name2:
		print('Empty input')
		return
	else:
		name0 = name_resolver(name2)
		name1 = removeDashes(name0)
	module_name = tokenise(name0)[-1]
	version_input = input('Enter version number: ')
	if not version_input:
		version = 3
	else:
		try:
			version = int(version_input)
		except Exception as e:
			print('Invalid version number: {}'.format(version_input))
			print(e)
			return
	if module_name[0].isupper():
		print('Can\'t create module')
		return

	if checkExists(name0):
		print('File already exists')
		return

	layers = '../' * len(name0.split('/'))
	print(name0, name1, name2)
	os.makedirs(location + name0, exist_ok=True)
	if version == 3:
		create3(name0, name1, name2, layers, module_name)
	elif 0 < version < 3:
		create2(name0, name1, name2)
	else:
		print('Invalid version number: {}'.format(version))
		return


def create2(name0, name1, name2):
	try:
		args = [name0, name1, name2, 'style']
		folder = location + name0
		copy('Templates/nameTemplate.html', folder + '/template.html', *args)
		copy('Templates/template.css', folder + '/style.css', *args)
		copy('Templates/template.js', folder + '/element.js', *args)
	except Exception as e:
		print('The following error occured during copying')
		print(e)
		suffixes = ['/template.html', '/style.css', '/element.js']
		files = [location + name0 + suffix for suffix in suffixes]
		for name in files:
			try:
				os.remove(name)
			except Exception:
				pass


def create3(name0, name1, name2, name3, moduleName):
	try:
		args = [name0, name1, name2, moduleName, name3]
		folder = location + name0 + '/' + moduleName
		copy('Templates/nameTemplate.html', folder + 'Template.html', *args)
		copy('Templates/template.css', folder + '.css', *args)
		copy('Templates/template.mjs', folder + '.mjs', *args)
	except Exception as e:
		print('The following error occured during copying')
		print(e)
		folder = location + name0 + '/' + moduleName
		suffixes = ['/template.html', '/style.css', '/element.js']
		files = [location + name0 + suffix for suffix in suffixes]
		for name in files:
			try:
				os.remove(name)
			except Exception:
				pass


if __name__ == '__main__':
	main()
