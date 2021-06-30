from config import location as LOCATION
import os


JSHEADER = ''''use strict'

console.log('Got manifest', performance.now());
Elements.manifest = '''
JSFOOTER = '''
Elements.manifestLoaded = true;
Elements.__getBacklog();
'''

abs_location = os.path.abspath(LOCATION)

EXCLUDES = set([
        (abs_location, 'elements_core.js'),
        (abs_location, 'elements_core.ts'),
        (abs_location, 'elements_helper.ts'),
        (abs_location, 'elements_helper.js'),
        (abs_location, 'backbone4.ts'),
        (abs_location, 'backbone4.js'),
        (abs_location, 'elements_backbone.js'),
        (abs_location, 'elements_backbone.ts'),
        (abs_location, 'Elements.js'),
        (abs_location, 'Elements.mjs'),
        (abs_location, 'elements_helper.js'),
        (abs_location, 'elements_backbone.mjs'),
        (abs_location, 'elements_backbone.js'),
        (abs_location, 'global.d.ts'),
        (abs_location, 'manifest.js'),
        (abs_location, 'backbone.js'),
        (abs_location, 'backbone3.js'),
        (abs_location, 'elements_types.js'),
        (abs_location, 'elements_types.ts'),
        (abs_location, 'elements_manifest.json'),
])
