import * as Types from "./ts-types";
import * as Units from "./ts-units"

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