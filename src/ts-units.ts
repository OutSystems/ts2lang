import { ITsType } from "./ts-types";

export interface ITsAnnotationArgument {
    name: string;
    value: string;
}

export interface ITsAnnotation {
    name: string;
    args: ITsAnnotationArgument[];
}

export interface ITsUnit {
    annotations: ITsAnnotation[];

    addAnnotation(annot: ITsAnnotation): void;
}

// this should not appear
// @ts2lang this should appear
export interface ITopLevelTsUnit extends ITsUnit {
    name: string;
    functions: TsFunction[];
    interfaces: TsInterface[];
    classes: TsClass[];
    modules: TsModule[];
    enums: TsEnum[];

    addModule(unit: TsModule): void;
    addFunction(unit: TsFunction): void;
    addClass(unit: TsClass): void;
    addInterface(unit: TsInterface): void;
    addEnum(unit: TsEnum): void;
}

export abstract class AbstractTsUnit implements ITsUnit {
    name: string;
    annotations: ITsAnnotation[] = [];

    constructor(name: string) {
        this.name = name;
    }

    addAnnotation(annot: ITsAnnotation): void {
        let args = "";
        annot.args.forEach(arg => {
            if(args) {
                args += ", ";
            }
            args += "(name = " + arg.name + ", value = " + arg.value + ")"
        });
        this.annotations.push(annot);
    }
}

export abstract class TopLevelTsUnit extends AbstractTsUnit implements ITopLevelTsUnit {
    functions: TsFunction[] = [];
    interfaces: TsInterface[] = [];
    classes: TsClass[] = [];
    modules: TsModule[] = [];
    enums: TsEnum[] = [];
    isPublic: boolean;

    constructor(name: string, isPublic = false) {
        super(name);
        this.isPublic = isPublic;
    }

    addFunction(unit: TsFunction): void {
        this.functions.push(unit);
    }

    addInterface(unit: TsInterface): void {
        this.interfaces.push(unit);
    }

    addClass(unit: TsClass): void {
        this.classes.push(unit);
    }

    addModule(unit: TsModule): void {
        this.modules.push(unit);
    }

    addEnum(unit: TsEnum): void {
        this.enums.push(unit);
    }
}

export class TsParameter {
    name: string;
    type: ITsType;

    constructor(name: string, type: ITsType) {
        this.name = name;
        this.type = type;
    }
}

export class TsFunction extends AbstractTsUnit {
    name: string;
    parameters: TsParameter[];
    returnType: ITsType;

    constructor(name: string, parameters: TsParameter[], returnType: ITsType) {
        super(name);
        this.parameters = parameters;
        this.returnType = returnType;
    }
}

export class TsEnum extends AbstractTsUnit {
    name: string;
    options: TsEnumOption[];
    isPublic: boolean;

    constructor(name: string, options: TsEnumOption[], isPublic = false) {
        super(name);
        this.name = name;
        this.options = options;
        this.isPublic = isPublic;
    }
}

export class TsEnumOption {
    name: string;
    id: number;

    constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
    }
}

export class TsInterface extends TopLevelTsUnit {
    $interface: void; // block type compatibility with other top level unit types

    properties: TsProperty[] = [];

    addProperty(unit: TsProperty): void {
        this.properties.push(unit);
    }
}

export class TsModule extends TopLevelTsUnit {
    $module: void; // block type compatibility with other top level unit types
}

export class TsClass extends TopLevelTsUnit {
    $class: void; // block type compatibility with other top level unit types
    properties: TsProperty[] = [];

    addProperty(unit: TsProperty): void {
        this.properties.push(unit);
    }
}

export class TsProperty {
    name: string;
    type: ITsType;
    isReadOnly: boolean;

    constructor(name: string, type: ITsType, isReadOnly: boolean) {
        this.name = name;
        this.type = type;
        this.isReadOnly = isReadOnly;
    }
}
