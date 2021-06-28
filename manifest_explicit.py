import yaml
import os


class Manifest:
        props = ['requires', 'recommends', 'resources', 'css', 'templates',
                 'provides', 'type']

        def __init__(self):
                super()
                self.requires = None
                self.recommends = None
                self.resources = None
                self.css = None
                self.templates = None
                self.type = None
                self.provides = None

        def apply(self, other):
                for i in self.props:
                        if getattr(other, i) is not None:
                                setattr(self, i, getattr(other, i))
                return self

        def desugar(self):
                result = {}
                for i in self.props:
                        value = getattr(self, i)
                        if value is None:
                                continue
                        result[i] = value
                return result

        @staticmethod
        def blank():
                result = Manifest()
                result.requires = []
                result.recommends = []
                result.resources = []
                result.css = []
                result.templates = []
                result.type = 'module'
                result.provides = []
                return result

        @staticmethod
        def sugar(other: dict):
                result = Manifest()
                for i in Manifest.props:
                        if i not in other:
                                continue
                        setattr(result, i, other[i])
                return result

        def __repr__(self):
                return f'{{requires: {self.requires}, recommends: {self.recommends}, resources: {self.resources}, css: {self.css}, templates: {self.templates}, provides: {self.provides}, type: {self.type}}}'


def read_manifests(dirpath: str):
        results = {}
        manifest_location = os.path.join(dirpath, 'manifest.yaml')
        if not os.path.isfile(manifest_location):
                return results
        with open(manifest_location) as manifests:
                manifest_objs = yaml.load(manifests,
                                          Loader=yaml.loader.BaseLoader)
                if manifest_objs is not None:
                        for key in manifest_objs:
                                results[key] = Manifest.sugar(
                                                  manifest_objs[key])
        if '/' in results:
                results[''] = results['/']
                del results['/']
        return results


def read_manifest(dirpath: str, module_name: str):
        results = read_manifests(dirpath)
        if module_name in results:
                return results[module_name]
        else:
                return Manifest()


def add_explicit_manifests(manifests, dirpath):
        explicit = read_manifests(dirpath)
        for name in explicit:
                if name in manifests:
                        manifests[name].apply(explicit[name])
                else:
                        manifests[name] = Manifest.blank().apply(explicit[name])
        return manifests


def desugar_manifests(manifests):
        results = {}
        for name in manifests:
                results[name] = manifests[name].desugar()
        return results
