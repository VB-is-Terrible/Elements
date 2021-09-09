How shit works

e = (await import ('./elements/elements_core.js')).Elements

Definitions:
	Module: a standalone js file
	Element: a module that loads a custom element

1.	Modules can assume that backbone.js has executed
2.	Modules are packaged into standalone js files.
	As files are loaded async, other than backbone.js, there are no
	execution order guarantees.
	a.	Use Elements.get to load any dependancies
	b.	Await a Elements.get call to wait until those dependancies are loaded
3.	Modules must to call either Elements.load or Elements.loaded eventually
	a.	Elements should call Elements.load, which loads any needed templates
		and then registers the element
	b.	Non-Element modules should call Elements.loaded, this registers a
		module as loaded.
4.	Elements should inherit from Elements.elements.backbone or Elements.elements.backbone2.
	This is required for setUpAttrPropertyLink to work
5. 	Modules should correctly declare their dependencies in elementsManifest.json
	This is required for network optimization
6.	Elements should fully support custom element upgrading.
	a. backbone 1
		This unfortunately means that generally ES6 class getter/setter pairs can't be used, and
		instead need to be declared through Object.defineProperty
	b. backbone 2
		ES6 class getter/setters can be used, however, the previous value before upgrading are deleted. Restore them with applyPriorProperty/applyPriorProperties
7.	Due to bugs in chrome, within the constructor, within arrow functions,
	self should be used instead of this


Manifest format:

| Field | Use | Example |
| - | | |
| type | Defines resoultion behaviour | "element"\|"module"|
| requires | Things that this will require | ["element", "dependancies"] |
| templates | Templates used by this elements | ["kerbalEditorTemplate.html"] |
| css | CSS used by this | ["kerbalEditor.css"] |
| resources | Other files used by this | ["warning.svg"] | |
| provides | Useful for meta-packages and modules | ["kerbal-editor"]

TODO:
kerbal-editor-group:

* Add kerbals Done
* Remove Kerbals Done
* Delete Group Done
* Loading Done
* Clearing
* Disabling
* Listening for kerbal deletion gallery:
* Skipping images when zoomed

backbone v5:

| Feature | Status |
| - | - |
Private fields + members | Done
Top level await | Done
Explicit manifest | Testing
Coreless support (Done)
Initless support (Move manifest loading back to core) | Done

| Optional Features | Status |
| - | - |
| Globaling in core | Not possible |
| Private applyPriorProperties | Done |

Take a look at drag, seems to have stopped dying

Chrome freaks out with no-mode CORS prefetch tags.
