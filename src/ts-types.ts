export interface ITsType {
    isBasic: boolean
    name: string
}

export class TsAnyType implements ITsType {
    public get isBasic(): boolean {
        return false;
    }

    public get name(): string {
        return "any";
    }
}


export class TsArrayType implements ITsType {
    private inner: ITsType;

    constructor(inner: ITsType) {
        this.inner = inner;
    }

    public get isBasic(): boolean {
        return false;
    }

    public get name(): string {
        return this.inner.name + "[]";
    }

    public getInner(): ITsType {
        return this.inner;
    }
}

export class TsBasicType implements ITsType {
    private inner: ITsType;
    private innerName: string;

    constructor(name: string) {
        this.innerName = name;
    }

    public get isBasic(): boolean {
        return true;
    }

    public get name(): string {
        return this.innerName;
    }
}

export const TsBooleanType = new TsBasicType("boolean");
export const TsNumberType = new TsBasicType("number");
export const TsStringType = new TsBasicType("string");
export const TsVoidType = new TsBasicType("void");


export class TsFunctionType implements ITsType {

    private retType: ITsType;
    private args: Array<{ name: string; type: ITsType }>;

    constructor(args: Array<{ name: string; type: ITsType }>, ret: ITsType) {
        this.args = args;
        this.retType = ret;
    }

    public get isBasic(): boolean {
        return false;
    }

    public get name(): string {
        return "Function";
    }
}

export class TsIdentifierType implements ITsType {
    private originalName: string;
    private typeParameters: Array<ITsType>;
    private _name: string;

    constructor(name: string, typeParameters?: Array<ITsType>) {
        this._name = name;
        this.typeParameters = typeParameters;

        this.originalName = name;
        if (this.originalName.indexOf(".") > -1) {
            let splitted = this.originalName.split(".");
            this._name = splitted[splitted.length - 1];
        }
    }

    public get isBasic(): boolean {
        return false;
    }

    public get name(): string {
        return this._name;
    }

    public get parameters(): ITsType[] {
        return this.typeParameters;
    }
}

export class TsUnionType implements ITsType {

    private innerTypes: ITsType[];

    constructor(innerTypes: ITsType[]) {
        this.innerTypes = innerTypes;
    }

    public get isBasic(): boolean {
        return false;
    }

    public get name(): string {
        return this.innerTypes.map(innerType => innerType.name).join(" | ");
    }
}