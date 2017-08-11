import os

# $0 = uncapitalized name
# $1 = capitlized name
# $2 = name with dashes

def removeDashes(s):
    l = [x.capitalize() for x in s.split('-')]
    n1 = ''.join(l)
    l[0] = l[0][:1].lower() + l[0][:1]
    n0 = ''.join(l)
    return n0, n1

def checkExists(name0):
    files = os.listdir()
    suffixes = ['.js', '.css', '.html', 'Template.html', '']
    l = [name0 + suffix for suffix in suffixes]
    for name in l:
        if name in files:
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
        name0, name1 = removeDashes(name2)
    if checkExists(name0):
        print('File already exists')
        return
    copy('Templates/nameTemplate.html', name0 + 'Template.html', name0, name1, name2)
    copy('Templates/tempalte.css', name0 + '.css', name0, name1, name2)
    copy('Templates/tempalte.js', name0 + '.js', name0, name1, name2)
