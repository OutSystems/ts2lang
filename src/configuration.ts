import { readFileSync, existsSync } from "fs";
import { inspect, InspectOptions } from "util";

export function read(path: string): IConfigurationRoot {
    if (!existsSync(path)) {
        throw new Error("Could not read configuration file @ " + path);
    }
    
    var result = JSON.parse(stripComments(readFileSync(path).toString()));
    
    ConfigValidator.validate(result);
    
    return result;
}

/**
 * strips JS-like comments from code string
 */
function stripComments(s: string): string {
    var comments = /(\/\/.*)|(\/\*.*?\*\/)|"([^"\\]|\\.)*"/g
    return s.replace(comments, s => s.charAt(0) === '"' ? s : "");
}

export function getTaskParameters(task: IConfigurationTask): IConfigurationParameterMap {
    // let map: IConfigurationParameterMap = {};
    // task.parameters.forEach(p => {
    //     map[p.name] = p.value;
    // });
    // return map;
    return task.parameters || {};
}

export interface IConfigurationRoot {
    tasks: IConfigurationTask[];
    parameters?: IConfigurationParameter[];
}

export interface IConfigurationTask {
    input: string | string[];
    output: string;
    template: string;
    parameters?: IConfigurationParameterMap;
}

export interface IConfigurationParameter {
    name: string,
    value: string,
}

export interface IConfigurationParameterMap {
    [name: string]: string;
}

module ConfigValidator {
    function assert(cond: boolean, msg: string, extraContext?: any) {
        if (!cond) {
            if (extraContext) {
                msg += "\n--- context ---\n"
                msg += inspect(extraContext, {
                    depth: 2,
                    maxArrayLength: 3
                } as InspectOptions);
                msg += "\n--- context end ---";
            }
            throw new Error(msg);
        }
    }
    
    function checkKnownProps(obj: Object, props: string[], where?: string) {
        Object.keys(obj)
            .filter(key => props.indexOf(key) === -1)
            .forEach(key => console.warn(`WARNING: unknown '${key}' configuration'` +
                where ? " in " + where : ""));        
    }
    
    export function validate(root: IConfigurationRoot) {
        assert(typeof root === "object", "configuration root must be an dictionary", root);
        checkKnownProps(root, ["tasks", "parameters"], "root configuration");
        assert(Array.isArray(root.tasks), "configuration must have tasks");
        root.tasks.forEach(validateTask);
    }
    
    function validateTask(task: IConfigurationTask) {
        assert(typeof task === "object", "task configuration must be a dictionary", task);
        checkKnownProps(task, ["input", "output", "template", "parameters"], "task configuration");
        assert(typeof task.input === "string" || Array.isArray(task.input), "tasks must have input(s)", task);
        assert(typeof task.output === "string", "tasks must have outputs", task);
        assert(typeof task.template === "string", "tasks must have a template", task);
    }
}