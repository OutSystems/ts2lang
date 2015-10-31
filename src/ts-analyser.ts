import * as ts from "typescript";

let elements = {};
function addElement(node: ts.Node, text: string){
    if(!elements[node.kind]) {
        elements[node.kind] = [];
    }

    elements[node.kind].push(text);
}

function analyseNode(node: ts.Node) {
    switch (node.kind) {
        case ts.SyntaxKind.ModuleDeclaration:
            let moduleDeclaration = <ts.ModuleDeclaration> node;
            addElement(node, moduleDeclaration.name.text);
            break;

        case ts.SyntaxKind.ImportDeclaration:
            let importDeclaration = (<ts.ImportDeclaration> node);
            addElement(node, importDeclaration.getText());
            break;

        case ts.SyntaxKind.ClassDeclaration:
            let classDeclaration = <ts.ClassDeclaration> node;
            addElement(node, classDeclaration.name.text);
            break;

        case ts.SyntaxKind.GetAccessor:
        case ts.SyntaxKind.SetAccessor:
            let propertyDeclaration = <ts.PropertyDeclaration> node;
            addElement(node, propertyDeclaration.name.getText());
            break;

        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
            let functionDeclaration = <ts.Declaration> node;
            addElement(node, functionDeclaration.name.getText());
            break;
    }

    ts.forEachChild(node, (child) => analyseNode(child));
}

export function collectInformation(program: ts.Program, sourceFile: ts.SourceFile) {
    analyseNode(sourceFile);
    console.log("End processing file: " + sourceFile.fileName);

    console.log("Obtained data:");

    for(let elem in elements) {
        console.log(elem + " - " + elements[elem]);
    }

    elements = {};
}
