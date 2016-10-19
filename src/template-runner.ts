import * as Types from "./ts-types";
import * as Units from "./ts-units";
import { readFileSync } from "fs";

class DummyTemplate {
    
    constructor(private context: Object) {}
    
    dumpModule = (module: Units.TsModule) => {
        return module.classes
            .map(this.dumpClass)
            .join("\n");
    }
    
    dumpClass = (klass: Units.TsClass) => {
        return `CLASS ${klass.name}${this.context["extraInfo1"]} {\n` +
            klass.functions.map(this.dumpMethod).join("\n") +
            "\n}";
    }
    
    dumpMethod = (method: Units.TsFunction) => {
        let parameters = method.parameters.map(p => `${p.name}: ${p.type.name}`).join(", ");
        return `${method.name}(${parameters})`;
    }
}

export function transform(module: Units.TsModule, context: Object): string {
    return (new DummyTemplate(context)).dumpModule(module);
}

interface ITemplate {
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