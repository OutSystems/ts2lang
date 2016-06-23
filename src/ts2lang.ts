#!/usr/bin/env node
/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/commander/index.d.ts" />

import * as ts from "typescript";
import * as analyser from "./ts-analyser";
import * as Templates from "./template-runner";
import { read as readConfiguration } from "./configuration";
import { inspect } from "util";

import * as program from "commander";
var pkg = require("../package.json");

program
    .version(pkg.version)
    .option('-f, --file [file]', 'Optional path to the ts2lang config file.')
    .parse(process.argv);

let filePath: string = undefined;
let providedFileArg = program["file"];

if (providedFileArg) {
    filePath = providedFileArg;
} else {
    filePath = "./ts2lang.json";
}

processCommandLineArgs(filePath);

function processCommandLineArgs(filePath: string) {
    const compilerOptions: ts.CompilerOptions = {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.AMD
    };

    let configuration = readConfiguration(filePath);

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
            Templates.transform(analyser.collectInformation(program, file, file.fileName))
        );
    });
}
