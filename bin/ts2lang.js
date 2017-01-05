"use strict";
var ts = require("typescript");
var analyser = require("./ts-analyser");
var Templates = require("./template-runner");
var configuration_1 = require("./configuration");
var path_1 = require("path");
var merge = require("merge");
var fs_1 = require("fs");
var is_directory_1 = require("is-directory");
function getProjectPaths(requestedPath) {
    var DEFAULT_PROJ_FILENAME = "./ts2lang.json";
    if (!requestedPath) {
        requestedPath = DEFAULT_PROJ_FILENAME;
    }
    if (is_directory_1.sync(requestedPath)) {
        return {
            filePath: path_1.resolve(requestedPath, DEFAULT_PROJ_FILENAME),
            fileDir: requestedPath,
        };
    }
    return {
        filePath: requestedPath,
        fileDir: path_1.dirname(requestedPath),
    };
}
exports.getProjectPaths = getProjectPaths;
function assertProjectExists(filePath) {
    if (!fs_1.existsSync(filePath)) {
        console.error("Couldn't file project file.");
        console.error("Was looking for it in " + filePath);
        throw new Error("Project file not found.");
    }
}
exports.assertProjectExists = assertProjectExists;
function runProject(filePath, fileDir) {
    var compilerOptions = {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.AMD,
        rootDir: fileDir
    };
    var configuration = configuration_1.read(filePath);
    var compilerHost = ts.createCompilerHost(compilerOptions, true);
    configuration.tasks.forEach(function (task) {
        var sources = [];
        var input = task.input;
        if (typeof input === "string") {
            sources.push(input);
        }
        else {
            sources.concat(input);
        }
        sources = sources.map(function (path) { return path_1.resolve(fileDir, path); });
        var program = ts.createProgram(sources, compilerOptions, compilerHost);
        var sourceFiles = program.getSourceFiles();
        sources.forEach(function (source) {
            var file = sourceFiles.filter(function (file) { return isSamePath(file.fileName, source); })[0];
            var taskParameters = configuration_1.getTaskParameters(task);
            var context = merge({
                $path: file.fileName,
                $output: task.output,
                $template: task.template,
            }, taskParameters);
            var transformed = Templates.loadTemplate(path_1.resolve(fileDir, task.template))
                .transform(analyser.collectInformation(program, file, file.fileName), context);
            output(transformed, fileDir, task.output);
        });
    });
}
exports.runProject = runProject;
function output(content, targetDir, target) {
    if (!target || target === "-") {
        process.stdout.write(content);
    }
    else {
        fs_1.writeFileSync(path_1.resolve(targetDir, target), content);
    }
}
function isSamePath(path1, path2) {
    var p1 = path_1.normalize(path1).toLowerCase();
    var p2 = path_1.normalize(path2).toLowerCase();
    return p1 === p2;
}
//# sourceMappingURL=ts2lang.js.map