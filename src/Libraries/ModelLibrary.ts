enum ModelTypes
{
    tank
}

export class ModelLibrary
{
    private library: ArrayBuffer[] = [];

    constructor()
    {
        (async () => {
            this.library[ModelTypes.tank] = await Model.getBinaryFromObj("/src/Assets/tankP.obj")
        })();
    }

    public get(type: ModelTypes): ArrayBuffer
    {
        return this.library[type]
    }

}

class Model
{
    static async getBinaryFromObj(url: string)
    {
        const fileContents = await this.getFileContents(url);
        const arrayBuffer = this.parseFile(fileContents);
        return arrayBuffer;
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

        const lines = fileContents.split('\n');
        for(const line of lines)
        {
            const [ command, ...values] = line.split(' ', 4);
        
            if (command === 'v')
            {
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

        console.log(arrayBufferSource);
        return new Float32Array(arrayBufferSource).buffer;
    }   

    

}


