import * as ts from "typescript";
import * as units from "./ts-units";
import * as types from "./ts-types";

function getCommentsOf(node: ts.Node, sourceText: string) {
    return ts.getLeadingCommentRanges(sourceText, node.pos) || [];
}

let modules: units.TsModule[] = [];

function visitNode(node: ts.Node, sourceText: string, parentUnit: units.ITopLevelTsUnit) {
    let shouldContinue = true;
    let currentUnit: units.ITsUnit;
    
    switch (node.kind) {
        case ts.SyntaxKind.SourceFile:
            let sourceFile = <ts.SourceFile> node;

            if (sourceFile.fileName.indexOf("lib.d.ts") < 0) {
                walkChildren(node, sourceText, parentUnit);
            }
            break;

        case ts.SyntaxKind.ModuleDeclaration:
            let moduleDeclaration = <ts.ModuleDeclaration> node;
            let moduleDef = new units.TsModule(moduleDeclaration.name.text);
            modules.push(moduleDef);
            parentUnit.addModule(moduleDef);
            // console.log("Visiting children of " + moduleDef.Name);
            walkChildren(node, sourceText, moduleDef);
            currentUnit = moduleDef;
            break;

        case ts.SyntaxKind.ModuleBlock:
            walkChildren(node, sourceText, parentUnit);
            break;

        case ts.SyntaxKind.ClassDeclaration:
            let classDeclaration = <ts.ClassDeclaration> node;
            let classDef = new units.TsClass(classDeclaration.name.text);

            parentUnit.addClass(classDef);
            walkChildren(node, sourceText, classDef);
            currentUnit = classDef;
            break;

        case ts.SyntaxKind.InterfaceDeclaration:
            let interfaceDeclaration = <ts.InterfaceDeclaration> node;
            let interfaceDefinition = new units.TsInterface(interfaceDeclaration.name.text);
            parentUnit.addInterface(interfaceDefinition);
            walkChildren(node, sourceText, interfaceDefinition);
            currentUnit = interfaceDefinition;
            break;

        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
            let functionDeclaration = <ts.SignatureDeclaration> node;
            // console.log(functionDeclaration.parameters);
            let params = functionDeclaration.parameters.map(p => {
                return new units.TsParameter(p.name.getText(), typeNodeToTsType(p.type));
            });
            let functionDef = new units.TsFunction(functionDeclaration.name.getText(), params, null);
            parentUnit.addFunction(functionDef);
            
            currentUnit = functionDef;
            break;
    }
    
    if (currentUnit) {
        let comments = getCommentsOf(node, sourceText);
        console.log("Processing comments...")
        comments
            .map((c) => processComment(sourceText.substring(c.pos, c.end)))
            .filter((c) => !!c)
            .forEach((c) => currentUnit.addAnnotation(c));

        console.log("Done!")
    }
}

function processComment(comment: string): units.ITsAnnotation {
    let startOfMultilineComment = comment.indexOf("/*");
    let commentText = comment.substr(2); // drop first two characters (either // or /*)
    
    console.log("Final text:", commentText);
    
    let ts2langRegex = /@ts2lang\s*(\w+)\((.*)\)/g;
    let argumentRegex = /(([^=\s\|]+)\s*=\s*([^=\|]+))/g;
    let ts2langMatches = ts2langRegex.exec(commentText);
    
    if (ts2langMatches) {
        let annotationName = ts2langMatches[1];
        let annotationArgs: units.ITsAnnotationArgument[] = [];
        
        console.log("Found annotation:", annotationName);
        
        // Do we have arguments?
        if (ts2langMatches[2]) {
            console.log("Found some comments:", ts2langMatches[2]);
            
            let argumentText = ts2langMatches[2];
            let argumentResults: RegExpExecArray;
            
            while((argumentResults = argumentRegex.exec(argumentText)) !== null) {
                // TODO: trim for now until we come up with a better regex
                annotationArgs.push({ name: argumentResults[2].trim(), value: argumentResults[3].trim() });
            }
        }
        return { name: annotationName, args: annotationArgs };
    }
    return null;
}

function typeNodeToTsType(tn: ts.TypeNode) {
    switch(tn.kind) {
        case ts.SyntaxKind.TypeReference:
            let typeRef = <ts.TypeReferenceNode>tn;
            return new types.TsIdentifierType(typeRef.typeName.getText());
    }
}

function walkChildren(node: ts.Node, sourceText: string, parentUnit: units.ITopLevelTsUnit) {
    ts.forEachChild(node, (child) => {
        visitNode(child, sourceText, parentUnit);
    });
}


export function collectInformation(program: ts.Program, sourceFile: ts.SourceFile, rootModuleName: string) {
    let scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, sourceFile.text);
    let moduleDef = new units.TsModule(rootModuleName);
    visitNode(sourceFile, sourceFile.text, moduleDef);
    return moduleDef;
}
