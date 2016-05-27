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
        throw Error("InvalidOperationException");
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
}
