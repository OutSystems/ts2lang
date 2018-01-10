#!/usr/bin/env node

import * as program from "commander";
import {getProjectPaths, assertProjectExists, runProject} from "./ts2lang";

var pkg = require("./package.json");

function main(projFile: string) {
    let {filePath, fileDir} = getProjectPaths(projFile);
    assertProjectExists(filePath);
    runProject(filePath, fileDir);
}

export function run() {
    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Optional path to the ts2lang config file')
        .parse(process.argv);

    main(program["file"]);
}
