/// <reference path="../typings/node/node.d.ts" />

import * as ts from "typescript";
import * as analyser from "./ts-analyser";

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

    let filePath = args[0];
    let compilerHost = ts.createCompilerHost(compilerOptions, /*setParentNodes */ true);
    let program = ts.createProgram([filePath], compilerOptions, compilerHost);

    let sourceFiles = program.getSourceFiles();

    console.log("Processing: " + sourceFiles.length + " file(s).");
    sourceFiles.map(sourceFile => analyser.collectInformation(program, sourceFile));
}

let cmdFilePath = process.argv.slice(2);
main(cmdFilePath);
