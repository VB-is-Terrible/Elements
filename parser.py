from html.parser import HTMLParser
from typing import List, Tuple
import re
from os.path import isfile
import os
from manifest_explicit import Manifest


def tokenise(name: str) -> List[str]:
        if '-' in name:
                return name.split('-')
        elif '/' in name:
                return name.split('/')
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
                print('Tried to find module componenet')
                return name
        if name[0].isupper():
                return '/'.join(name.split('-'))
        else:
                return '/'.join(tokenise(name))


def remove_prefix(s: str, prefix: str) -> str:
        if s.startswith(prefix):
                return s[len(prefix):]
        else:
                return s


def new_manifest():
        return Manifest.blank()


def to_dict(properties: List[Tuple[str, str]]) -> dict:
        result = {}
        for prop, value in properties:
                result[prop] = value
        return result


def strip_quotes(s: str) -> str:
        return s.strip("'").strip('"')


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


def parse(filepath: str, root: str):
        manifest = new_manifest()
        if isfile(filepath):
                manifest.type = 'module'
        else:
                manifest.type = 'element'
        if manifest.type == 'module':
                location = filepath
        else:
                location = filepath + '/element.js'
        with open(location) as f:
                lines = f.read()
        (manifest.requires,
         manifest.templates,
         manifest.provides) = parse_js(lines)
        parser = linkParser()
        for template in manifest.templates:
                with open(root + template) as f:
                        lines = f.read()
                parser.feed(lines)
        manifest.css, manifest.resources = parser.css, parser.resources
        return manifest


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


def parse_mjs(dirpath: str, root: str, name: str):
        manifest = new_manifest()
        if name[0].isupper():
                manifest.type = 'module3'
        else:
                manifest.type = 'element3'
        location = os.path.join(dirpath, name)
        with open(location) as f:
                _parse_mjs(f, manifest, name)

        parser = linkParser()
        for template in manifest.templates:
                with open(root + template) as f:
                        file_string = f.read()
                parser.feed(file_string)
        manifest.css = parser.css
        manifest.resources = parser.resources
        return manifest


def parse_ts(dirpath: str, root: str, name: str):
        manifest = new_manifest()
        location = os.path.join(dirpath, name)
        if name[0].isupper():
                if is_module(location):
                        manifest.type = 'module4'
                else:
                        manifest.type = 'script4'
        else:
                manifest.type = 'element4'
        with open(location) as f:
                _parse_mjs(f, manifest, name)

        parser = linkParser()
        not_found = []
        for template in manifest.templates:
                if not os.path.isfile(root + template):
                        not_found.append(template)
                        continue
                with open(root + template) as f:
                        file_string = f.read()
                parser.feed(file_string)
        for missing in not_found:
                manifest.templates.remove(missing)
        manifest.css = parser.css
        manifest.resources = parser.resources
        return manifest


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

        manifest.provides = sorted(list(provides))
        manifest.templates = sorted(list(templates))
        manifest.requires = sorted(list(requires))
        manifest.recommends = sorted(list(recommends))


def is_module(filename):
        with open(filename) as fin:
                for line in fin:
                        if line.startswith('export'):
                                return True
        return False
