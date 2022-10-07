declare var glMatrix: any;
const { mat4 , vec3, quat } = glMatrix;

const enum TextureTypes
{
    none = -1,

    blueTank,
    redTank,
    ashTank,
    blackTank,
    brownTank,
    greenTank,
    marinTank,
    pinkTank,
    purpleTank,
    violetTank,
    whiteTank,
    yellowTank
}

const enum ModelTypes
{
    tank
}

const enum VertexShaderTypes
{
    default,
}

const enum FragmentShaderTypes
{
    default,
}

var start = function() 
{
    Main.InitApp()
}

class Main
{
    static gl: WebGL2RenderingContext;

    static InitApp() {

        var canvas = document.getElementById('game-surface') as HTMLCanvasElement;

        Main.gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        if (!Main.gl) {
            console.log('WebGL not supported, falling back on experimental-webgl');
            Main.gl = canvas.getContext('experimental-webgl') as WebGL2RenderingContext;
        }
    
        if (!Main.gl) {
            alert('Your browser does not support WebGL');
        }
    
        Main.gl.clearColor(0.75, 0.85, 0.8, 1.0);
        Main.gl.clear(Main.gl.COLOR_BUFFER_BIT | Main.gl.DEPTH_BUFFER_BIT);
        Main.gl.enable(Main.gl.DEPTH_TEST)
    
        Main.gl.enable(Main.gl.CULL_FACE);
        Main.gl.cullFace(Main.gl.BACK);
        Main.gl.frontFace(Main.gl.CCW);

        (async () => {
            await Engine.Initialise(Main.gl);
            this.RunApp(Main.gl, canvas);
        })();
    };
    
    static RunApp(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement)  
    {

        var program = gl.createProgram()!;
        gl.attachShader(program, Engine.shaderLibrary.getVertex(VertexShaderTypes.default));
        gl.attachShader(program, Engine.shaderLibrary.getFragment(FragmentShaderTypes.default));
        gl.linkProgram(program);

    
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('ERROR linking program!', gl.getProgramInfoLog(program));
            return;
        }
    
        gl.validateProgram(program);
        if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', gl.getProgramInfoLog(program));
            return;
        }
    
        // Create Buffer
    
    
        var tankBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tankBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, Engine.modelLibrary.get(ModelTypes.tank).model, gl.STATIC_DRAW);

        
        var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
        var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
        var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 32, 0); // Magic numbers!! (No idea what they are but it wasn't working before)
        gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 32, 12);
        gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 32, 24);
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(normalAttribLocation);
        gl.enableVertexAttribArray(texCoordAttribLocation);
    
        //  Create Texture
    
        var tankTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tankTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Engine.textureLibrary.get(TextureTypes.marinTank));

        gl.bindTexture(gl.TEXTURE_2D, null);
    
    
        // What program we are using
        gl.useProgram(program);
    
        var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
        var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    
        var worldMatrix = new Float32Array(16);
        var projMatrix = new Float32Array(16);
        var viewMatrix = new Float32Array(16);
    
        mat4.identity(worldMatrix);
        mat4.lookAt(viewMatrix, [0, 0, -7], [0, 0, 0], [0, 1, 0]);
        mat4.perspective(projMatrix, Math.PI/4.0, canvas.width / canvas.height, 0.1, 1000.0);
    
        gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);
    
        // Main Render Loop
    
        var xRotationMat = new Float32Array(16); 
        var yRotationMat = new Float32Array(16);
        var scaleMat = new Float32Array(16);
    
        var identityMatrix = mat4.create();
    
        var theta = 0;
        console.log(Engine.modelLibrary.get(ModelTypes.tank).model.byteLength / 32)
    
        var loop = () => 
        {
            theta = performance.now() / 1000 / 6 * 2 * Math.PI;
            mat4.rotate(xRotationMat, identityMatrix, theta, [1, 0, 0]);
            mat4.rotate(yRotationMat, identityMatrix, theta / 4, [0, 1, 0]);
            mat4.scale(scaleMat, identityMatrix, [10,10,10]);
            mat4.mul(worldMatrix, xRotationMat, yRotationMat);
            mat4.mul(worldMatrix, worldMatrix, scaleMat);
    
            gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
    
            gl.clearColor(0.75, 0.85, 0.8, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
            gl.bindTexture(gl.TEXTURE_2D, tankTexture);
            gl.activeTexture(gl.TEXTURE0);
            
            gl.drawArrays(gl.TRIANGLES, 0 , Engine.modelLibrary.get(ModelTypes.tank).model.byteLength / 32);
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    
    
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

    public static async Initialise(gl: WebGL2RenderingContext)
    {
        return new Promise<void>(async (resolve, reject) => {
            Engine._textureLibrary = new TextureLibrary();
            await Engine._textureLibrary.Initialise();
            Engine._modelLibrary = new ModelLibrary();
            await Engine._modelLibrary.Initialise();
            Engine._shaderLibrary = new ShaderLibrary();
            await Engine._shaderLibrary.Initialise(gl);
            resolve();
        });

    }

}

class Apex 
{

    private position = [0,0,0];
    private rotation = [0,0,0];
    private scale = [1,1,1];
    private quaternion = [0,0,0,0];

    private name: string;

    toRender: boolean = true;
    parentModelMatrix = new Float32Array(16);

    private _modelMatrix = new Float32Array(16);

    children: Apex[] = []; // Array of Apex 's

    get modelMatrix()
    {
        var ret = new Float32Array(16);
        mat4.mul(ret, this.parentModelMatrix, this._modelMatrix );
        return ret
        
    }

    updateModelMatrix()
    {   
        mat4.fromRotationTranslationScale(this.modelMatrix, this.quaternion, this.position, this.scale);
    }

    constructor(name = "Apex")
    {
        this.name = name;
        quat.fromEuler(this.quaternion, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.identity(this.parentModelMatrix);
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
            child.update()
        }
    }

    doRender(gl: WebGL2RenderingContext) { }

    render(gl: WebGL2RenderingContext)
    {
        if (this.toRender) { this.doRender(gl) }

        for (let child of this.children)
        {
            child.render(gl)
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
    
    move(x = 0, y  = 0, z  = 0) { this.setPosition(this.getPositionX() + x, this.getPositionY() + y, this.getPositionZ() + z)}
    
    getPosition() { return this.position }
    getPositionX()   { return this.position[0] }
    getPositionY()   { return this.position[1] }
    getPositionZ()   { return this.position[2] }
    
    setRotation( x: number , y: number , z: number )
    {
        this.rotation = [x,y,z]
        
        quat.fromEuler(this.quaternion, x, y, z);
        
        this.updateModelMatrix()
        this.afterRotation()
    }
    
    setRotationX( x: number ) { this.setRotation(x, this.getRotationY(), this.getRotationZ())}
    setRotationY( y: number ) { this.setRotation(this.getRotationX(), y, this.getRotationZ())}
    setRotationZ( z: number ) { this.setRotation(this.getRotationX(), this.getRotationY(), z)}
    
    rotate(x = 0, y = 0,z  = 0) { this.setRotation(this.getRotationX() + x, this.getRotationY() + y, this.getRotationZ() + z)}
    
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
    
    scaleF(x  = 0, y  = 0,z  = 0) { this.setScale(this.getScaleX() + x, this.getScaleY() + y, this.getScaleZ() + z)}
    
    getScale()   { return this.scale }
    getScaleX()   { return this.scale[0] }
    getScaleY()   { return this.scale[1] }
    getScaleZ()   { return this.scale[2] }
    


}

class Scene extends Apex
{
    viewMatrix = new Float32Array(16);
    projectionMatrix = new Float32Array(16);

    constructor()
    {
        super();
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.buildScene();
    }

    buildScene() { }

    render(gl: WebGL2RenderingContext)
    {
        super.render(gl);
    }

}

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

class ModelLibrary
{
    private library: Mesh[] = [];

    public Initialise()
    {
        return new Promise<void>(async (resolve, reject) => {
            this.library[ModelTypes.tank] = await Model.getBinaryFromObj("/src/Assets/tankP.obj")
            resolve();
        });   
    }

    public get(type: ModelTypes): Mesh
    {
        return this.library[type]
    }

}

class Mesh
{
    model!: ArrayBuffer;
    boundingBox!: BoundingBox;
    faceCount: number;
    constructor(model: ArrayBuffer, bounds: BoundingBox, count: number) {
        this.model = model;
        this.boundingBox = bounds;
        this.faceCount = count;
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
        
        var faceCount = 0;

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
                positions.push(pos);
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
                faceCount += 1;

                for (const group of values)
                {
                    const [ positionIndex, texCoordIndex, normalIndex] = this.stringsToNumbers(group.split('/'));

                    arrayBufferSource.push(...positions[positionIndex - 1]);
                    arrayBufferSource.push(...normals[normalIndex - 1]);
                    arrayBufferSource.push(...texCoords[texCoordIndex - 1]);
                    
                }
            }

        }

        return new Mesh(new Float32Array(arrayBufferSource).buffer, boundingBox, faceCount);
    }   

}

class TextureLibrary
{
    private library: TexImageSource[] = [];

    Initialise()
    {
        return new Promise<void>(async (resolve, reject) => {
            this.library[TextureTypes.blueTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/player/tank_blue.png"); 
            this.library[TextureTypes.redTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/player/tank_red.png");
            this.library[TextureTypes.ashTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_ash.png");
            this.library[TextureTypes.blackTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_black.png");
            this.library[TextureTypes.brownTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_brown.png");
            this.library[TextureTypes.greenTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_green.png");
            this.library[TextureTypes.marinTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_marin.png");
            this.library[TextureTypes.pinkTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_pink.png");
            this.library[TextureTypes.purpleTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_purple.png");
            this.library[TextureTypes.violetTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_violet.png");
            this.library[TextureTypes.whiteTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_white.png");
            this.library[TextureTypes.yellowTank] = await ResourceLoader.loadImageResource("/src/Assets/Tanks/textures/enemy/tank_yellow.png");

            resolve();
        });
    }

    public get(type: TextureTypes): TexImageSource
    {
        return this.library[type]
    }

    
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



    public Initialise(gl: WebGL2RenderingContext)
    {
        return new Promise<void>(async (resolve, reject) => {
            // Amound of shaders
            var stringlib: string[] = new Array(1); 
            stringlib[VertexShaderTypes.default] = await ResourceLoader.loadTextResource('/src/Shaders/shader.vs.glsl');

            for (let i = 0; i < stringlib.length; i++)
            {
                this.vertexLibrary[i] = gl.createShader(gl.VERTEX_SHADER)!;
                gl.shaderSource(this.vertexLibrary[i], stringlib[i]);
                gl.compileShader(this.vertexLibrary[i]);

                if (!gl.getShaderParameter(this.vertexLibrary[i], gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(this.vertexLibrary[i]));
                    return;
                }
            }

            stringlib = new Array(1); 
            stringlib[FragmentShaderTypes.default] = await ResourceLoader.loadTextResource('/src/Shaders/shader.fs.glsl');

            for (let i = 0; i < stringlib.length; i++)
            {
                this.fragmentLibrary[i] = gl.createShader(gl.FRAGMENT_SHADER)!;
                gl.shaderSource(this.fragmentLibrary[i], stringlib[i]);
                gl.compileShader(this.fragmentLibrary[i]);

                if (!gl.getShaderParameter(this.fragmentLibrary[i], gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(this.fragmentLibrary[i]));
                    return;
                }
            }
            resolve();

        });
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
        return new Promise<TexImageSource>((resolve) => {
            var image = new Image();
            image.onload = function() {
                resolve(image);
            };
            image.src = url;
        });
        
    }
}

class BoundingBox {
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