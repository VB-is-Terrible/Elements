import os
import json
from config import location as LOCATION
from os.path import isfile, isdir
import manifest_explicit
from manifest_common import EXCLUDES, JSFOOTER, JSHEADER
from parser import parse_ts, parse_mjs, parse, parse_js, remove_prefix


def test():
        with open('elements/kerbal/maker/element.js') as f:
                s = f.read()
        return parse_js(s)


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
        manifests = {}
        modules = []
        # Check for element module js files
        for file in os.listdir(dirpath):
                if file[0].isupper() and file.endswith('.js') and \
                   isfile(os.path.join(dirpath, file)) and \
                   not isfile(os.path.join(dirpath, file[:-3] + '.ts')):
                        modules.append(os.path.join(dirpath, file))
        for filename in modules:
                name = remove_prefix(filename[:-3], root)
                manifests[name] = parse(filename, root)
        if (isfile(dirpath + '/element.js')
                and not isfile(dirpath + '/element.ts')):
                manifests[remove_prefix(dirpath, root)] = parse(dirpath, root)
        for file in os.listdir(dirpath):
                if not file.endswith('.mjs'):
                        continue
                if (dirpath, file) in EXCLUDES:
                        pass
                else:
                        name = remove_prefix(dirpath, root)
                        manifests[name] = parse_mjs(dirpath, root, file)
        for file in os.listdir(dirpath):
                if (dirpath, file) in EXCLUDES:
                        continue
                if file.endswith('.ts'):
                        name = remove_prefix(dirpath, root)
                        manifests[name] = parse_ts(dirpath, root, file)
        manifests = manifest_explicit.add_explicit_manifests(
                    manifests, dirpath)
        results = {}
        for name in manifests:
                results[name] = manifests[name].desugar()
        for file in os.listdir(dirpath):
                dirname = os.path.join(dirpath, file)
                if isdir(dirname):
                        results = {**results, **walk(dirname, root)}
        return results


if __name__ == '__main__':
        build(LOCATION)
