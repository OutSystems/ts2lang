/// <reference path="merge.d.ts" />

import * as ts from "typescript";
import * as analyser from "./ts-analyser";
import * as Templates from "./template-runner";
import { read as readConfiguration, getTaskParameters } from "./configuration";
import { resolve as pathCombine, dirname, normalize, sep as pathSeparator } from "path";
import * as merge from "merge";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { sync as isDirectory } from "is-directory";
import * as glob from "glob";

export function getProjectPaths(requestedPath: string) {
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

export function assertProjectExists(filePath: string) {
    if (!existsSync(filePath)) {
        console.error(`Couldn't file project file.`);
        console.error(`Was looking for it in ${filePath}`);
        throw new Error("Project file not found.");
    }
}

export function runProject(filePath: string, fileDir: string, defaultTemplate: string) {
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
            let inputPath = pathCombine(fileDir, input); 
            sources = glob.sync(inputPath);
        } else {
            sources = input.map(path => pathCombine(fileDir, path));
        }
    
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

            if (!file) {
                console.error(`Couldn't file source file ${source}.`);
                throw new Error("Source file not found.");
            }

            let taskParameters = getTaskParameters(task);
            let template = task.template || defaultTemplate;

            let context: any =
                merge({
                    $fullpath: file.fileName,
                    $path: task.input,
                    $output: task.output,
                    $template: template,
                }, taskParameters);

            try {
                let moduleInfo = analyser.collectInformation(program, file, file.fileName);
                let transformed = Templates
                    .loadTemplate(pathCombine(fileDir, template))
                    .transform(moduleInfo, context);

                if (transformed) {
                    output(transformed, fileDir, context.$output);
                }
            } catch (e) {
                console.error(`Error transforming source file ${source}: ${(e as Error).stack}`);
                throw new Error("Error transforming source file.");
            }
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
        let outputPath = pathCombine(targetDir, target);
        ensureDirectoryExists(dirname(outputPath));
        writeFileSync(outputPath, content);
    }
}

function ensureDirectoryExists(path: string) {
    path = path.replace(/\\/g, pathSeparator);
    path.split(pathSeparator).reduce((prev, curr) => {
        let aggregatedPath = prev + pathSeparator + curr;
        if(existsSync(aggregatedPath) === false) {
            mkdirSync(aggregatedPath);
        }
        return aggregatedPath;
	});
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