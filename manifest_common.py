from config import location as LOCATION


JSHEADER = ''''use strict'

console.log('Got manifest', performance.now());
Elements.manifest = '''
JSFOOTER = '''
Elements.manifestLoaded = true;
Elements.__getBacklog();
'''


EXCLUDES = set([
        (LOCATION, 'elements_core.js'),
        (LOCATION, 'elements_core.ts'),
        (LOCATION, 'elements_helper.ts'),
        (LOCATION, 'elements_helper.js'),
        (LOCATION, 'backbone4.ts'),
        (LOCATION, 'backbone4.js'),
        (LOCATION, 'elements_backbone.js'),
        (LOCATION, 'elements_backbone.ts'),
        (LOCATION, 'Elements.js'),
        (LOCATION, 'Elements.mjs'),
        (LOCATION, 'elements_helper.js'),
        (LOCATION, 'elements_backbone.mjs'),
        (LOCATION, 'elements_backbone.js'),
        (LOCATION, 'global.d.ts'),
        (LOCATION, 'manifest.js'),
        (LOCATION, 'backbone.js'),
        (LOCATION, 'backbone3.js'),
])
