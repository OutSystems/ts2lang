import { ITsType } from "./ITsType";

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
