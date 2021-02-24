#!/usr/bin/env node

import * as program from "commander";
import {getProjectPaths, assertProjectExists, runProject, listInputFiles} from "./ts2lang";

var pkg = require("./package.json");

function main(projFile: string, defaultTemplate: string, listFiles: boolean) {
    let {filePath, fileDir} = getProjectPaths(projFile);

    if (listFiles){
        listInputFiles(filePath, fileDir);
        return;
    }

    assertProjectExists(filePath);
    runProject(filePath, fileDir, defaultTemplate);
}

export function run() {
    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Optional path to the ts2lang config file')
        .option('-t, --template [template]', 'Optional path to the default ts2lang template file')
        .option('-l, --list', 'Print names of generated files part of the compilation')
        .parse(process.argv);
    
    main(program["file"], program["template"], program["list"]);
}
