export class BoundingBox {
    maxBounds!: [number, number, number];
    minBounds!: [number, number, number];

    constructor(min: [number, number, number] = [0,0,0], max: [number, number, number] = [0,0,0])
    {
        this.minBounds = min;
        this.maxBounds = max;
    }

    get width() { return this.maxBounds[0] - this.minBounds[0]; }
    get height() { return this.maxBounds[1] - this.minBounds[1]; }
    get depth() { return this.maxBounds[2] - this.minBounds[2]; }

    scaleWidthTo(wide: number): number { return wide / this.width }
    scaleHeightTo(high: number): number { return high / this.height }
    scaleDepthTo(deep: number): number { return deep / this.depth }

    getScaledBounds(scale: [number, number, number])
    {
        var box = new BoundingBox
        box.minBounds =  [this.minBounds[0] * scale[0] ,this.minBounds[1] * scale[1] , this.minBounds[2] * scale[2]]
        box.maxBounds =  [this.maxBounds[0] * scale[0] ,this.maxBounds[1] * scale[1] , this.maxBounds[2] * scale[2]]
        return box
    }

    updateBounds(pos: [number, number, number])
    {
        //        Max bounds
        if (pos[1] > this.maxBounds[1]) { this.maxBounds[1] = pos[1] }
        if (pos[0] > this.maxBounds[0]) { this.maxBounds[0] = pos[0] }
        if (pos[2] > this.maxBounds[2]) { this.maxBounds[2] = pos[2] }
        
//        Min Bounds
        if (pos[1] < this.minBounds[1]) { this.minBounds[1] = pos[1] }
        if (pos[0] < this.minBounds[0]) { this.minBounds[0] = pos[0] }
        if (pos[2] < this.minBounds[2]) { this.minBounds[2] = pos[2] }
    }

}