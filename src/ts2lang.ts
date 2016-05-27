/// <reference path="../typings/node/node.d.ts" />

import * as ts from "typescript";
import * as analyser from "./ts-analyser";
import * as Templates from "./template-runner";
import { read as readConfiguration } from "./configuration";
import { inspect } from "util";
import { resolve as pathCombine } from "path";

function main(args: string[]) {
    // allways have to receive an argument and it must be a path
    if (!(!!args && args.length !== 0)) {
        console.log("No parameters were passed!");
        process.exit(1);
    }

    const compilerOptions: ts.CompilerOptions = {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.AMD
    };
    
    // TODO: parameter reading
    // TODO: assuming single task in configuration
    let configuration = readConfiguration(args[0]);

    let sources: string[] = [];
    
    configuration.tasks.forEach(task => {
        let input = task.input;
        if (typeof input === "string") {
            sources.push(input);
        } else {
            sources.concat(input);
        }
    });
    
    let compilerHost = ts.createCompilerHost(compilerOptions, /*setParentNodes */ true);
    let program = ts.createProgram(sources, compilerOptions, compilerHost);

    let sourceFiles = program.getSourceFiles();

    console.log("Processing: " + sourceFiles.length + " file(s).");
    console.log(
        inspect(sourceFiles.map(sourceFile => {
            let moduleName = sourceFile.fileName;
            moduleName = moduleName.substring(0, moduleName.lastIndexOf('.'));
            return analyser.collectInformation(program, sourceFile, moduleName);
        }), false, 10)
    );
    sources.forEach(source => {
        let file = sourceFiles.filter(file => file.fileName === source)[0];
        console.log(
            Templates.loadTemplate(pathCombine(process.cwd(), "bin/template-runner.js"))
                .transform(analyser.collectInformation(program, file, file.fileName))
        );
    });
}

let cmdFilePath = process.argv.slice(2);
main(cmdFilePath);
