def tokenise(name: str) -> List[str]:
        if '-' in name:
                return name.split('-')
        else:
                name = name[0].upper() + name[1:]
                regex = re.compile(r'[A-Z][a-z|_]*')
                terms = regex.findall(name)
                tokens = [x.lower() for x in terms]
                return tokens

def name_resolver(name: str) -> str:
        if name.startswith('elements-'):
                name = name[len('elements-'):]
        if '/' in name:
                return name
        if '.' in name:
                print ('Tried to find module componenet')
                return name
        if name[0].isupper():
                return '/'.join(name.split('-'))
        else:
                return '/'.join(tokenise(name))
