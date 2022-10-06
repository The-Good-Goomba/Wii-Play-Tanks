import { Engine } from "../Engine";
import { Mesh, ModelTypes } from "../Libraries/ModelLibrary";
import { TextureTypes } from "../Libraries/TextureLibrary";
import { Apex } from "./Node";



class GameObject extends Apex
{
    private normalMatrix = [];
    
    mesh!: Mesh;

    private baseTexture: TextureTypes = TextureTypes.none;
    private normalMap: TextureTypes = TextureTypes.none;

    constructor(name: string, type: ModelTypes)
    {
        super(name);
        this.mesh = Engine.modelLibrary.get(type);
    }



}