import { ITsType } from "./ITsType";

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
