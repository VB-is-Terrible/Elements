from html.parser import HTMLParser
from typing import List, Tuple, Set, Dict
import re
from os.path import isfile
import os
from manifest_explicit import Manifest
from enum import Enum, unique, auto


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

        _parse_mjs(location, manifest, name)

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

        _parse_mjs(location, manifest, name)

        parser = linkParser()
        not_found = []
        for template in manifest.templates:
                if not os.path.isfile(os.path.join(root, template)):
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


def strip(x):
        return strip_quotes(x.strip())


get_regex = re.compile(r'^Elements\.get\((.*?)\)', re.M)
await_get_regex = re.compile(r'^await Elements\.get\((.*?)\)', re.M)

recommends_regex = re.compile(r'export const recommends = \[(.*?)\]',
                              re.M)
requires_regex = re.compile(r'export const requires = \[(.*?)\]', re.M)
load_regex = re.compile(r'Elements\.load\((.*?)\)')
loaded_regex = re.compile(r'Elements\.loaded\((.*?)\)')
template_regex = re.compile(r'Elements\.loadTemplate\(\'(.*?)\'\)')
spread_regex = re.compile(r'\.\.\.([\w\d_$]*)')


def _parse_mjs_add_set(match: str, result_set: Set[str],
                       constants: Dict[str, str]) -> Set[str]:
        if spread_match := spread_regex.match(match):
                spread = constants.get(spread_match.group(1), [])
                [result_set.add(req) for req in spread]
        else:
                require = [strip(x) for x in match.split(',')]

                for req in require:
                        if ' ' not in req and req != '':
                                result_set.add(req)
        return result_set


def _parse_mjs_recommends(lines, constants, auto_get_regex, depend_regex):
        recommends = set()
        matches = auto_get_regex.findall(lines)

        for match in matches:
                _parse_mjs_add_set(match, recommends, constants)

        match = depend_regex.search(lines)
        if match is not None:
                _parse_mjs_add_set(match.group(1), recommends, constants)

        return recommends


def _parse_mjs(location, manifest, name: str):
        with open(location) as file:
                lines = file.read()

        constants_arrays = read_constants(lines)

        recommends = _parse_mjs_recommends(lines, constants_arrays,
                                           get_regex, recommends_regex)

        requires = _parse_mjs_recommends(lines, constants_arrays,
                                         await_get_regex, requires_regex)

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
                        if line.startswith('import'):
                                return True
        return False


value_regex = re.compile(
                 r'^(?:export )?(?:const|var|let) ([\w\d_$]*) = (\[.*?\])',
                 re.M)


def read_constants(lines):
        matches = value_regex.findall(lines)
        values = {}
        for match in matches:
                name, value = match
                try:
                        value_array = parse_array(value)
                        values[name] = value_array
                except WrongSymbol:
                        continue
        return values


def parse_array(array_str):
        parser = JS_array_parser(array_str)
        parser.parse_list()
        return parser.result


class WrongSymbol(Exception):
        pass


class EOF(Exception):
        pass


@unique
class Symbols(Enum):
        ARRAY_START = auto()
        ARRAY_END = auto()


class JS_array_parser:
        def __init__(self, text: str):
                self.text = text
                self.position = 0
                self.symbols = []

        def skip_whitespace(self):
                while self.cursor == ' ':
                        self.next_position()
                return True

        def start_list(self):
                if self.cursor == '[':
                        self.symbols.append(Symbols.ARRAY_START)
                        self.next_position()
                        return True
                else:
                        return False

        @property
        def cursor(self):
                return self.text[self.position]

        def next_position(self):
                self.position += 1

        def end_list(self):
                if self.cursor == ']':
                        self.symbols.append(Symbols.ARRAY_END)
                        self.next_position()
                        return True
                else:
                        return False

        def parse_string(self):
                string = ''
                if self.cursor not in ('"', "'"):
                        return False
                quotation = self.cursor
                position = self.position + 1  # Swallow the quote
                length = len(self.text)
                ignore = False

                def check():
                        if position == length:
                                return False
                        if self.text[position] == quotation and not ignore:
                                return False
                        return True

                while check():
                        string += self.text[position]
                        if self.text[position] != '/':
                                ignore = False
                        else:
                                ignore = not ignore
                        position += 1

                if position == length:
                        return False

                position = position + 1  # Swallow the quote
                self.symbols.append(string)
                self.position = position
                return True

        def parse_comma(self):
                if self.cursor == ',':
                        self.next_position()
                        return True
                else:
                        return False

        def parse_list(self):
                def validate(value):
                        if not value:
                                raise WrongSymbol()

                self.skip_whitespace()
                validate(self.start_list())
                self.skip_whitespace()
                end = False
                while not end and not self.end_list():
                        validate(self.parse_string())
                        self.skip_whitespace()
                        end = not self.parse_comma()
                        self.skip_whitespace()
                if end:
                        validate(self.end_list())

        @property
        def result(self):
                result = []
                if self.symbols[0] != Symbols.ARRAY_START:
                        raise WrongSymbol()
                position = 1
                current = self.symbols[position]

                def check():
                        nonlocal current
                        if position == len(self.symbols):
                                return False
                        current = self.symbols[position]
                        if current == Symbols.ARRAY_END:
                                return False
                        else:
                                return True

                while check():
                        result.append(current)
                        position += 1

                if position == len(self.symbols):
                        raise EOF()

                return result
