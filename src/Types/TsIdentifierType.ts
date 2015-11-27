import { ITsType } from "./ITsType";

export class TsIdentifierType implements ITsType {
    private originalName: string;
    private typeParameters: Array<ITsType>;
    private _name: string;

    constructor(name: string, typeParameters?: Array<ITsType>) {
        this._name = name;
        this.typeParameters = typeParameters;name

        this.originalName = name;
        if (this.originalName.indexOf('.') > -1) {
            var splitted = this.originalName.split('.');
            this._name = splitted[splitted.length-1];
        }
    }

    public get isBasic(): boolean {
        return false;
    }

    public get name(): string {
        return this._name;
    }
}
