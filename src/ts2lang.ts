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
import { resolve as pathCombine, dirname, normalize } from "path";
import * as merge from 'merge';
import { writeFileSync, existsSync } from 'fs';
import { sync as isDirectory } from 'is-directory';


var pkg = require("../package.json");

program
    .version(pkg.version)
    .option('-f, --file [file]', 'Optional path to the ts2lang config file')
    .parse(process.argv);

main(program["file"]);

function main(projFile: string) {
    let {filePath, fileDir} = getProjectPaths(projFile);
    assertProjectExists(filePath);
    runProject(filePath, fileDir);
}

function getProjectPaths(requestedPath: string) {
    const DEFAULT_PROJ_FILENAME = "./ts2lang.json";
    if (!requestedPath) { requestedPath = DEFAULT_PROJ_FILENAME; }
    if (isDirectory(requestedPath)) {
        return {
            filePath: pathCombine(requestedPath, DEFAULT_PROJ_FILENAME),
            fileDir: requestedPath,
        }
    }
    return {
        filePath: requestedPath,
        fileDir: dirname(requestedPath),
    }
}

function assertProjectExists(filePath: string) {
    if (!existsSync(filePath)) {
        console.error(`Couldn't file project file.`);
        console.error(`Was looking for it in ${filePath}`);
        throw new Error("Project file not found.");
    }
}

function runProject(filePath: string, fileDir: string) {
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

        sources = sources.map(path => pathCombine(fileDir, path));
    
        let program = ts.createProgram(sources, compilerOptions, compilerHost);

        let sourceFiles = program.getSourceFiles();

        // console.log(
        //     inspect(sourceFiles.map(sourceFile => {
        //         let moduleName = sourceFile.fileName;
        //         moduleName = moduleName.substring(0, moduleName.lastIndexOf('.'));
        //         return analyser.collectInformation(program, sourceFile, moduleName);
        //     }), false, 10)
        // );

        sources.forEach(source => {
            let file = sourceFiles.filter(file => isSamePath(file.fileName, source))[0];
            
            let taskParameters = getTaskParameters(task);
            
            let context =
                merge({
                    $path: file.fileName,
                    $output: task.output,
                    $template: task.template,
                }, taskParameters);
                
            let transformed = Templates.loadTemplate(pathCombine(fileDir, task.template))
                    .transform(analyser.collectInformation(program, file, file.fileName), context); 
            
            output(transformed, fileDir, task.output);
            
        });
    
    });
}

/**
 * writes data to the target file or STDOUT if filename provided is '-' or falsey
 */
function output(content: string, targetDir: string, target: string) {
    if (!target || target === "-") {
        process.stdout.write(content);
    } else {
        writeFileSync(pathCombine(targetDir, target), content);
    }
}

/**
 * given two absolute paths, check if they're the same path, despite having
 * different path separators (on Windows, node-fs and tsc will report the paths differently)
 */
function isSamePath(path1, path2) {
    // TODO: improve this for case-sensitive filesystems
    //       or maybe use typescript's path handling functions
    let p1 = normalize(path1).toLowerCase();
    let p2 = normalize(path2).toLowerCase();
    return p1 === p2;
}