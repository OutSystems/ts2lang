"use strict";
var ts = require("typescript");
var units = require("./ts-units");
var types = require("./ts-types");
function getCommentsOf(node, sourceText) {
    return ts.getLeadingCommentRanges(sourceText, node.pos) || [];
}
var modules = [];
function visitNode(node, sourceText, parentUnit) {
    var shouldContinue = true;
    var currentUnit;
    switch (node.kind) {
        case ts.SyntaxKind.SourceFile:
            var sourceFile = node;
            if (sourceFile.fileName.indexOf("lib.d.ts") < 0) {
                walkChildren(node, sourceText, parentUnit);
            }
            break;
        case ts.SyntaxKind.ModuleDeclaration:
            var moduleDeclaration = node;
            var moduleDef = new units.TsModule(moduleDeclaration.name.text);
            modules.push(moduleDef);
            parentUnit.addModule(moduleDef);
            walkChildren(node, sourceText, moduleDef);
            currentUnit = moduleDef;
            break;
        case ts.SyntaxKind.ModuleBlock:
            walkChildren(node, sourceText, parentUnit);
            break;
        case ts.SyntaxKind.ClassDeclaration:
            var classDeclaration = node;
            var classDef = new units.TsClass(classDeclaration.name.text);
            parentUnit.addClass(classDef);
            walkChildren(node, sourceText, classDef);
            currentUnit = classDef;
            break;
        case ts.SyntaxKind.InterfaceDeclaration:
            var interfaceDeclaration = node;
            var interfaceDefinition = new units.TsInterface(interfaceDeclaration.name.text);
            parentUnit.addInterface(interfaceDefinition);
            walkChildren(node, sourceText, interfaceDefinition);
            currentUnit = interfaceDefinition;
            break;
        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
            var functionDeclaration = node;
            var params = functionDeclaration.parameters.map(function (p) {
                return new units.TsParameter(p.name.getText(), typeNodeToTsType(p.type));
            });
            var functionDef = new units.TsFunction(functionDeclaration.name.getText(), params, typeNodeToTsType(functionDeclaration.type));
            parentUnit.addFunction(functionDef);
            currentUnit = functionDef;
            break;
    }
    if (currentUnit) {
        var comments = getCommentsOf(node, sourceText);
        comments
            .map(function (c) { return processComment(sourceText.substring(c.pos, c.end)); })
            .filter(function (c) { return !!c; })
            .forEach(function (c) { return currentUnit.addAnnotation(c); });
    }
}
function processComment(comment) {
    var startOfMultilineComment = comment.indexOf("/*");
    var commentText = comment.substr(2);
    var ts2langRegex = /@ts2lang\s*(\w+)\((.*)\)/g;
    var argumentRegex = /(([^=\s\|]+)\s*=\s*([^=\|]+))/g;
    var ts2langMatches = ts2langRegex.exec(commentText);
    if (ts2langMatches) {
        var annotationName = ts2langMatches[1];
        var annotationArgs = [];
        if (ts2langMatches[2]) {
            var argumentText = ts2langMatches[2];
            var argumentResults = void 0;
            while ((argumentResults = argumentRegex.exec(argumentText)) !== null) {
                annotationArgs.push({ name: argumentResults[2].trim(), value: argumentResults[3].trim() });
            }
        }
        return { name: annotationName, args: annotationArgs };
    }
    return null;
}
function typeNodeToTsType(tn) {
    switch (tn.kind) {
        case ts.SyntaxKind.TypeReference:
            var typeRef = tn;
            return new types.TsIdentifierType(typeRef.typeName.getText());
        case ts.SyntaxKind.BooleanKeyword:
            return types.TsBooleanType;
        case ts.SyntaxKind.StringKeyword:
            return types.TsStringType;
        case ts.SyntaxKind.NumberKeyword:
            return types.TsNumberType;
        case ts.SyntaxKind.VoidKeyword:
            return types.TsVoidType;
        case ts.SyntaxKind.UnionType:
            var typeUnion = tn;
            return new types.TsUnionType(typeUnion.types.map(typeNodeToTsType));
        case ts.SyntaxKind.FunctionType:
            var functionType = tn;
            var paramTypes = functionType.parameters.map(function (param) { return { name: param.name.getText(), type: typeNodeToTsType(param.type) }; });
            return new types.TsFunctionType(paramTypes, typeNodeToTsType(functionType.type));
    }
    return undefined;
}
function walkChildren(node, sourceText, parentUnit) {
    ts.forEachChild(node, function (child) {
        visitNode(child, sourceText, parentUnit);
    });
}
function collectInformation(program, sourceFile, rootModuleName) {
    var scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, sourceFile.text);
    var moduleDef = new units.TsModule(rootModuleName);
    visitNode(sourceFile, sourceFile.text, moduleDef);
    return moduleDef;
}
exports.collectInformation = collectInformation;
//# sourceMappingURL=ts-analyser.js.map