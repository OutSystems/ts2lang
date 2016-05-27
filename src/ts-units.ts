import { ITsType } from "./ts-types";

export interface ITsUnit {

}

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

export abstract class TopLevelTsUnit implements ITopLevelTsUnit {
    name: string;
    functions: TsFunction[] = [];
    interfaces: TsInterface[] = [];
    classes: TsClass[] = [];
    modules: TsModule[] = [];
    
    constructor(name: string) {
        this.name = name;
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

export class TsFunction implements ITsUnit {
    name: string;
    parameters: TsParameter[];
    returnType: ITsType;

    constructor(name: string, parameters: TsParameter[], returnType: ITsType) {
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
    }
}

export class TsInterface extends TopLevelTsUnit { }

export class TsModule extends TopLevelTsUnit { }

export class TsClass extends TopLevelTsUnit { }

