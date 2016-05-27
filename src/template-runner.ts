import * as Types from "./ts-types";
import * as Units from "./ts-units";
import { readFileSync } from "fs";

module DummyTemplate {
    export function dumpModule(module: Units.TsModule) {
        return module.classes
            .map(dumpClass)
            .join("\n");
    }
    
    function dumpClass(klass: Units.TsClass) {
        return `CLASS ${klass.name} {\n` +
            klass.functions.map(dumpMethod).join("\n") +
            "\n}";
    }
    
    function dumpMethod(method: Units.TsFunction) {
        let parameters = method.parameters.map(p => `${p.name}: ${p.type.name}`).join(", ");
        return `${method.name}(${parameters})`;
    }
}

export function transform(module: Units.TsModule): string {
    return DummyTemplate.dumpModule(module);
}

interface ITemplate {
    transform: (module: Units.TsModule) => string;
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