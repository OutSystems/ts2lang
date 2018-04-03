import * as ts from "typescript";
import * as units from "./ts-units";
import * as types from "./ts-types";

function getCommentsOf(node: ts.Node, sourceText: string) {
    return ts.getLeadingCommentRanges(sourceText, node.pos) || [];
}

let modules: units.TsModule[] = [];

function visitNode(node: ts.Node, sourceText: string, parentUnit: units.ITopLevelTsUnit) {
    let currentUnit: units.ITsUnit;
    let modifiers = node.modifiers ? node.modifiers.map(m => m.kind) : [];
    let isPublic = modifiers.indexOf(ts.SyntaxKind.ExportKeyword) >= 0 || modifiers.indexOf(ts.SyntaxKind.PublicKeyword) >= 0;

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
            
            walkChildren(node, sourceText, moduleDef);
            currentUnit = moduleDef;
            break;

        case ts.SyntaxKind.ModuleBlock:
            walkChildren(node, sourceText, parentUnit);
            break;

        case ts.SyntaxKind.ClassDeclaration:
            let classDeclaration = <ts.ClassDeclaration> node;
            let classDef = new units.TsClass(classDeclaration.name.text, isPublic);

            parentUnit.addClass(classDef);
            walkChildren(node, sourceText, classDef);
            currentUnit = classDef;
            break;

        case ts.SyntaxKind.InterfaceDeclaration:
            let interfaceDeclaration = <ts.InterfaceDeclaration> node;
            let interfaceDefinition = new units.TsInterface(interfaceDeclaration.name.text, isPublic);
            parentUnit.addInterface(interfaceDefinition);
            walkChildren(node, sourceText, interfaceDefinition);
            currentUnit = interfaceDefinition;
            break;

        case ts.SyntaxKind.EnumDeclaration:
            let enumDeclaration = <ts.EnumDeclaration> node;
            let options: units.TsEnumOption[] = enumDeclaration.members.map(m => {
                var optionName = m.name.getText();
                var optionValue = m.initializer ? parseInt(m.initializer.getText()) : undefined;
                return new units.TsEnumOption(optionName, optionValue);
            });
            let enumDef = new units.TsEnum(enumDeclaration.name.getText(), options, isPublic);
            parentUnit.addEnum(enumDef);
            currentUnit = enumDef;
            break;

        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.MethodSignature:
        case ts.SyntaxKind.FunctionDeclaration:
            let functionDeclaration = <ts.SignatureDeclaration> node;

            let params = functionDeclaration.parameters.map(p => {
                return new units.TsParameter(p.name.getText(), typeNodeToTsType(p.type));
            });
            let functionDef = new units.TsFunction(functionDeclaration.name.getText(), params, typeNodeToTsType(functionDeclaration.type));
            parentUnit.addFunction(functionDef);
            
            currentUnit = functionDef;
            break;

        case ts.SyntaxKind.PropertySignature:
        case ts.SyntaxKind.PropertyDeclaration:
            let propertyDeclaration = <ts.PropertySignature | ts.PropertyDeclaration> node;
            
            if (parentUnit instanceof units.TsInterface || parentUnit instanceof units.TsClass) {
                let propertyDef = new units.TsProperty(propertyDeclaration.name.getText(), typeNodeToTsType(propertyDeclaration.type));
                parentUnit.addProperty(propertyDef);
            }
            break;
    }
    
    if (currentUnit) {
        let comments = getCommentsOf(node, sourceText);
        comments
            .map((c) => processComment(sourceText.substring(c.pos, c.end)))
            .filter((c) => !!c)
            .forEach((c) => currentUnit.addAnnotation(c));

    }
}

function processComment(comment: string): units.ITsAnnotation {
    let startOfMultilineComment = comment.indexOf("/*");
    let commentText = comment.substr(2); // drop first two characters (either // or /*)
        
    let ts2langRegex = /@ts2lang\s*(\w+)\((.*)\)/g;
    let argumentRegex = /(([^=\s\|]+)\s*=\s*([^=\|]+))/g;
    let ts2langMatches = ts2langRegex.exec(commentText);
    
    if (ts2langMatches) {
        let annotationName = ts2langMatches[1];
        let annotationArgs: units.ITsAnnotationArgument[] = [];
        
        // Do we have arguments?
        if (ts2langMatches[2]) {
            
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

function typeNodeToTsType(tn: ts.TypeNode): types.ITsType {
    if (tn) {
        switch(tn.kind) {
            case ts.SyntaxKind.TypeReference:
                let typeRef = <ts.TypeReferenceNode>tn;
                let args = typeRef.typeArguments ? typeRef.typeArguments.map(a => typeNodeToTsType(a)) : [];
                return new types.TsIdentifierType(typeRef.typeName.getText(), args);
            case ts.SyntaxKind.BooleanKeyword:
                return types.TsBooleanType;
            case ts.SyntaxKind.StringKeyword:
                return types.TsStringType;
            case ts.SyntaxKind.NumberKeyword:
                return types.TsNumberType;
            case ts.SyntaxKind.UnionType:
                let typeUnion = <ts.UnionTypeNode>tn;
                return new types.TsUnionType(typeUnion.types.map(typeNodeToTsType));
            case ts.SyntaxKind.FunctionType:
                let functionType = <ts.FunctionTypeNode>tn;
                var paramTypes = functionType.parameters.map(param => { return { name: param.name.getText(), type: typeNodeToTsType(param.type) } });
                return new types.TsFunctionType(paramTypes, typeNodeToTsType(functionType.type));
            case ts.SyntaxKind.ArrayType:
                let typeArray = <ts.ArrayTypeNode>tn;
                return new types.TsArrayType(typeNodeToTsType(typeArray.elementType));
        }
    }
    return types.TsVoidType;
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
