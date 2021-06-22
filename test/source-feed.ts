import { IBasePoint } from "./source-dependency";

/** doc on interface */
export interface IPoint extends IBasePoint {
    distanceFromOrigin(): number;
    distance(other: Point): number;
}

/**
 * doc on class
 * on multiple lines
 */
class Point implements IPoint {
    readonly name: string;
    x: number;
    y: number;
    
    /** doc on prop */
    getX(): number { return this.x; }
    getY(): number { return this.y; }

    /** doc on method */
    /*@ts2lang convertToType(X=a | a=b)*/
    public distance(/** doc on param */ other: Point): number {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }
    
    //@ts2lang dontIgnore()
    distanceFromOrigin(): number {
        var origin = new Point();
        origin.x = 0; origin.y = 0;
        return this.distance(origin);
    }
}

/** doc on enum */
enum MyEnum { 
    // cenas
    A = 1,
    /* TEST */
    B,//67
    C = 99 /* xxx 45 */,
    /** doc on enum value */
    D = 2 // 33
}