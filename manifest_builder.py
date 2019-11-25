from html.parser import HTMLParser
import re
from typing import List, Tuple
import os
from os.path import isfile, isdir
import json
from parser import name_resolver
from config import location as LOCATION
JSHEADER = ''''use strict'

console.log('Got manifest', performance.now());
Elements.manifest = '''
JSFOOTER = '''
Elements.manifestLoaded = true;
Elements.__getBacklog();
'''

EXCLUDES = set([
        ('./elements/', 'Elements.mjs'),
        ('./elements/', 'elements_backbone.mjs')
])


class linkParser(HTMLParser):
        def __init__(self):
                super().__init__()
                self._css = set()
                self._resources = set()

        def handle_starttag(self, tag, attrs):
                if tag == 'link':
                        props = to_dict(attrs)
                        if (props['rel'] == 'stylesheet'
                                and props['type'] == 'text/css'):
                                self._css.add(props['href'])
                elif tag == 'img':
                        props = to_dict(attrs)
                        if 'src' in props:
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
        template_regex = re.compile(r'Elements\.loadTemplate\(\'(.*?)\'\)')

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
        for template in template_regex.findall(lines):
                templates.add(template)
        return (
                sorted(list(requires)),
                sorted(list(templates)),
                sorted(list(provides)))


def test():
        with open('elements/kerbal/maker/element.js') as f:
                s = f.read()
        return parse_js(s)


def remove_prefix(s: str, prefix: str) -> str:
        if s.startswith(prefix):
                return s[len(prefix):]
        else:
                return s


def _parse_mjs(file, manifest, name: str):
        lines = file.read()
        get_regex = re.compile(r'Elements\.get\((.*?)\)')
        recommends_regex = re.compile(r'export const recommends = \[(.*?)\]',
                                      re.M)
        requires_regex = re.compile(r'export const requires = \[(.*?)\]', re.M)
        load_regex = re.compile(r'Elements\.load\((.*?)\)')
        loaded_regex = re.compile(r'Elements\.loaded\((.*?)\)')
        template_regex = re.compile(r'Elements\.loadTemplate\(\'(.*?)\'\)')

        recommends = set()
        matches = get_regex.findall(lines)

        def strip(x):
                return strip_quotes(x.strip())

        for match in matches:
                require = [strip(x) for x in match.split(',')]
                for req in require:
                        if ' ' not in req and req != '':
                                recommends.add(req)

        match = recommends_regex.search(lines)
        if match is not None:
                recommend = [strip(x) for x in match.group(1).split(',')]
                for req in recommend:
                        if req != '':
                                recommends.add(req)

        requires = set()
        match = requires_regex.search(lines)
        if match is not None:
                require = [strip(x) for x in match.group(1).split(',')]
                for req in require:
                        if req != '':
                                requires.add(req)

        provides = set()
        templates = set()
        for load in load_regex.findall(lines):
                js_name, html_name = [x.strip() for x in load.split(',')][0:2]
                html_name = strip_quotes(html_name)
                name = name_resolver(html_name)
                moduleName = name.split('/')[-1]
                templates.add(name + '/' + moduleName + 'Template.html')
                provides.add(name)
        for loaded in loaded_regex.findall(lines):
                loaded = strip_quotes(loaded)
                provides.add(loaded)
        for template in template_regex.findall(lines):
                templates.add(template)

        manifest['provides'] = sorted(list(provides))
        manifest['templates'] = sorted(list(templates))
        manifest['requires'] = sorted(list(requires))
        manifest['recommends'] = sorted(list(recommends))


def new_manifest():
        return {
                "type": None,
                "requires": [],
                "recommends": [],
                "templates": [],
                "css": [],
                "resources": [],
                "provides": [],
        }


def parse(filepath: str, root: str):
        manifest = new_manifest()
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
        (manifest['requires'],
         manifest['templates'],
         manifest['provides']) = parse_js(lines)
        parser = linkParser()
        for template in manifest['templates']:
                with open(root + template) as f:
                        lines = f.read()
                parser.feed(lines)
        manifest['css'], manifest['resources'] = parser.css, parser.resources
        return manifest


def parse_mjs(dirpath: str, root: str, name: str):
        manifest = new_manifest()
        if name[0].isupper():
                manifest['type'] = 'module3'
        else:
                manifest['type'] = 'element3'
        location = os.path.join(dirpath, name)
        with open(location) as f:
                _parse_mjs(f, manifest, name)

        parser = linkParser()
        for template in manifest['templates']:
                with open(root + template) as f:
                        file_string = f.read()
                parser.feed(file_string)
        manifest['css'] = parser.css
        manifest['resources'] = parser.resources
        return manifest


def build(dirpath: str):
        results = walk(dirpath, dirpath)
        output = json.dumps(results, indent=4, sort_keys=True)
        out = open(dirpath + 'manifest.json', 'w')
        out.write(output)
        out.write('\n')
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
        # Check for element module js files
        for file in os.listdir(dirpath):
                if file[0].isupper() and file.endswith('.js') and \
                   isfile(os.path.join(dirpath, file)):
                        modules.append(os.path.join(dirpath, file))
        for filename in modules:
                name = remove_prefix(filename[:-3], root)
                results[name] = parse(filename, root)
        if isfile(dirpath + '/element.js'):
                results[remove_prefix(dirpath, root)] = parse(dirpath, root)
        for file in os.listdir(dirpath):
                if not file.endswith('.mjs'):
                        continue
                if (dirpath, file) in EXCLUDES:
                        pass
                else:
                        name = remove_prefix(dirpath, root)
                        results[name] = parse_mjs(dirpath, root, file)
        for file in os.listdir(dirpath):
                dirname = os.path.join(dirpath, file)
                if isdir(dirname):
                        results = {**results, **walk(dirname, root)}
        return results


if __name__ == '__main__':
        build(LOCATION)
