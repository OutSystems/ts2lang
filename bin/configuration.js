"use strict";
var fs_1 = require("fs");
var util_1 = require("util");
function read(path) {
    if (!fs_1.existsSync(path)) {
        throw new Error("Could not read configuration file @ " + path);
    }
    var result = JSON.parse(stripComments(fs_1.readFileSync(path).toString()));
    ConfigValidator.validate(result);
    return result;
}
exports.read = read;
function stripComments(s) {
    var comments = /(\/\/.*)|(\/\*.*?\*\/)|"([^"\\]|\\.)*"/g;
    return s.replace(comments, function (s) { return s.charAt(0) === '"' ? s : ""; });
}
function getTaskParameters(task) {
    return task.parameters || {};
}
exports.getTaskParameters = getTaskParameters;
var ConfigValidator;
(function (ConfigValidator) {
    function assert(cond, msg, extraContext) {
        if (!cond) {
            if (extraContext) {
                msg += "\n--- context ---\n";
                msg += util_1.inspect(extraContext, {
                    depth: 2,
                    maxArrayLength: 3
                });
                msg += "\n--- context end ---";
            }
            throw new Error(msg);
        }
    }
    function checkKnownProps(obj, props, where) {
        Object.keys(obj)
            .filter(function (key) { return props.indexOf(key) === -1; })
            .forEach(function (key) { return console.warn("WARNING: unknown '" + key + "' configuration'" +
            where ? " in " + where : ""); });
    }
    function validate(root) {
        assert(typeof root === "object", "configuration root must be an dictionary", root);
        checkKnownProps(root, ["tasks", "parameters"], "root configuration");
        assert(Array.isArray(root.tasks), "configuration must have tasks");
        root.tasks.forEach(validateTask);
    }
    ConfigValidator.validate = validate;
    function validateTask(task) {
        assert(typeof task === "object", "task configuration must be a dictionary", task);
        checkKnownProps(task, ["input", "output", "template", "parameters"], "task configuration");
        assert(typeof task.input === "string" || Array.isArray(task.input), "tasks must have input(s)", task);
        assert(typeof task.output === "string", "tasks must have outputs", task);
        assert(typeof task.template === "string", "tasks must have a template", task);
    }
})(ConfigValidator || (ConfigValidator = {}));
//# sourceMappingURL=configuration.js.map