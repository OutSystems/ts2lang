#!/usr/bin/env node
/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/commander/index.d.ts" />

/// <reference path="merge.d.ts" />

import * as ts from "typescript";
import * as analyser from "./ts-analyser";
import * as Templates from "./template-runner";
import { read as readConfiguration, getTaskParameters } from "./configuration";
import { inspect } from "util";
import * as program from "commander";
import { resolve as pathCombine, dirname } from "path";
import * as merge from 'merge';


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

let fileDir = dirname(filePath);

processCommandLineArgs(filePath, fileDir);

function processCommandLineArgs(filePath: string, fileDir: string) {
    const compilerOptions: ts.CompilerOptions = {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.AMD,
        rootDir: fileDir
    };

    let configuration = readConfiguration(filePath);

    let compilerHost = ts.createCompilerHost(compilerOptions, /*setParentNodes */ true);
    
    configuration.tasks.forEach(task => {
        let sources: string[] = [];
        let input = task.input;
        
        if (typeof input === "string") {
            sources.push(input);
        } else {
            sources.concat(input);
        }
    
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
            
            let taskParameters = getTaskParameters(task);
            
            let context =
                merge({
                    $path: file.fileName,
                    $output: task.output,
                    $template: task.template,
                }, taskParameters);
                
            let transformed = Templates.loadTemplate(pathCombine(process.cwd(), "bin/template-runner.js"))
                    .transform(analyser.collectInformation(program, file, file.fileName), context); 
            console.log(transformed);
            
            // TODO: write output file
        });
    
    });
}
