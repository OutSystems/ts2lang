class Point {
    x: number;
    y: number;
    
    /*@ts2lang convertToType(X=a | a=b)*/
    public distance(other: Point) {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }
    
    //@ts2lang dontIgnore()
    distanceFromOrigin() {
        var origin = new Point();
        origin.x = 0; origin.y = 0;
        return this.distance(origin);
    }
}