declare var glMatrix: any;
const { mat4 , vec3, quat } = glMatrix;

type matrix4x4 = [number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number];

type SIMD2<bruh> = [ bruh, bruh ];
type SIMD3<bruh> = [ bruh, bruh, bruh ];

const normalise3 = (v: SIMD3<number>): SIMD3<number> =>
{
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
}

const normalise2 = (v: SIMD2<number>): SIMD2<number> =>
{
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / length, v[1] / length];
}

const toDegrees = (radians: number) => radians * 180 / Math.PI;

const enum TextureTypes
{
    none = -1,
    bigSheet
}

const enum SpriteTypes
{
    none = -1,
    blueTank,
    redTank,
    ashTank,
    blackTank,
    greenTank,
    oliveTank,
    marinTank,
    pinkTank,
    purpleTank,
    violetTank,
    whiteTank,
    yellowTank,
    woodenFloor,
    shell
}

const enum ModelTypes
{
    tank,
    plane,
    shell
}

const enum VertexShaderTypes
{
    default,
}

const enum FragmentShaderTypes
{
    default,
}

const enum SceneTypes
{
    titleScene,
    mainGame
}

var start = function() 
{
    Main.InitApp();
}

class Main
{
    static gl: WebGL2RenderingContext;
    static canvas: HTMLCanvasElement;

    static InitApp() {

        Main.canvas = document.getElementById('game-surface') as HTMLCanvasElement;

        Main.gl = Main.canvas.getContext('webgl2') as WebGL2RenderingContext;

        Keyboard.Initialise();
        Mouse.Initialise();
    
        if (!Main.gl) {
            alert('Your browser does not support WebGL');
        }
    
        Main.gl.clearColor(0.75, 0.85, 0.8, 1.0);
        Main.gl.clear(Main.gl.COLOR_BUFFER_BIT | Main.gl.DEPTH_BUFFER_BIT);
        Main.gl.enable(Main.gl.DEPTH_TEST);
        Main.gl.depthFunc(Main.gl.LEQUAL);
    
        Main.gl.enable(Main.gl.CULL_FACE);
        Main.gl.cullFace(Main.gl.BACK);
        Main.gl.frontFace(Main.gl.CCW);

        (async () => {
            await Engine.Initialise();
            SceneManager.Initialise(SceneTypes.mainGame);
            this.RunApp();
        })();
    };
    
    static RunApp()  
    {

        
        var loop = () => 
        {
            Main.gl.clearColor(0.75, 0.85, 0.8, 1.0);
            Main.gl.clear(Main.gl.COLOR_BUFFER_BIT | Main.gl.DEPTH_BUFFER_BIT);

            SceneManager.doUpdate();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    
    
    }

}

class Keyboard
{
    static keys: { [key: string]: boolean } = {};

    static Initialise() {
        window.addEventListener('keydown', function(event) {
            Keyboard.keys[event.key] = true;
        });
        window.addEventListener('keyup', function(event) {
            Keyboard.keys[event.key] = false;
        });
    }

    static isKeyDown(key: string) {
        return Keyboard.keys[key];
    }
}

class Mouse 
{
    private static _mousePos: SIMD2<number> = [0, 0];

    private static _mouseButtons: { [key: string]: boolean } = {};

    static get mousePos() {
        return Mouse._mousePos;
    }

    static Initialise() {

        window.onmousedown = function(event) { Mouse._mouseButtons[event.button] = true; }
        window.onmouseup = function(event) { Mouse._mouseButtons[event.button] = false; }

        Main.canvas.onmousemove = Mouse.updateMousePos;
    };

    static updateMousePos(event: MouseEvent) {
        Mouse._mousePos[0] = event.offsetX;
        Mouse._mousePos[1] = event.offsetY;
    }
}

class SceneManager
{
    private static _currentScene: Scene

    static Initialise(type: SceneTypes)
    {
        SceneManager.setScene(type)
    }

    public static get currentScene()
    {
        return SceneManager._currentScene
    }

    public static setScene(type: SceneTypes)
    {
        switch (type)
        {
            case SceneTypes.mainGame:
                SceneManager._currentScene = new TankScene()
        }
    }

    public static doUpdate()
    {
        SceneManager._currentScene.update()
        SceneManager._currentScene.render()
    }

}

class Engine
{
    private static _modelLibrary: ModelLibrary
    public static get modelLibrary(){ return this._modelLibrary }

    private static _textureLibrary: TextureLibrary
    public static get textureLibrary(){ return this._textureLibrary }

    private static _shaderLibrary: ShaderLibrary
    public static get shaderLibrary(){ return this._shaderLibrary }

    public static async Initialise()
    {
        return new Promise<void>(async (resolve, reject) => {
            Engine._textureLibrary = new TextureLibrary();
            await Engine._textureLibrary.Initialise();
            Engine._modelLibrary = new ModelLibrary();
            await Engine._modelLibrary.Initialise();
            Engine._shaderLibrary = new ShaderLibrary();
            await Engine._shaderLibrary.Initialise();
            resolve();
        });

    }

}

class Apex 
{

    private position: SIMD3<number> = [0,0,0];
    private rotation: SIMD3<number> = [0,0,0];
    private scale: SIMD3<number> = [1,1,1];
    private quaternion = [0,0,0,0];

    private name: string;

    toRender: boolean = true;
    parentModelMatrix = new Float32Array(16);

    viewMatrix = new Float32Array(16);
    projectionMatrix = new Float32Array(16);

    _modelMatrix = new Float32Array(16);

    children: Apex[] = []; // Array of Apex 's

    get modelMatrix()
    {
        var ret = new Float32Array(16);
        mat4.mul(ret, this.parentModelMatrix, this._modelMatrix );
        return ret
        
    }

    updateModelMatrix()
    {   
        mat4.fromRotationTranslationScale(this._modelMatrix, this.quaternion, this.position, this.scale);
    }

    constructor(name = "Apex")
    {
        this.name = name;
        quat.fromEuler(this.quaternion, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.identity(this.parentModelMatrix);
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        mat4.identity(this._modelMatrix);
        this.updateModelMatrix();
    }

    getName()
    {
        return this.name
    }

    addChld(child: Apex)
    {
        this.children.push(child);
    }

    doUpdate() { }

    update()
    {
        this.doUpdate()
        for (let child of this.children)
        {
            child.parentModelMatrix = this._modelMatrix
            child.viewMatrix = this.viewMatrix
            child.projectionMatrix = this.projectionMatrix

            child.update()
        }
    }

    doRender() { }

    render()
    {
        if (this.toRender) { this.doRender() }

        for (let child of this.children)
        {
            child.render()
        }
    }

    

    //    Override if you want to do something after transformations
    afterScale() { }
    afterTranslation() { }
    afterRotation() { }

    // I would like to move this outside of the main block

    setPosition( x: number , y: number , z: number )
    {
        this.position = [x,y,z]
        this.updateModelMatrix()
        this.afterTranslation()
    }
   
    setPositionX( x: number ) { this.setPosition(x, this.getPositionY(), this.getPositionZ())}
    setPositionY( y: number ) { this.setPosition(this.getPositionX(), y, this.getPositionZ())}
    setPositionZ( z: number ) { this.setPosition(this.getPositionX(), this.getPositionY(), z)}
    
    move(x: number, y: number,z: number) { this.setPosition(this.getPositionX() + x, this.getPositionY() + y, this.getPositionZ() + z)}
    
    getPosition() { return this.position }
    getPositionX()   { return this.position[0] }
    getPositionY()   { return this.position[1] }
    getPositionZ()   { return this.position[2] }
    
    setRotation( x: number , y: number , z: number )
    {
        this.rotation = [x,y,z]
        
        quat.fromEuler(this.quaternion, toDegrees(x), toDegrees(y), toDegrees(z));
        
        this.updateModelMatrix()
        this.afterRotation()
    }
    
    setRotationX( x: number ) { this.setRotation(x, this.getRotationY(), this.getRotationZ())}
    setRotationY( y: number ) { this.setRotation(this.getRotationX(), y, this.getRotationZ())}
    setRotationZ( z: number ) { this.setRotation(this.getRotationX(), this.getRotationY(), z)}
    
    rotate(x: number, y: number,z: number) { this.setRotation(this.getRotationX() + x, this.getRotationY() + y, this.getRotationZ() + z)}
    
    getRotation()   { return this.rotation }
    getRotationX()   { return this.rotation[0] }
    getRotationY()   { return this.rotation[1] }
    getRotationZ()   { return this.rotation[2] }
    
    setScale( x: number , y: number , z: number )
    {
        this.scale = [x,y,z]
        this.updateModelMatrix()
        this.afterScale()
    }
    
    uniformSetScale( s: number ) { this.setScale(s, s, s) }
    
    setScaleX( x: number ) { this.setScale(x, this.getScaleY(), this.getScaleZ())}
    setScaleY( y: number ) { this.setScale(this.getScaleX(), y, this.getScaleZ())}
    setScaleZ( z: number ) { this.setScale(this.getScaleX(), this.getScaleY(), z)}
    
    scaleF(x: number, y: number,z: number) { this.setScale(this.getScaleX() + x, this.getScaleY() + y, this.getScaleZ() + z)}
    
    getScale()   { return this.scale }
    getScaleX()   { return this.scale[0] }
    getScaleY()   { return this.scale[1] }
    getScaleZ()   { return this.scale[2] }
    


}

class Scene extends Apex
{


    constructor()
    {
        super("Scene");
        this.toRender = false;
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.buildScene();
    }

    buildScene() { }
}

class GameObject extends Apex
{
    private normalMatrix = [];
    private program!: WebGLProgram;
    
    modelBuffer!: WebGLBuffer;
    boundingBox!: BoundingBox;
    bufferCount!: number;

    type!: ModelTypes;

    jointMatrices: matrix4x4[] = []

    private baseTexture!: WebGLTexture;
    private sprite!: SpriteSheetInfo;

    private spritePosUniformLocation!: WebGLUniformLocation;
    private spriteSizeUniformLocation!: WebGLUniformLocation;
    private samplerUniformLocation!: WebGLUniformLocation;

    private matModelUniformLocation!: WebGLUniformLocation;
    private matProjUniformLocation!: WebGLUniformLocation;
    private matViewUniformLocation!: WebGLUniformLocation;
    
    private positionAttribLocation!: number;
    private texCoordAttribLocation!: number;
    private normalAttribLocation!: number;
    private meshMemberAttribLocation!: number;

 

    constructor(name: string, type: ModelTypes)
    {
        super(name);
        for(var i = 0; i < 4; i++)
        {
            this.jointMatrices[i] = mat4.create();
        }
        
        
        this.program = ShaderLibrary.createProgram( VertexShaderTypes.default, FragmentShaderTypes.default );

        this.positionAttribLocation = Main.gl.getAttribLocation(this.program, 'vertPosition');
        this.normalAttribLocation = Main.gl.getAttribLocation(this.program, 'vertNormal');
        this.texCoordAttribLocation = Main.gl.getAttribLocation(this.program, 'vertTexCoord');
        this.meshMemberAttribLocation = Main.gl.getAttribLocation(this.program, 'meshMember');
        

        this.matModelUniformLocation = Main.gl.getUniformLocation(this.program, 'mModel')!;
        this.matViewUniformLocation = Main.gl.getUniformLocation(this.program, 'mView')!;
        this.matProjUniformLocation = Main.gl.getUniformLocation(this.program, 'mProj')!;

        this.samplerUniformLocation = Main.gl.getUniformLocation(this.program, 'uSampler')!;
        this.spritePosUniformLocation = Main.gl.getUniformLocation(this.program, 'spriteInfo.pos')!;
        this.spriteSizeUniformLocation = Main.gl.getUniformLocation(this.program, 'spriteInfo.size')!;

        var mesh = Engine.modelLibrary.get(type);
        this.bufferCount = mesh.model.byteLength / 36;
        this.boundingBox = mesh.boundingBox; 

        this.modelBuffer = Main.gl.createBuffer()!;
        Main.gl.bindBuffer(Main.gl.ARRAY_BUFFER, this.modelBuffer);
        Main.gl.bufferData(Main.gl.ARRAY_BUFFER, mesh.model, Main.gl.STATIC_DRAW);

        Main.gl.bindBuffer(Main.gl.ARRAY_BUFFER, null);

    }

    doRender(): void {
        Main.gl.useProgram(this.program);
        
        Main.gl.bindBuffer(Main.gl.ARRAY_BUFFER, this.modelBuffer);

        Main.gl.vertexAttribPointer(this.positionAttribLocation, 3, Main.gl.FLOAT, false, 36, 0); // Magic numbers!! (No idea what they are but it wasn't working before)
        Main.gl.vertexAttribPointer(this.normalAttribLocation, 3, Main.gl.FLOAT, false, 36, 12);
        Main.gl.vertexAttribPointer(this.texCoordAttribLocation, 2, Main.gl.FLOAT, false, 36, 24);
        Main.gl.vertexAttribPointer(this.meshMemberAttribLocation, 1, Main.gl.FLOAT, false, 36, 32);

        Main.gl.enableVertexAttribArray(this.positionAttribLocation);
        Main.gl.enableVertexAttribArray(this.normalAttribLocation);
        Main.gl.enableVertexAttribArray(this.texCoordAttribLocation);
        Main.gl.enableVertexAttribArray(this.meshMemberAttribLocation);

        Main.gl.uniformMatrix4fv(this.matModelUniformLocation, false, this.modelMatrix);
        Main.gl.uniformMatrix4fv(this.matViewUniformLocation, false, this.viewMatrix);
        Main.gl.uniformMatrix4fv(this.matProjUniformLocation, false, this.projectionMatrix);
        for(var i = 0; i < this.jointMatrices.length; i++)
        {
            Main.gl.uniformMatrix4fv(Main.gl.getUniformLocation(this.program, `jointMatrices[${i}]`), false, this.jointMatrices[i]);
        }
        



        if (this.baseTexture)
        {
            Main.gl.activeTexture(Main.gl.TEXTURE0);
            Main.gl.bindTexture(Main.gl.TEXTURE_2D, this.baseTexture);
          
            Main.gl.uniform1i(this.samplerUniformLocation, 0);

            Main.gl.uniform2fv(this.spritePosUniformLocation, this.sprite.pos);
            Main.gl.uniform2fv(this.spriteSizeUniformLocation, this.sprite.size);

        }
        
        Main.gl.drawArrays(Main.gl.TRIANGLES, 0 , this.bufferCount);
        Main.gl.bindBuffer(Main.gl.ARRAY_BUFFER, null);
    }

    useBaseColourTexture(type: SpriteTypes)
    {
        if (type == SpriteTypes.none) { return; }

        this.sprite = Engine.textureLibrary.getSprite(type);

        this.baseTexture = Main.gl.createTexture()!;
        Main.gl.bindTexture(Main.gl.TEXTURE_2D, this.baseTexture);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_WRAP_T, Main.gl.REPEAT);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_WRAP_S, Main.gl.REPEAT);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_MIN_FILTER, Main.gl.LINEAR);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_MAG_FILTER, Main.gl.LINEAR);

        Main.gl.texImage2D(Main.gl.TEXTURE_2D, 0, Main.gl.RGBA, Main.gl.RGBA, Main.gl.UNSIGNED_BYTE, Engine.textureLibrary.getTexture(this.sprite.textureType));

        Main.gl.bindTexture(Main.gl.TEXTURE_2D, null);
    }

}

class ModelLibrary
{
    private library: Mesh[] = [];

    public Initialise()
    {
        return new Promise<void>(async (resolve, reject) => {
            this.library[ModelTypes.tank] = await ModelLoader.getBinaryFromObj("/src/Assets/tankP.obj");
            this.library[ModelTypes.plane] = await ModelLoader.getBinaryFromObj("/src/Assets/plane.obj");
            this.library[ModelTypes.shell] = await ModelLoader.getBinaryFromObj("/src/Assets/shell.obj");
            resolve();
        });   
    }

    public get(type: ModelTypes): Mesh
    {
        return this.library[type]
    }

}

interface Mesh
{
    model: ArrayBuffer;
    boundingBox: BoundingBox;
}

class ModelLoader
{
    static async getBinaryFromObj(url: string)
    {
        const fileContents = await ModelLoader.getFileContents(url);
        const mesh = ModelLoader.parseFile(fileContents);
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
        var pos: SIMD3<number> = [0,0,0];
        var meshMember: string[] = [];
        var currentMember: number = 0;
        for(const line of lines)
        {
            const [ command, ...values] = line.split(' ', 4);

            if (command === 'g')
            {
                var bruh = true;
                for (let i = 0;i < meshMember.length; i++)
                {
                    if ( values[0] == meshMember[i]) { currentMember = i; bruh = false }
                }
                if (bruh) { currentMember = meshMember.length; meshMember.push(values[0]);}
            }
        
            if (command === 'v')
            {
                pos = ModelLoader.stringsToNumbers(values) as SIMD3<number>;
                boundingBox.updateBounds(pos);
                positions.push(pos);
            }
            else if (command === 'vt')
            {
                texCoords.push(ModelLoader.stringsToNumbers(values));
            }
            else if (command === 'vn')
            {
                normals.push(ModelLoader.stringsToNumbers(values));
            }

            else if (command === 'f')
            {

                for (const group of values)
                {
                    const [ positionIndex, texCoordIndex, normalIndex] = ModelLoader.stringsToNumbers(group.split('/'));

                    arrayBufferSource.push(...positions[positionIndex - 1]);
                    arrayBufferSource.push(...normals[normalIndex - 1]);
                    arrayBufferSource.push(...texCoords[texCoordIndex - 1]);
                    arrayBufferSource.push(currentMember);
                }
            }

        }

        var mod = new Float32Array(arrayBufferSource).buffer;

        return { model: mod, boundingBox: boundingBox };
    }   

}

class TextureLibrary
{
    private texLibrary: HTMLImageElement[] = [];
    private spriteLib: SpriteSheetInfo[] = [];

    Initialise()
    {
        return new Promise<void>(async (resolve, reject) => {
            this.texLibrary[TextureTypes.bigSheet] = await ResourceLoader.loadImageResource("/src/Assets/Textures.png"); 
            
            this.spriteLib[SpriteTypes.blueTank] = { textureType: TextureTypes.bigSheet, pos: [877,1241], size: [32,32] };
            this.spriteLib[SpriteTypes.ashTank] = { textureType: TextureTypes.bigSheet, pos: [185,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.blackTank] = { textureType: TextureTypes.bigSheet, pos: [259,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.greenTank] = { textureType: TextureTypes.bigSheet, pos: [148,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.oliveTank] = { textureType: TextureTypes.bigSheet, pos: [790,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.marinTank] = { textureType: TextureTypes.bigSheet, pos: [221,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.pinkTank] = { textureType: TextureTypes.bigSheet, pos: [4,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.purpleTank] = { textureType: TextureTypes.bigSheet, pos: [927,1172], size: [32,32]}
            this.spriteLib[SpriteTypes.violetTank] = { textureType: TextureTypes.bigSheet, pos: [444,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.whiteTank] = { textureType: TextureTypes.bigSheet, pos: [110,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.yellowTank] = { textureType: TextureTypes.bigSheet, pos: [816,1241], size: [32,32]}
            this.spriteLib[SpriteTypes.woodenFloor] = { textureType: TextureTypes.bigSheet, pos: [5,522], size: [1024,512]}
            this.spriteLib[SpriteTypes.shell] = { textureType: TextureTypes.bigSheet, pos: [753,1241], size: [32,16]}

            for (var i in this.spriteLib)
            {
                this.spriteLib[i].pos[0] /= this.getTexture(this.spriteLib[i].textureType).width;
                this.spriteLib[i].pos[1] /= this.getTexture(this.spriteLib[i].textureType).height;
                this.spriteLib[i].size[0] /= this.getTexture(this.spriteLib[i].textureType).width;
                this.spriteLib[i].size[1] /= this.getTexture(this.spriteLib[i].textureType).height;
            }

            resolve();
        });
    }

    public getTexture(type: TextureTypes): HTMLImageElement
    {
        return this.texLibrary[type];
    }


    public getSprite(type: SpriteTypes): SpriteSheetInfo
    {
        return this.spriteLib[type];
    }

    
}

interface SpriteSheetInfo
{
    textureType: TextureTypes;
    pos: SIMD2<number>;
    size: SIMD2<number>;
}

class ShaderLibrary
{
    private vertexLibrary: WebGLShader[] = new Array(1);
    private fragmentLibrary: WebGLShader[] = new Array(1);

    getVertex(type: VertexShaderTypes)
    {
        return this.vertexLibrary[type]
    }

    getFragment(type: FragmentShaderTypes)
    {
        return this.fragmentLibrary[type]
    }



    public Initialise()
    {
        return new Promise<void>(async (resolve, reject) => {
            // Amound of shaders
            var stringlib: string[] = new Array(1); 
            stringlib[VertexShaderTypes.default] = await ResourceLoader.loadTextResource('/src/Shaders/shader.vs.glsl');

            for (let i = 0; i < stringlib.length; i++)
            {
                this.vertexLibrary[i] = Main.gl.createShader(Main.gl.VERTEX_SHADER)!;
                Main.gl.shaderSource(this.vertexLibrary[i], stringlib[i]);
                Main.gl.compileShader(this.vertexLibrary[i]);

                if (!Main.gl.getShaderParameter(this.vertexLibrary[i], Main.gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling vertex shader!', Main.gl.getShaderInfoLog(this.vertexLibrary[i]));
                    return;
                }
            }

            stringlib = new Array(1); 
            stringlib[FragmentShaderTypes.default] = await ResourceLoader.loadTextResource('/src/Shaders/shader.fs.glsl');

            for (let i = 0; i < stringlib.length; i++)
            {
                this.fragmentLibrary[i] = Main.gl.createShader(Main.gl.FRAGMENT_SHADER)!;
                Main.gl.shaderSource(this.fragmentLibrary[i], stringlib[i]);
                Main.gl.compileShader(this.fragmentLibrary[i]);

                if (!Main.gl.getShaderParameter(this.fragmentLibrary[i], Main.gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling fragment shader!', Main.gl.getShaderInfoLog(this.fragmentLibrary[i]));
                    return;
                }
            }
            resolve();

        });
    }

    public static createProgram(vert: VertexShaderTypes, frag: FragmentShaderTypes): WebGLProgram
    {
        var program = Main.gl.createProgram()!;
        Main.gl.attachShader(program, Engine.shaderLibrary.getVertex(vert));
        Main.gl.attachShader(program, Engine.shaderLibrary.getFragment(frag));
        Main.gl.linkProgram(program);
        if(!Main.gl.getProgramParameter(program, Main.gl.LINK_STATUS)) {
            console.error('ERROR linking program!', Main.gl.getProgramInfoLog(program));
        }
    
        Main.gl.validateProgram(program);
        if(!Main.gl.getProgramParameter(program, Main.gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', Main.gl.getProgramInfoLog(program));
        }

        return program;

    }

}

class ResourceLoader
{
    static loadTextResource(url: string) {
        return new Promise<string>(async (resolve, reject) => {
            var request = await fetch(url);
            if (request.status < 200 || request.status > 299) {
                reject('Error: HTTP Status ' + request.status + ' on resource ' + url);
            } else {
                resolve(request.text());
            }
        });
    }
    
    // Load a JSON resource from a file over the network
    static async loadJSONResource(url: string) {
        var json = await this.loadTextResource(url);
        return JSON.parse(json);
    }
    
    // Load an image resource from a file over the network
    static loadImageResource(url: string) {
        return new Promise<HTMLImageElement>((resolve) => {
            var image = new Image();
            image.onload = function() {
                resolve(image);
            };
            image.src = url;
        });
        
    }
}

class BoundingBox {
    maxBounds!: SIMD3<number>;
    minBounds!: SIMD3<number>;

    constructor(min: SIMD3<number> = [0,0,0], max: SIMD3<number> = [0,0,0])
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

    getScaledBounds(scale: SIMD3<number>)
    {
        var box = new BoundingBox
        box.minBounds =  [this.minBounds[0] * scale[0] ,this.minBounds[1] * scale[1] , this.minBounds[2] * scale[2]]
        box.maxBounds =  [this.maxBounds[0] * scale[0] ,this.maxBounds[1] * scale[1] , this.maxBounds[2] * scale[2]]
        return box
    }

    updateBounds(pos: SIMD3<number>)
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

class TankScene extends Scene
{

    tank1!: Tank;
    floor!: GameObject;

    buildScene()
    {
        this.tank1 = new Tank();
        this.tank1.tankBody.useBaseColourTexture(SpriteTypes.ashTank);

        this.floor = new GameObject("Floor", ModelTypes.plane);
        this.floor.useBaseColourTexture(SpriteTypes.woodenFloor);

        mat4.lookAt(this.viewMatrix, [0, 10, 10], [0, 0, 0], normalise3([0,5,-1]));
        mat4.perspective(this.projectionMatrix, Math.PI/4.0, Main.canvas.width / Main.canvas.height, 0.1, 1000.0);
        // mat4.ortho(this.projectionMatrix, -10, 10, -7, 7, 0.1, 100.0);

        this.children[0] = this.tank1;
        this.children[1] = this.floor;

        this.tank1.tankBody.uniformSetScale(5);
        this.floor.uniformSetScale(10);

    }

    doUpdate(): void {


        if (Keyboard.isKeyDown('w')) { this.tank1.moveUp(); }
        if (Keyboard.isKeyDown('s')) { this.tank1.moveDown(); }
        if (Keyboard.isKeyDown('a')) { this.tank1.moveLeft(); }
        if (Keyboard.isKeyDown('d')) { this.tank1.moveRight(); }

    }

}

class Tank extends Apex
{
    speed: number = 0.1;
    rotationSpeed: number = 0.03;
    baseRotation: number = 0;

    tankBody!: GameObject;

    screenCoords: SIMD3<number> = [0,0,0];

    constructor()
    {
        super("Tank");
        this.tankBody = new GameObject("TankBody", ModelTypes.tank);
        mat4.fromRotation(this.tankBody.jointMatrices[0], Math.PI/2, [0,1,0]);
        this.addChld(this.tankBody);

        this.tankBody.afterTranslation = () => {
            var bruh1: matrix4x4 = mat4.create();
            mat4.mul(bruh1, this.projectionMatrix, this.viewMatrix);
            vec3.transformMat4(this.screenCoords, this.tankBody.getPosition(), bruh1);
            this.screenCoords[0] = ((this.screenCoords[0] + 1) / 2) * Main.canvas.width;
            this.screenCoords[1] = -1 * ((this.screenCoords[1] - 1) / 2) * Main.canvas.height;
        }

        this.tankBody.afterTranslation();
    }

    doUpdate(): void {
        this.updateTurretRotation();
        
    }

    shoot(dir: SIMD2<number> = [0,1])
    {
        const cannonLength = this.tankBody.getScaleX() * 0.16;
        var dire: SIMD2<number> = normalise2([(Mouse.mousePos[0] - this.screenCoords[0]), (Mouse.mousePos[1] - this.screenCoords[1])]);
        var bullet = new Bullet(dire,
                    [this.getPositionX() + cannonLength * dire[0], 
                    this.getPositionY() + this.tankBody.getScaleX() * 0.1, 
                    this.getPositionZ() + cannonLength * dire[1]]);
        bullet.uniformSetScale(this.tankBody.getScale()[0] * 0.007);
        this.addChld(bullet);
    }

    moveUp() {
        this.tankBody.move(0,0,-this.speed);
    };
    moveDown() {
        this.tankBody.move(0,0,this.speed);
    };
    moveLeft() {
        this.tankBody.move(-this.speed,0,0);
    };
    moveRight() {
        this.tankBody.move(this.speed,0,0);
    };

    updateTurretRotation()
    {
        var rot = Math.atan2((Mouse.mousePos[1] - this.screenCoords[1]), (Mouse.mousePos[0] - this.screenCoords[0]));
        rot -= Math.PI / 2;
        rot *= -1;
        mat4.fromRotation(this.tankBody.jointMatrices[1], rot, [0,1,0]);
    }
}

class Bullet extends GameObject
{
    speed: number = 0.1;
    bouncesLeft: number = 1;
    direction: SIMD2<number>;

    constructor(dir: SIMD2<number>, pos: SIMD3<number>)
    {
        super("bullet", ModelTypes.shell);
        this.setPosition(pos[0], pos[1], pos[2]);
        this.useBaseColourTexture(SpriteTypes.shell);
        this.direction = dir;
        let bruh = Math.atan2(dir[1], dir[0]);
        this.setRotationY(-(bruh - Math.PI / 2));
    }

    doUpdate(): void {
        this.move(this.direction[0] * this.speed, 0, this.direction[1] * this.speed);
    }
    
}