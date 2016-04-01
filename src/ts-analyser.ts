
import * as ts from "typescript";
import * as units from "./ts-units";

let elements = {};
function addElement(node: ts.Node, text: string){
    if(!elements[node.kind]) {
        elements[node.kind] = [];
    }

    elements[node.kind].push(text);
}

function getCommentsOf(node: ts.Node, sourceText: string) {
    let comments = ts.getLeadingCommentRanges(sourceText, node.pos);
    if(comments) {
        console.log("Comments of: " + node.getText())
        for (let comment of comments) {
            console.log(sourceText.substring(comment.pos, comment.end));            
        }
    }
}

let modules: units.TsModule[] = [];

function visitNode(node: ts.Node, sourceText: string, parentUnit: units.ITopLevelTsUnit) {
    let shouldContinue = true;
    
    switch (node.kind) {
        case ts.SyntaxKind.SourceFile:
            let sourceFile = <ts.SourceFile> node;
            
            if(sourceFile.fileName.indexOf("lib.d.ts") < 0) {
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
            break;
        
        case ts.SyntaxKind.ModuleBlock:
            walkChildren(node, sourceText, parentUnit);
            break;
            
        case ts.SyntaxKind.ClassDeclaration:
            let classDeclaration = <ts.ClassDeclaration> node;
            let classDef = new units.TsClass(classDeclaration.name.text);
            
            parentUnit.addClass(classDef);
            walkChildren(node, sourceText, classDef);
            break;

        case ts.SyntaxKind.InterfaceDeclaration:
            let interfaceDeclaration = <ts.InterfaceDeclaration> node;
            let interfaceDefinition = new units.TsInterface(interfaceDeclaration.name.text);
            parentUnit.addInterface(interfaceDefinition);
            walkChildren(node, sourceText, interfaceDefinition);
            break;
            
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
            let functionDeclaration = <ts.Declaration> node;
            let functionDef = new units.TsFunction(functionDeclaration.name.getText());
            
            parentUnit.addFunction(functionDef);
            break;
    }
}

function walkChildren(node: ts.Node, sourceText: string, parentUnit: units.ITopLevelTsUnit) {
    ts.forEachChild(node, (child) => {
        visitNode(child, sourceText, parentUnit);   
    });
}


export function collectInformation(program: ts.Program, sourceFile: ts.SourceFile) {
    let scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, sourceFile.text);
    let moduleDef = new units.TsModule("__internal__");
    visitNode(sourceFile, sourceFile.text, moduleDef);
}
