from html.parser import HTMLParser
import re
from typing import List, Tuple
import os
from os.path import isfile, isdir
import json
import pprint
from parser import tokenise, name_resolver
from config import location as LOCATION
JSHEADER = ''''use strict'

console.log('Got manifest', performance.now());
Elements.manifest = '''
JSFOOTER = '''
Elements.manifestLoaded = true;
Elements.__getBacklog();
'''


class linkParser(HTMLParser):
        def __init__(self):
                super().__init__()
                self._css = set()
                self._resources = set()

        def handle_starttag(self, tag, attrs):
                if tag == 'link':
                        props = to_dict(attrs)
                        if props['rel'] == 'stylesheet' and props['type'] == 'text/css':
                                self._css.add(props['href'])
                elif tag == 'img':
                        props = to_dict(attrs)
                        self._resources.add(props['src'])
                else:
                        return

        def reset(self):
                super().reset()
                self._css = set()
                self._resources = set()

        @property
        def css(self):
                return sorted(list(self._css))

        @property
        def resources(self):
                return sorted(list(self._resources))


def strip_quotes(s: str) -> str:
        return s.strip("'").strip('"')


def to_dict(properties: List[Tuple[str, str]]) -> dict:
        result = {}
        for prop, value in properties:
                result[prop] = value
        return result


def parse_js(lines):
        get_regex = re.compile(r'Elements\.get\((.*?)\)')
        load_regex = re.compile(r'Elements\.load\((.*?)\)')
        loaded_regex = re.compile(r'Elements\.loaded\((.*?)\)')
        requires = set()
        matches = get_regex.findall(lines)
        for match in matches:
                require = [strip_quotes(x.strip()) for x in match.split(',')]
                for req in require:
                        if ' ' not in req and req != '':
                                requires.add(req)
        provides = set()
        templates = set()
        for load in load_regex.findall(lines):
                js_name, html_name = [x.strip() for x in load.split(',')]
                html_name = strip_quotes(html_name)
                name = name_resolver(html_name)
                templates.add(name + '/template.html')
                provides.add(name)
        for loaded in loaded_regex.findall(lines):
                loaded = strip_quotes(loaded)
                provides.add(loaded)
        return sorted(list(requires)), sorted(list(templates)), sorted(list(provides))


def test():
        with open('elements/kerbal/maker/element.js') as f:
                s = f.read()
        return parse_js(s)


def remove_prefix(s: str, prefix: str) -> str:
        if s.startswith(prefix):
                return s[len(prefix):]
        else:
                return s


def parse(filepath: str, root: str):
        name = remove_prefix(filepath, root)
        manifest = {
                "type": None,
                "requires": [],
                "templates": [],
                "css": [],
                "resources": [],
                "provides": []
        }
        if isfile(filepath):
                manifest['type'] = 'module'
        else:
                manifest['type'] = 'element'
        if manifest['type'] == 'module':
                location = filepath
        else:
                location = filepath + '/element.js'
        with open(location) as f:
                lines = f.read()
        manifest['requires'], manifest['templates'], manifest['provides'] = parse_js(lines)

        parser = linkParser()
        for template in manifest['templates']:
                with open(root + template) as f:
                        lines = f.read()
                parser.feed(lines)
        manifest['css'], manifest['resources'] = parser.css, parser.resources
        return manifest


def build(dirpath: str):
        results = walk(dirpath, dirpath)
        output = json.dumps(results, indent=4, sort_keys=True)
        # pprint.pprint (output)
        out = open(dirpath + 'manifest.json', 'w')
        out.write(output)
        out.close()
        # Hack around chrome not preloading json
        out2 = open(dirpath + 'manifest.js', 'w')
        out2.write(JSHEADER)
        out2.write(output)
        out2.write(JSFOOTER)
        out2.close()


def walk(dirpath: str, root: str):
        results = {}
        modules = []
        for file in os.listdir(dirpath):
                if file[0].isupper() and file.endswith('.js') and isfile(os.path.join(dirpath, file)):
                        modules.append(os.path.join(dirpath, file))
        for filename in modules:
                name = remove_prefix(filename[:-3], root)
                results[name] = parse(filename, root)
        if isfile(dirpath + '/element.js'):
                results[remove_prefix(dirpath, root)] = parse(dirpath, root)
        for file in os.listdir(dirpath):
                dirname = os.path.join(dirpath, file)
                if isdir(dirname):
                        results = {**results, **walk(dirname, root)}
        return results


if __name__ == '__main__':
        build(LOCATION)
