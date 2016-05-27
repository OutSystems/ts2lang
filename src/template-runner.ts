import * as Types from "./ts-types";
import * as Units from "./ts-units"

module DummyTemplate {
    export function dumpClassSignature(klass: Units.TsClass) {
        return `CLASS ${klass.name} {\n` +
            `${klass.functions.map(f =>
                `${f.name}(${f.parameters.map(p => `${p.name}: ${p.type.name}`).join(", ")})`
                ).join("\n")}
            }`;
    }
}

export function parse(klass: Units.TsClass) {
    console.log(DummyTemplate.dumpClassSignature(klass));
}