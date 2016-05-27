import { ITsType } from "./Types/ITsType";

export interface ITsUnit {

}

export interface ITopLevelTsUnit extends ITsUnit {
    Name: string;
    addModule(unit: TsModule);
    addFunction(unit: TsFunction);
    addClass(unit: TsClass);
    addInterface(unit: TsInterface);
}

export class TsParameter {
    Name: string;
    Type: ITsType;

    constructor(name: string, type: ITsType) {
        this.Name = name;
        this.Type = type;
    }
}

export class TsFunction implements ITsUnit {
    Name: string;
    Parameters: TsParameter[];
    ReturnType: ITsType;

    constructor(name: string, parameters: TsParameter[], returnType: ITsType) {
        this.Name = name;
        this.Parameters = parameters;
        this.ReturnType = returnType;
    }
}

export class TsInterface implements ITopLevelTsUnit {
    Name: string;

    constructor(name: string) {
        this.Name = name;
    }

    addFunction(unit: TsFunction) {
        console.log("Adding function to " + this.Name + ": " + unit.Name);
    }
    addInterface(unit: TsInterface) {
        console.log("Adding interface to " + this.Name + ": " + unit.Name);
    }
    addClass(unit: TsClass) {
        console.log("Adding class to " + this.Name + ": " + unit.Name);
    }
    addModule(unit: TsModule) {
        console.log("Adding module to " + this.Name + ": " + unit.Name);
    }
}

export class TsModule implements ITopLevelTsUnit {
    Name: string;

    constructor(name: string) {
        this.Name = name;
    }

    addFunction(unit: TsFunction) {
        console.log("Adding function to " + this.Name + ": " + unit.Name);
    }
    addInterface(unit: TsInterface) {
        console.log("Adding interface to " + this.Name + ": " + unit.Name);
    }
    addClass(unit: TsClass) {
        console.log("Adding class to " + this.Name + ": " + unit.Name);
    }
    addModule(unit: TsModule) {
        console.log("Adding module to " + this.Name + ": " + unit.Name);
    }
}

export class TsClass implements ITopLevelTsUnit {
    Name: string;

    constructor(name: string) {
        this.Name = name;
    }

    addFunction(unit: TsFunction) {
        console.log("Adding function to " + this.Name + ": " + unit.Name);
    }
    addInterface(unit: TsInterface) {
        console.log("Adding interface to " + this.Name + ": " + unit.Name);
    }
    addClass(unit: TsClass) {
        console.log("Adding class to " + this.Name + ": " + unit.Name);
    }
    addModule(unit: TsModule) {
        console.log("Adding module to " + this.Name + ": " + unit.Name);
    }
}

