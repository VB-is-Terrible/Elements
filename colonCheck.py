import os

excludes = set(['.gitignore', 'out', '.git', '.jshintrc', 'notes2', 'kerbal.png', 'README.md', 'greyedX.svg', '.~lock.Bugs.fodt#', 'UI sketch.ora', 'LICENSE', 'Templates', 'TCF.png', 'icon.png', 'drive.png', 'logo.svg', 'Bugs.fodt', 'searcher sketch.ora', 'index.html', 'warning.svg', 'editor sketch.png', 'editor sketch.ora', 'dogpileLines.py', '.directory', 'package-lock.json', 'IMG_2563.JPG'])
all_files = set(os.listdir())
include = set(['Templates/nameTemplate.html', 'Templates/template.js', 'Templates/template.css'])

files = sorted(list((all_files - excludes).union(include)))

endingsAll = {
    'js': ['{', '[', '(', ';', '{}', '}', ':', ',', '+'],
    'css': ['{', '[', '(', ';', '{}', '}', '*/', '@', '\''],
}
prefixes = ['*', '*\\', '/*', '@']
ignored_endings = ['.py', '.json']

for name in files:
    if (name.endswith('.html')):
        continue
    fin = open(name)
    lines = 0
    if name.endswith('.js'):
        endings = endingsAll['js']
    elif name.endswith('.css'):
        endings = endingsAll['css']
    else:
        flag = False
        for ending in ignored_endings:
            if name.endswith(ending):
                break
        else:
            print ('Unknown filetype: {0}'.format(name))
        continue

    for line in fin:
        lines += 1
        line = line.strip()
        if line == '':
            continue

        if '//' in line:
            continue

        cont = False
        for prefix in prefixes:
            if line.startswith(prefix):
                cont = True
                break
        if cont:
            continue

        cont = False

        for ending in endings:
            if line.endswith(ending):
                cont = True
                break
        if cont:
            continue
        print ('Line without semicolon ({0}:{1}):'.format(name, lines))
        print (line)
