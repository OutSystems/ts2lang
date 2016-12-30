"use strict";
var DummyTemplate = (function () {
    function DummyTemplate(context) {
        var _this = this;
        this.context = context;
        this.dumpModule = function (module) {
            return module.classes
                .map(_this.dumpClass)
                .join("\n");
        };
        this.dumpClass = function (klass) {
            return "CLASS " + klass.name + _this.context["extraInfo1"] + " {\n" +
                klass.functions.map(_this.dumpMethod).join("\n") +
                "\n}";
        };
        this.dumpMethod = function (method) {
            var parameters = method.parameters.map(function (p) { return p.name + ": " + p.type.name; }).join(", ");
            return method.name + "(" + parameters + ")";
        };
    }
    return DummyTemplate;
}());
function transform(module, context) {
    return (new DummyTemplate(context)).dumpModule(module);
}
exports.transform = transform;
function loadTemplate(path) {
    var templateExports = require(path);
    if (typeof templateExports.transform !== 'function') {
        throw new Error("Template loaded from \"" + require.resolve(path) + "\" doesn't provide a \"transform\" function");
    }
    return templateExports;
}
exports.loadTemplate = loadTemplate;
//# sourceMappingURL=template-runner.js.map