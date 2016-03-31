
import * as ts from "typescript";


// @ts2lang: xeue
class Test {}
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

function analyseNode(node: ts.Node, sourceText: string) {
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
            getCommentsOf(node, sourceText);
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
			
		case ts.SyntaxKind.SingleLineCommentTrivia:
			// I am next to nice log!
			console.log("nice!");
			break;
    }

    ts.forEachChild(node, (child) => analyseNode(child, sourceText));
}

export function collectInformation(program: ts.Program, sourceFile: ts.SourceFile) {
    let scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, sourceFile.text);
    analyseNode(sourceFile, sourceFile.text);
    console.log("End processing file: " + sourceFile.fileName);

    console.log("Obtained data:");

    for(let elem in elements) {
        console.log(elem + " - " + elements[elem]);
    }

    elements = {};
}
