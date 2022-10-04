import {TextureLibrary} from "./Libraries/TextureLibrary"
import { ModelLibrary } from "./Libraries/ModelLibrary"

export class Engine
{
    private static _modelLibrary: ModelLibrary
    public static get modelLibrary(){ return this._modelLibrary }

    private static _textureLibrary: TextureLibrary
    public static get textureLibrary(){ return this._textureLibrary }

    public static Initialise()
    {
        this._textureLibrary = new TextureLibrary()
        this._modelLibrary = new ModelLibrary()
    }

}