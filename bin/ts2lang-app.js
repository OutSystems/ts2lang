#!/usr/bin/env node
"use strict";
var program = require("commander");
var ts2lang_1 = require("./ts2lang");
var pkg = require("../package.json");
function main(projFile) {
    var _a = ts2lang_1.getProjectPaths(projFile), filePath = _a.filePath, fileDir = _a.fileDir;
    ts2lang_1.assertProjectExists(filePath);
    ts2lang_1.runProject(filePath, fileDir);
}
function run() {
    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Optional path to the ts2lang config file')
        .parse(process.argv);
    main(program["file"]);
}
exports.run = run;
if (!module.parent) {
    run();
}
//# sourceMappingURL=ts2lang-app.js.map