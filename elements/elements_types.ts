export type ElementType =
	"module" |
	"element" |
	"element3" |
	"module3" |
	"element4" |
	"module4" |
	"script4";

export interface manifest_single {
	"css": Array<string>,
	"provides": Array<string>,
	"recommends": Array<string>,
	"requires": Array<string>,
	"resources": Array<string>,
	"templates": Array<string>,
	"type": ElementType;
};

export interface manifest_optional extends Partial<manifest_single> {
	"type": ElementType;
};

export interface manifest_t {
	[key: string]: manifest_single;
};

export interface manifest_t_optional {
	[key: string]: manifest_optional;
}

export type manifest_type_array = Array<'css' | 'provides' | 'recommends' | 'requires' | 'resources' | 'templates'>;

export type PromiseCallback = (value: void | PromiseLike<void>) => void;


export type Elements_Options = Partial<{
	'ELEMENTS_CORE_LOCATION': string;
	'short_duration': number;
	'medium_duration': number;
	'long_duration': number;
	'drop_amount': number;
	'theme': string;
}> | undefined;
