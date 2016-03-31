import { ITsType } from "./ITsType";

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
