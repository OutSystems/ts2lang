import { ITsType } from "./ITsType";

export class TsAnyType implements ITsType {
    public get isBasic(): boolean {
        return false;
    }

    public get name(): string {
        return "any";
    }
}
