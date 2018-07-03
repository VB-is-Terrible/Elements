import os
from parser import name_resolver
from config import location
# $0 = file path name
# $1 = capitlized name
# $2 = name with dashes

def removeDashes(s):
	l = [x.capitalize() for x in s.split('/')]
	n1 = ''.join(l)
	return n1

def checkExists(name0):
	suffixes = ['/element.js', '/style.css', '/template.html']
	l = [location + name0 + suffix for suffix in suffixes]
	for name in l:
		if os.path.isfile(name):
			return True
	else:
		return False

def copy(fin, fout, n0, n1, n2):
	fin = open(fin)
	fout = open(fout, 'w')
	for line in fin:
		line = line.replace('$0', n0)
		line = line.replace('$1', n1)
		line = line.replace('$2', n2)
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
	module_name = name0.split('/')[-1]
	if module_name[0].isupper():
		print('Can\'t create module')
		return

	if checkExists(name0):
		print('File already exists')
		return

	print(name0, name1, name2)
	os.makedirs(location + name0, exist_ok=True)
	try:
		copy('Templates/nameTemplate.html', location + name0 + '/template.html', name0, name1, name2)
		copy('Templates/template.css', location + name0 + '/style.css', name0, name1, name2)
		copy('Templates/template.js', location + name0 + '/element.js', name0, name1, name2)
	except Exception as e:
		print('The following error occured during copying')
		print(e)
		l = [location + name0 + suffix for suffix in ['/template.html', '/style.css', '/element.js']]
		for name in l:
			try:
				os.remove(name)
			except:
				pass

if __name__ == '__main__':
	main()
