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
    
    addAnnotation(annot: ITsAnnotation);
}

// This should not appear
// @ts2lang this should appear
export interface ITopLevelTsUnit extends ITsUnit {
    name: string;
    functions: TsFunction[];
    interfaces: TsInterface[];
    classes: TsClass[];
    modules: TsModule[];
    
    addModule(unit: TsModule);
    addFunction(unit: TsFunction);
    addClass(unit: TsClass);
    addInterface(unit: TsInterface);
}

export abstract class AbstractTsUnit implements ITsUnit {
    name: string;
    annotations: ITsAnnotation[] = [];
    
    constructor(name: string) {
        this.name = name;
    }
    
    addAnnotation(annot: ITsAnnotation) {
        let args = "";
        annot.args.forEach(arg => {
            if(args) {
                args += ", ";
            }
            args += "(name = " + arg.name + ", value = " + arg.value + ")"
        });
        console.log("Adding annotation " + annot.name + " to " + this.name + " with arguments " + args);
        this.annotations.push(annot);
    }
}

export abstract class TopLevelTsUnit extends AbstractTsUnit implements ITopLevelTsUnit {
    functions: TsFunction[] = [];
    interfaces: TsInterface[] = [];
    classes: TsClass[] = [];
    modules: TsModule[] = [];
    
    constructor(name: string) {
        super(name);
    }
    addFunction(unit: TsFunction) {
        console.log("Adding function to " + this.name + ": " + unit.name);
        this.functions.push(unit);
    }
    addInterface(unit: TsInterface) {
        console.log("Adding interface to " + this.name + ": " + unit.name);
        this.interfaces.push(unit);
    }
    addClass(unit: TsClass) {
        console.log("Adding class to " + this.name + ": " + unit.name);
        this.classes.push(unit);
    }
    addModule(unit: TsModule) {
        console.log("Adding module to " + this.name + ": " + unit.name);
        this.modules.push(unit);
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

export class TsInterface extends TopLevelTsUnit { }

export class TsModule extends TopLevelTsUnit { }

export class TsClass extends TopLevelTsUnit { }

