'use strict'

console.log('Got manifest', performance.now());
Elements.manifest = {
    "KDB": {
        "css": [],
        "provides": [
            "KDB",
            "KNS",
            "KNS.Group",
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
    "Monorail": {
        "css": [],
        "provides": [],
        "requires": [
            "monorail-keypad"
        ],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "common/Searcher": {
        "css": [],
        "provides": [
            "common-Searcher"
        ],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "confirm_dialog": {
        "css": [
            "common/float.css",
            "confirm_dialog/style.css"
        ],
        "provides": [
            "confirm_dialog"
        ],
        "requires": [
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
    "draggable/Common": {
        "css": [],
        "provides": [
            "draggable-Common"
        ],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "draggable/container": {
        "css": [
            "draggable/container/style.css"
        ],
        "provides": [
            "draggable/container"
        ],
        "requires": [
            "draggable-Common"
        ],
        "resources": [],
        "templates": [
            "draggable/container/template.html"
        ],
        "type": "element"
    },
    "draggable/item": {
        "css": [
            "draggable/item/style.css"
        ],
        "provides": [
            "draggable/item"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "draggable/item/template.html"
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
            "KDB",
            "kerbal-group-display"
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
            "KDB",
            "dropdown",
            "kerbal-tag"
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
            "drag-element",
            "kerbal-editor-group",
            "kerbal-editor-kerbal",
            "tab-window"
        ],
        "resources": [],
        "templates": [
            "kerbal/editor/template.html"
        ],
        "type": "element"
    },
    "kerbal/editor/group": {
        "css": [
            "common/float.css",
            "kerbal/editor/group/style.css",
            "kerbal/maker/group/style.css"
        ],
        "provides": [
            "kerbal/editor/group"
        ],
        "requires": [
            "KDB",
            "dropdown",
            "kerbal-display_text",
            "kerbal-group-tag",
            "kerbal-searcher-kerbal",
            "tab-window"
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
            "common/float.css",
            "kerbal/editor/kerbal/style.css"
        ],
        "provides": [
            "kerbal/editor/kerbal"
        ],
        "requires": [
            "KDB",
            "Kerbal_link",
            "dropdown",
            "grid",
            "kerbal-display",
            "tab-window"
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
            "dropdown",
            "kerbal-group-display-kerbal",
            "kerbal-group-tag"
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
            "kerbal/importer/style.css",
            "kerbal/window_common.css"
        ],
        "provides": [
            "kerbal/importer"
        ],
        "requires": [
            "drag-element",
            "kerbal-importer-export",
            "kerbal-importer-import"
        ],
        "resources": [],
        "templates": [
            "kerbal/importer/template.html"
        ],
        "type": "element"
    },
    "kerbal/importer/export": {
        "css": [
            "common/float.css",
            "kerbal/importer/export/style.css"
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
            "common/float.css",
            "kerbal/importer/import/style.css"
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
            "kerbal/maker/style.css",
            "kerbal/window_common.css"
        ],
        "provides": [
            "kerbal/maker"
        ],
        "requires": [
            "drag-element",
            "kerbal-maker-group",
            "kerbal-maker-kerbal",
            "tab-window"
        ],
        "resources": [],
        "templates": [
            "kerbal/maker/template.html"
        ],
        "type": "element"
    },
    "kerbal/maker/group": {
        "css": [
            "common/float.css",
            "kerbal/maker/group/style.css"
        ],
        "provides": [
            "kerbal/maker/group"
        ],
        "requires": [
            "KDB",
            "kerbal-display_text",
            "kerbal-searcher-kerbal",
            "main",
            "tab-window"
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
            "common/float.css",
            "kerbal/maker/kerbal/style.css"
        ],
        "provides": [
            "kerbal/maker/kerbal"
        ],
        "requires": [
            "KDB",
            "Kerbal_link",
            "grid",
            "kerbal-display",
            "tab-window"
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
            "drag-element",
            "kerbal-searcher-destination",
            "kerbal-searcher-group",
            "kerbal-searcher-kerbal",
            "tab-window"
        ],
        "resources": [],
        "templates": [
            "kerbal/searcher/template.html"
        ],
        "type": "element"
    },
    "kerbal/searcher/Common": {
        "css": [],
        "provides": [
            "kerbal-searcher-Common"
        ],
        "requires": [
            "KDB",
            "tab-window"
        ],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "kerbal/searcher/destination": {
        "css": [
            "common/float.css",
            "kerbal/searcher/common.css",
            "kerbal/searcher/destination/style.css"
        ],
        "provides": [
            "kerbal/searcher/destination"
        ],
        "requires": [
            "KDB",
            "Kerbal_link",
            "kerbal-display",
            "kerbal-searcher-Common",
            "tab-window"
        ],
        "resources": [],
        "templates": [
            "kerbal/searcher/destination/template.html"
        ],
        "type": "element"
    },
    "kerbal/searcher/group": {
        "css": [
            "common/float.css",
            "kerbal/searcher/common.css",
            "kerbal/searcher/group/style.css"
        ],
        "provides": [
            "kerbal/searcher/group"
        ],
        "requires": [
            "KDB",
            "Kerbal_link",
            "dropdown",
            "kerbal-group-display",
            "kerbal-searcher-Common"
        ],
        "resources": [],
        "templates": [
            "kerbal/searcher/group/template.html"
        ],
        "type": "element"
    },
    "kerbal/searcher/kerbal": {
        "css": [
            "common/float.css",
            "kerbal/searcher/common.css",
            "kerbal/searcher/kerbal/style.css"
        ],
        "provides": [
            "kerbal/searcher/kerbal"
        ],
        "requires": [
            "KDB",
            "Kerbal_link",
            "dropdown",
            "kerbal-display",
            "kerbal-searcher-Common",
            "tab-window"
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
    "monorail/keypad": {
        "css": [
            "monorail/keypad/style.css"
        ],
        "provides": [
            "monorail/keypad"
        ],
        "requires": [
            "grid"
        ],
        "resources": [],
        "templates": [
            "monorail/keypad/template.html"
        ],
        "type": "element"
    },
    "monorail/output": {
        "css": [
            "monorail/output/style.css"
        ],
        "provides": [
            "monorail/output"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "monorail/output/template.html"
        ],
        "type": "element"
    },
    "projects/Project": {
        "css": [],
        "provides": [
            "projects-Project"
        ],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "projects/project/display": {
        "css": [
            "projects/project/display/style.css"
        ],
        "provides": [
            "projects/project/display"
        ],
        "requires": [
            "projects-Project"
        ],
        "resources": [],
        "templates": [
            "projects/project/display/template.html"
        ],
        "type": "element"
    },
    "projects/project/maker": {
        "css": [
            "common/float.css",
            "kerbal/window_common.css",
            "projects/project/maker/style.css"
        ],
        "provides": [
            "projects/project/maker"
        ],
        "requires": [
            "drag-element",
            "projects-Project"
        ],
        "resources": [],
        "templates": [
            "projects/project/maker/template.html"
        ],
        "type": "element"
    },
    "projects/project/searcher": {
        "css": [
            "common/float.css",
            "kerbal/searcher/common.css",
            "projects/project/searcher/style.css"
        ],
        "provides": [
            "projects/project/searcher"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "projects/project/searcher/template.html"
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
