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
        "recommends": [],
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
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "Monorail": {
        "css": [],
        "provides": [],
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "drag-element"
        ],
        "resources": [],
        "templates": [
            "confirm_dialog/template.html"
        ],
        "type": "element"
    },
    "container": {
        "css": [],
        "provides": [],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "element3"
    },
    "container/autohide": {
        "css": [
            "container/autohide/autohide.css"
        ],
        "provides": [
            "container/autohide"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "container/autohide/autohideTemplate.html"
        ],
        "type": "element3"
    },
    "container/dialog": {
        "css": [
            "container/dialog/dialog.css"
        ],
        "provides": [
            "container/dialog"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "container/dialog/dialogTemplate.html"
        ],
        "type": "element3"
    },
    "container/rotate": {
        "css": [
            "common/float.css",
            "container/rotate/rotate.css"
        ],
        "provides": [
            "container/rotate"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "container/rotate/rotateTemplate.html",
            "container/rotate/stackableTemplate.html"
        ],
        "type": "element3"
    },
    "custom/input/bar": {
        "css": [
            "custom/input/bar/bar.css"
        ],
        "provides": [
            "custom/input/bar"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "custom/input/bar/barTemplate.html"
        ],
        "type": "element3"
    },
    "drag/Common": {
        "css": [],
        "provides": [
            "drag/Common"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module3"
    },
    "drag/body": {
        "css": [
            "drag/body/style.css"
        ],
        "provides": [
            "drag/body"
        ],
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "draggable-Common"
        ],
        "resources": [],
        "templates": [
            "draggable/container/template.html"
        ],
        "type": "element"
    },
    "draggable/dummy/listener": {
        "css": [
            "draggable/dummy/listener/style.css"
        ],
        "provides": [
            "draggable/dummy/listener"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "draggable/dummy/listener/template.html"
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
        "recommends": [],
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
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "dropdown/template.html"
        ],
        "type": "element"
    },
    "fakebook/post": {
        "css": [
            "fakebook/post/style.css"
        ],
        "provides": [
            "fakebook/post"
        ],
        "recommends": [],
        "requires": [],
        "resources": [
            "kerbal/tag/kerbal.png"
        ],
        "templates": [
            "fakebook/post/template.html"
        ],
        "type": "element"
    },
    "gallery/scroll/dynamic": {
        "css": [
            "gallery/scroll/dynamic/dynamic.css"
        ],
        "provides": [
            "gallery/scroll/dynamic"
        ],
        "recommends": [],
        "requires": [],
        "resources": [
            "favicon.png"
        ],
        "templates": [
            "gallery/scroll/dynamic/dynamicTemplate.html"
        ],
        "type": "element3"
    },
    "grid": {
        "css": [],
        "provides": [
            "grid"
        ],
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "KDB",
            "drag-Common",
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
        "recommends": [],
        "requires": [
            "KDB",
            "Kerbal_link",
            "drag-Common",
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "Kerbal_link",
            "drag-Common",
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
        "recommends": [],
        "requires": [
            "Kerbal_link",
            "drag-Common",
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
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "KDB",
            "drag-Common",
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
        "recommends": [],
        "requires": [
            "KDB",
            "Kerbal_link",
            "drag-Common",
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "KDB",
            "Kerbal_link",
            "drag-Common",
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
        "recommends": [],
        "requires": [
            "KDB",
            "Kerbal_link",
            "drag-Common",
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
        "recommends": [],
        "requires": [
            "KDB",
            "Kerbal_link",
            "drag-Common",
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "draggable-Common",
            "draggable-container",
            "draggable-item",
            "projects-Project"
        ],
        "resources": [],
        "templates": [
            "projects/project/display/template.html"
        ],
        "type": "element"
    },
    "projects/project/editor": {
        "css": [
            "common/float.css",
            "projects/project/editor/style.css"
        ],
        "provides": [
            "projects/project/editor"
        ],
        "recommends": [],
        "requires": [
            "drag-Common",
            "projects-Project"
        ],
        "resources": [],
        "templates": [
            "projects/project/editor/template.html"
        ],
        "type": "element"
    },
    "projects/project/full": {
        "css": [
            "common/float.css",
            "projects/project/full/full.css"
        ],
        "provides": [
            "projects/project/full"
        ],
        "recommends": [
            "container-rotate",
            "projects-project-full-display",
            "projects-project-full-editor",
            "projects-project-selection"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "projects/project/full/fullTemplate.html"
        ],
        "type": "element3"
    },
    "projects/project/full/display": {
        "css": [
            "common/float.css",
            "projects/project/full/display/display.css"
        ],
        "provides": [
            "projects/project/full/display"
        ],
        "recommends": [
            "grid"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "projects/project/full/display/displayTemplate.html"
        ],
        "type": "element3"
    },
    "projects/project/full/editor": {
        "css": [
            "common/float.css",
            "projects/project/full/editor/editor.css"
        ],
        "provides": [
            "projects/project/full/editor"
        ],
        "recommends": [
            "projects-Project"
        ],
        "requires": [],
        "resources": [],
        "templates": [
            "projects/project/full/editor/editorTemplate.html"
        ],
        "type": "element3"
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
        "recommends": [],
        "requires": [
            "drag-Common",
            "drag-element",
            "draggable-Common",
            "projects-Project",
            "projects-project-selection"
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
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "projects/project/searcher/template.html"
        ],
        "type": "element"
    },
    "projects/project/selection": {
        "css": [
            "projects/project/selection/style.css"
        ],
        "provides": [
            "projects/project/selection"
        ],
        "recommends": [],
        "requires": [
            "draggable-Common",
            "draggable-container",
            "projects-Project",
            "projects-project-display"
        ],
        "resources": [],
        "templates": [
            "projects/project/selection/template.html"
        ],
        "type": "element"
    },
    "reader/Reader": {
        "css": [],
        "provides": [
            "Reader"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [],
        "type": "module"
    },
    "tab/tabs": {
        "css": [
            "tab/tabs/style.css"
        ],
        "provides": [
            "tab/tabs"
        ],
        "recommends": [],
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
        "recommends": [],
        "requires": [
            "drag-element",
            "tab-tabs"
        ],
        "resources": [],
        "templates": [
            "tab/window/template.html"
        ],
        "type": "element"
    },
    "test": {
        "css": [
            "test/test.css"
        ],
        "provides": [
            "test"
        ],
        "recommends": [],
        "requires": [],
        "resources": [],
        "templates": [
            "test/testTemplate.html"
        ],
        "type": "element3"
    }
}
Elements.manifestLoaded = true;
Elements.__getBacklog();
