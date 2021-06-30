import json
import os
from manifest_common import JSFOOTER, JSHEADER, EXCLUDES
from parser import parse_ts, parse_mjs, parse, new_manifest, remove_prefix
from config import location as LOCATION
from typing import List, Dict
from manifest_explicit import add_explicit_manifests, desugar_manifests


MODULE_EXTENSION = ['.js', '.mjs', '.ts']

link_card_location = os.path.join(LOCATION, 'linkcard')
ELEMENTS_V1 = set([
        (link_card_location, 'linkCard'),
        (link_card_location, 'linkCardLink'),
])


def rename_modules(manifests, current_path):
        renamed = {}
        for module in manifests:
                if module == '':
                        renamed[current_path] = manifests['']
                else:
                        name = os.path.join(current_path, module)
                        renamed[name] = manifests[module]
        return renamed


def walk(dirpath: str, root: str):
        modules = find_modules(dirpath)
        manifests = scan_modules(modules, dirpath, root)

        manifests = add_explicit_manifests(manifests, dirpath)
        manifests = rename_modules(manifests, remove_prefix(dirpath, root))
        results = desugar_manifests(manifests)

        for file in os.listdir(dirpath):
                dirname = os.path.join(dirpath, file)
                if os.path.isdir(dirname):
                        results = {**results, **walk(dirname, root)}
        return results


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


def find_modules(dirpath: str):
        files = set(os.listdir(dirpath))
        found = set()
        for file in files:
                if (dirpath, file) in EXCLUDES:
                        continue
                name = check_if_module(file)
                if name:
                        found.add(name)
        modules = {}
        for file in found:
                if check_module4(file, files):
                        modules[file] = 4
                elif check_module3(file, files):
                        modules[file] = 3
                elif check_module2(file, files):
                        modules[file] = 2
                elif check_module1(file, files):
                        modules[file] = 1
                else:
                        raise Exception(f'Could not detect version for module {os.path.join(dirpath, file)}')
        return modules


def check_if_module(filename: str):
        for extension in MODULE_EXTENSION:
                if filename.endswith(extension):
                        return filename[0:-len(extension)]


def check_module4(filename: str, files: List[str]):
        if filename + '.ts' in files:
                return True
        return False


def check_module3(filename: str, files: List[str]):
        if filename + '.mjs' in files:
                return True
        return False


def check_module2(filename: str, files: List[str]):
        if filename == 'element' and 'element.js' in files:
                return True
        if not filename[0].isupper():
                return False
        if filename + '.js' not in files:
                return False
        return True


def check_module1(filename: str, files: List[str]):
        return True


def scan_modules(modules: Dict[str, int], dirpath: str, root: str):
        results = {}
        for module in modules:
                version = modules[module]
                name, manifest = scan_module(version, module, dirpath, root)
                if name in results:
                        raise Exception(f'Folder {remove_prefix(dirpath, root)} has a module with multiple defintions')
                results[name] = manifest
        return results


def scan_module(version: int, module: str, dirpath: str, root: str):
        if version == 4:
                name = ''
                manifest = parse_ts(dirpath, root, f'{module}.ts')
                return name, manifest
        elif version == 3:
                name = ''
                manifest = parse_mjs(dirpath, root, f'{module}.mjs')
                return name, manifest
        elif version == 2:
                if module == 'element':
                        name = ''
                        manifest = parse(dirpath, root)
                        return name, manifest
                else:
                        name = module
                        manifest = parse(os.path.join(
                                             dirpath, f'{module}.js'), root)
                        return name, manifest
        elif version == 1:
                if (dirpath, module) not in ELEMENTS_V1:
                        module_name = os.path.join(
                                          remove_prefix(dirpath, root),
                                          module)
                        raise Exception(f'No new V1 elements ({module_name}) are supported')
                name = module
                manifest = new_manifest()
                print('Ver 1: ' + module)
                return name, manifest
        else:
                raise Exception(f'Invalid version for module {os.path.join(dirpath, module)}')


if __name__ == '__main__':
        build(LOCATION)
