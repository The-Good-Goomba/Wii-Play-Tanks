import { BoundingBox } from "../Utility/boundingBox";

export const enum ModelTypes
{
    tank
}

export class ModelLibrary
{
    private library: Mesh[] = [];

    constructor()
    {
        (async () => {
            this.library[ModelTypes.tank] = await Model.getBinaryFromObj("/src/Assets/tankP.obj")
        })();
    }

    public get(type: ModelTypes): Mesh
    {
        return this.library[type]
    }

}

export class Mesh
{
    model!: ArrayBuffer;
    boundingBox!: BoundingBox;
    constructor(model: ArrayBuffer, bounds: BoundingBox) {
        this.model = model
        this.boundingBox = bounds
    }
}

class Model
{
    static async getBinaryFromObj(url: string)
    {
        const fileContents = await this.getFileContents(url);
        const mesh = this.parseFile(fileContents);
        return mesh;
    }

    private static getFileContents = async (filename: string) =>
    {
        const file = await fetch(filename);
        const body = await file.text();
        return body;
    };

    private static stringsToNumbers = (strings: string[]) =>
    {
        const numbers = [];
        for (const str of strings)
        {
            numbers.push(parseFloat(str));
        }
        return numbers;
    }

    private static parseFile = (fileContents: string) =>
    {
        const positions = [];
        const texCoords = [];
        const normals = [];

        const arrayBufferSource = [];

        var boundingBox = new BoundingBox (
            [Infinity, Infinity, Infinity],
            [-Infinity, -Infinity, -Infinity]
        )

        const lines = fileContents.split('\n');
        var pos: [number, number, number] = [0,0,0];
        for(const line of lines)
        {
            const [ command, ...values] = line.split(' ', 4);
        
            if (command === 'v')
            {
                pos = this.stringsToNumbers(values) as [number, number, number];
                boundingBox.updateBounds(pos);
                positions.push(this.stringsToNumbers(values));
            }
            else if (command === 'vt')
            {
                texCoords.push(this.stringsToNumbers(values));
            }
            else if (command === 'vn')
            {
                normals.push(this.stringsToNumbers(values));
            }

            else if (command === 'f')
            {
                for (const group of values)
                {
                    const [ positionIndex, texCoordIndex, normalIndex] = this.stringsToNumbers(group.split('/'));

                    arrayBufferSource.push(...positions[positionIndex - 1]);
                    arrayBufferSource.push(...texCoords[texCoordIndex - 1]);
                    arrayBufferSource.push(...normals[normalIndex - 1]);
                }
            }

        }

        return new Mesh(new Float32Array(arrayBufferSource).buffer, boundingBox);
    }   

}


