import * as Types from "./ts-types";
import * as Units from "./ts-units";
import { readFileSync } from "fs";


function getFunctionReturnType(func: Units.TsFunction): string {
    if ((<Types.TsIdentifierType> func.returnType).parameters) {
        return (<Types.TsIdentifierType>func.returnType).parameters[0].name;
    }
    return func.returnType.name;
}

class DummyTemplate {
    
    constructor(private context: Object) {}

    dumpDoc = (u: Units.INamedTsUnit) => {
        if (u.documentation) {
            return `DOCS[${JSON.stringify(u.documentation)}]\n`;
        }
        return "";
    }
    
    dumpModule = (module: Units.TsModule) => {
        return module.classes.map(this.dumpClass).join("\n") + "\n" + 
            module.interfaces.map(this.dumpInterface).join("\n") + "\n" + 
            module.enums.map(this.dumpEnum).join("\n");
    }
    
    dumpClass = (klass: Units.TsClass) => {
        return this.dumpDoc(klass) +
            `CLASS ${klass.name}${this.context["extraInfo1"]} {\n` +
            klass.functions.map(this.dumpMethod).join("\n") +
            "\n}";
    }

    dumpInterface = (interf: Units.TsInterface) => {
        return this.dumpDoc(interf) +
            `INTERFACE ${interf.name}${this.context["extraInfo1"]} {\n` +
            interf.functions.map(this.dumpMethod).join("\n") +
            "\n}";
    }
    
    dumpMethod = (method: Units.TsFunction) => {
        let parameters = method.parameters.map(p => `${this.dumpDoc(p)}${p.name}: ${p.type.name}`).join(", ");
        return this.dumpDoc(method) + `${getFunctionReturnType(method)} ${method.name}(${parameters})`;
    }

    dumpEnum = (enumz: Units.TsEnum) => {
        return this.dumpDoc(enumz) +
            `ENUM ${enumz.name} {\n` +
            enumz.options.map(x => { return this.dumpDoc(x) + x.name + (x.id === undefined? "" : " = " + x.id) }).join(",\n") +
            "\n}";
    }
}

export function transform(module: Units.TsModule, context: Object): string {
    return (new DummyTemplate(context)).dumpModule(module);
}

export interface ITemplate {
    transform: (module: Units.TsModule, context: Object) => string;
}

export function loadTemplate(path: string): ITemplate {
    // var templateExports: ITemplate = { transform: undefined };
    // var templateFunc = new Function("exports", readFileSync(path).toString());
    // templateFunc(templateExports);
    
    var templateExports: ITemplate = require(path);
    if (typeof templateExports.transform !== 'function') {
        throw new Error(`Template loaded from "${require.resolve(path)}" doesn't provide a "transform" function`);
    }
    
    return templateExports;
}