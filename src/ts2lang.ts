/// <reference path="../typings/node/node.d.ts" />

import * as ts from "typescript";
import * as analyser from "./ts-analyser";
import * as Templates from "./template-runner";
import { read as readConfiguration } from "./configuration";
import { inspect } from "util";

function main(args: string[]) {
    // allways have to receive an argument and it must be a path
    if (!(!!args && args.length !== 0)) {
        console.log("No parameters were passed!");
    }

    const compilerOptions: ts.CompilerOptions = {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.AMD
    };
    
    // TODO: parameter reading
    // TODO: assuming single input file in configuration
    let configuration = readConfiguration(args[0]);

    let filePath = configuration.tasks[0].input as string;
    
    let sources = [filePath];
    
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
            Templates.transform(analyser.collectInformation(program, file, file.fileName))
        );
    });
}

let cmdFilePath = process.argv.slice(2);
main(cmdFilePath);
