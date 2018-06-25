'use strict'

console.log('Got manifest', performance.now());
Elements.manifest = {
    "KDB": {
        "css": [],
        "provides": [
            "KNS",
            "KNS.Group",
            "KDB",
            "KNS.Kerbal"
        ],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "Kerbal_link": {
        "css": [],
        "provides": [
            "Kerbal_link"
        ],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "confirm_dialog": {
        "css": [
            "confirm_dialog/style.css",
            "common/float.css"
        ],
        "provides": [
            "confirm_dialog"
        ],
        "requires": [
            "",
            "drag-element"
        ],
        "resources": [],
        "templates": [
            "confirm_dialog/template.html"
        ],
        "type": "element"
    },
    "drag/body": {
        "css": [
            "drag/body/style.css"
        ],
        "provides": [
            "drag/body"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "drag/body/template.html"
        ],
        "type": "element"
    },
    "drag/element": {
        "css": [
            "drag/element/style.css"
        ],
        "provides": [
            "drag/element"
        ],
        "requires": [
            "drag-body"
        ],
        "resources": [],
        "templates": [
            "drag/element/template.html"
        ],
        "type": "element"
    },
    "dropdown": {
        "css": [
            "dropdown/style.css"
        ],
        "provides": [
            "dropdown"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "dropdown/template.html"
        ],
        "type": "element"
    },
    "grid": {
        "css": [],
        "provides": [
            "grid"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "grid/template.html"
        ],
        "type": "element"
    },
    "kdb/group_display": {
        "css": [
            "kdb/group_display/style.css"
        ],
        "provides": [
            "kdb/group_display"
        ],
        "requires": [
            "kerbal-group-display",
            "KDB"
        ],
        "resources": [],
        "templates": [
            "kdb/group_display/template.html"
        ],
        "type": "element"
    },
    "kdb/kerbal_display": {
        "css": [
            "kdb/kerbal_display/style.css"
        ],
        "provides": [
            "kdb/kerbal_display"
        ],
        "requires": [
            "KDB",
            "kerbal-display"
        ],
        "resources": [],
        "templates": [
            "kdb/kerbal_display/template.html"
        ],
        "type": "element"
    },
    "kerbal/display": {
        "css": [
            "kerbal/display/style.css"
        ],
        "provides": [
            "kerbal/display"
        ],
        "requires": [
            "dropdown",
            "kerbal-tag",
            "KDB"
        ],
        "resources": [],
        "templates": [
            "kerbal/display/template.html"
        ],
        "type": "element"
    },
    "kerbal/display_text": {
        "css": [
            "kerbal/display_text/style.css"
        ],
        "provides": [
            "kerbal/display_text"
        ],
        "requires": [
            "KDB"
        ],
        "resources": [],
        "templates": [
            "kerbal/display_text/template.html"
        ],
        "type": "element"
    },
    "kerbal/editor": {
        "css": [
            "kerbal/editor/style.css",
            "kerbal/window_common.css"
        ],
        "provides": [
            "kerbal/editor"
        ],
        "requires": [
            "tab-window",
            "drag-element",
            "kerbal-editor-kerbal",
            "kerbal-editor-group"
        ],
        "resources": [],
        "templates": [
            "kerbal/editor/template.html"
        ],
        "type": "element"
    },
    "kerbal/editor/group": {
        "css": [
            "kerbal/maker/group/style.css",
            "kerbal/editor/group/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/editor/group"
        ],
        "requires": [
            "kerbal-display_text",
            "KDB",
            "kerbal-group-tag",
            "dropdown",
            "tab-window",
            "kerbal-searcher-kerbal"
        ],
        "resources": [
            "resources/warning.svg"
        ],
        "templates": [
            "kerbal/editor/group/template.html"
        ],
        "type": "element"
    },
    "kerbal/editor/kerbal": {
        "css": [
            "kerbal/editor/kerbal/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/editor/kerbal"
        ],
        "requires": [
            "KDB",
            "dropdown",
            "tab-window",
            "grid",
            "Kerbal_link",
            "kerbal-display"
        ],
        "resources": [
            "resources/warning.svg"
        ],
        "templates": [
            "kerbal/editor/kerbal/template.html"
        ],
        "type": "element"
    },
    "kerbal/footer": {
        "css": [
            "kerbal/footer/style.css"
        ],
        "provides": [
            "kerbal/footer"
        ],
        "requires": [
            "kerbal-panel_menu"
        ],
        "resources": [],
        "templates": [
            "kerbal/footer/template.html"
        ],
        "type": "element"
    },
    "kerbal/group/display": {
        "css": [
            "kerbal/group/display/style.css"
        ],
        "provides": [
            "kerbal/group/display"
        ],
        "requires": [
            "",
            "dropdown",
            "kerbal-group-tag",
            "kerbal-group-display-kerbal"
        ],
        "resources": [],
        "templates": [
            "kerbal/group/display/template.html"
        ],
        "type": "element"
    },
    "kerbal/group/display/kerbal": {
        "css": [
            "kerbal/group/display/kerbal/style.css"
        ],
        "provides": [
            "kerbal/group/display/kerbal"
        ],
        "requires": [
            "KDB",
            "kerbal-display"
        ],
        "resources": [],
        "templates": [
            "kerbal/group/display/kerbal/template.html"
        ],
        "type": "element"
    },
    "kerbal/group/display/kerbal/text": {
        "css": [
            "kerbal/group/display/kerbal/text.css"
        ],
        "provides": [
            "kerbal/group/display/kerbal_text"
        ],
        "requires": [
            "KDB",
            "kerbal-display_text"
        ],
        "resources": [],
        "templates": [
            "kerbal/group/display/kerbal_text/template.html"
        ],
        "type": "element"
    },
    "kerbal/group/display/kerbal_text": {
        "css": [
            "kerbal/group/display/kerbal/text.css"
        ],
        "provides": [
            "kerbal/group/display/kerbal_text"
        ],
        "requires": [
            "KDB",
            "kerbal-display_text"
        ],
        "resources": [],
        "templates": [
            "kerbal/group/display/kerbal_text/template.html"
        ],
        "type": "element"
    },
    "kerbal/group/tag": {
        "css": [
            "kerbal/group/tag/style.css"
        ],
        "provides": [
            "kerbal/group/tag"
        ],
        "requires": [
            "KDB"
        ],
        "resources": [
            "kerbal/group/tag/group.svg"
        ],
        "templates": [
            "kerbal/group/tag/template.html"
        ],
        "type": "element"
    },
    "kerbal/importer": {
        "css": [
            "kerbal/window_common.css",
            "kerbal/importer/style.css"
        ],
        "provides": [
            "kerbal/importer"
        ],
        "requires": [
            "kerbal-importer-export",
            "kerbal-importer-import",
            "drag-element"
        ],
        "resources": [],
        "templates": [
            "kerbal/importer/template.html"
        ],
        "type": "element"
    },
    "kerbal/importer/export": {
        "css": [
            "kerbal/importer/export/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/importer/export"
        ],
        "requires": [
            "Kerbal_link",
            "tab-window"
        ],
        "resources": [],
        "templates": [
            "kerbal/importer/export/template.html"
        ],
        "type": "element"
    },
    "kerbal/importer/import": {
        "css": [
            "kerbal/importer/import/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/importer/import"
        ],
        "requires": [
            "Kerbal_link",
            "tab-window"
        ],
        "resources": [
            "resources/warning.svg"
        ],
        "templates": [
            "kerbal/importer/import/template.html"
        ],
        "type": "element"
    },
    "kerbal/maker": {
        "css": [
            "kerbal/window_common.css",
            "kerbal/maker/style.css"
        ],
        "provides": [
            "kerbal/maker"
        ],
        "requires": [
            "kerbal-maker-group",
            "tab-window",
            "drag-element",
            "kerbal-maker-kerbal"
        ],
        "resources": [],
        "templates": [
            "kerbal/maker/template.html"
        ],
        "type": "element"
    },
    "kerbal/maker/group": {
        "css": [
            "kerbal/maker/group/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/maker/group"
        ],
        "requires": [
            "kerbal-display_text",
            "tab-window",
            "KDB",
            "main",
            "kerbal-searcher-kerbal"
        ],
        "resources": [
            "resources/warning.svg"
        ],
        "templates": [
            "kerbal/maker/group/template.html"
        ],
        "type": "element"
    },
    "kerbal/maker/kerbal": {
        "css": [
            "kerbal/maker/kerbal/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/maker/kerbal"
        ],
        "requires": [
            "Kerbal_link",
            "tab-window",
            "KDB",
            "kerbal-display",
            "grid"
        ],
        "resources": [
            "resources/warning.svg"
        ],
        "templates": [
            "kerbal/maker/kerbal/template.html"
        ],
        "type": "element"
    },
    "kerbal/panel_menu": {
        "css": [
            "kerbal/panel_menu/style.css"
        ],
        "provides": [
            "kerbal/panel_menu"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "kerbal/panel_menu/template.html"
        ],
        "type": "element"
    },
    "kerbal/searcher": {
        "css": [
            "kerbal/searcher/style.css",
            "kerbal/window_common.css"
        ],
        "provides": [
            "kerbal/searcher"
        ],
        "requires": [
            "kerbal-searcher-group",
            "kerbal-searcher-destination",
            "tab-window",
            "drag-element",
            "kerbal-searcher-kerbal"
        ],
        "resources": [],
        "templates": [
            "kerbal/searcher/template.html"
        ],
        "type": "element"
    },
    "kerbal/searcher/destination": {
        "css": [
            "kerbal/searcher/common.css",
            "kerbal/searcher/destination/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/searcher/destination"
        ],
        "requires": [
            "Kerbal_link",
            "tab-window",
            "KDB",
            "kerbal-searcher-common",
            "kerbal-display"
        ],
        "resources": [],
        "templates": [
            "kerbal/searcher/destination/template.html"
        ],
        "type": "element"
    },
    "kerbal/searcher/group": {
        "css": [
            "kerbal/searcher/common.css",
            "kerbal/searcher/group/style.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/searcher/group"
        ],
        "requires": [
            "dropdown",
            "kerbal-group-display",
            "KDB",
            "kerbal-searcher-common",
            "Kerbal_link"
        ],
        "resources": [],
        "templates": [
            "kerbal/searcher/group/template.html"
        ],
        "type": "element"
    },
    "kerbal/searcher/kerbal": {
        "css": [
            "kerbal/searcher/kerbal/style.css",
            "kerbal/searcher/common.css",
            "common/float.css"
        ],
        "provides": [
            "kerbal/searcher/kerbal"
        ],
        "requires": [
            "kerbal-searcher-common",
            "KDB",
            "dropdown",
            "tab-window",
            "Kerbal_link",
            "kerbal-display"
        ],
        "resources": [],
        "templates": [
            "kerbal/searcher/kerbal/template.html"
        ],
        "type": "element"
    },
    "kerbal/tag": {
        "css": [
            "kerbal/tag/style.css"
        ],
        "provides": [
            "kerbal/tag"
        ],
        "requires": [],
        "resources": [
            "kerbal/tag/kerbal.png"
        ],
        "templates": [
            "kerbal/tag/template.html"
        ],
        "type": "element"
    },
    "tab/tabs": {
        "css": [
            "tab/tabs/style.css"
        ],
        "provides": [
            "tab/tabs"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "tab/tabs/template.html"
        ],
        "type": "element"
    },
    "tab/window": {
        "css": [
            "tab/window/style.css"
        ],
        "provides": [
            "tab/window"
        ],
        "requires": [
            "drag-element",
            "tab-tabs"
        ],
        "resources": [],
        "templates": [
            "tab/window/template.html"
        ],
        "type": "element"
    }
}
Elements.manifestLoaded = true;
Elements.__getBacklog();
