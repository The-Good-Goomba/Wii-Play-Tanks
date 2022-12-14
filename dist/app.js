"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
const { mat4, vec3, quat } = glMatrix;
const normalise3 = (v) => {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
};
const normalise2 = (v) => {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / length, v[1] / length];
};
const toDegrees = (radians) => radians * 180 / Math.PI;
var start = function () {
    Main.InitApp();
};
class Main {
    static InitApp() {
        Main.canvas = document.getElementById('game-surface');
        Main.gl = Main.canvas.getContext('webgl2');
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
        (() => __awaiter(this, void 0, void 0, function* () {
            yield Engine.Initialise();
            SceneManager.Initialise(1 /* mainGame */);
            this.RunApp();
        }))();
    }
    ;
    static RunApp() {
        var loop = () => {
            Main.gl.clearColor(0.75, 0.85, 0.8, 1.0);
            Main.gl.clear(Main.gl.COLOR_BUFFER_BIT | Main.gl.DEPTH_BUFFER_BIT);
            SceneManager.doUpdate();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
class Keyboard {
    static Initialise() {
        window.addEventListener('keydown', function (event) {
            Keyboard.keys[event.key] = true;
        });
        window.addEventListener('keyup', function (event) {
            Keyboard.keys[event.key] = false;
        });
    }
    static isKeyDown(key) {
        return Keyboard.keys[key];
    }
}
Keyboard.keys = {};
class Mouse {
    static get mousePos() {
        return Mouse._mousePos;
    }
    static Initialise() {
        window.onmousedown = function (event) { Mouse._mouseButtons[event.button] = true; };
        window.onmouseup = function (event) { Mouse._mouseButtons[event.button] = false; };
        Main.canvas.onmousemove = Mouse.updateMousePos;
    }
    ;
    static updateMousePos(event) {
        Mouse._mousePos[0] = event.offsetX;
        Mouse._mousePos[1] = event.offsetY;
    }
}
Mouse._mousePos = [0, 0];
Mouse._mouseButtons = {};
class SceneManager {
    static Initialise(type) {
        SceneManager.setScene(type);
    }
    static get currentScene() {
        return SceneManager._currentScene;
    }
    static setScene(type) {
        switch (type) {
            case 1 /* mainGame */:
                SceneManager._currentScene = new TankScene();
        }
    }
    static doUpdate() {
        SceneManager._currentScene.update();
        SceneManager._currentScene.render();
    }
}
class Engine {
    static get modelLibrary() { return this._modelLibrary; }
    static get textureLibrary() { return this._textureLibrary; }
    static get shaderLibrary() { return this._shaderLibrary; }
    static Initialise() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                Engine._textureLibrary = new TextureLibrary();
                yield Engine._textureLibrary.Initialise();
                Engine._modelLibrary = new ModelLibrary();
                yield Engine._modelLibrary.Initialise();
                Engine._shaderLibrary = new ShaderLibrary();
                yield Engine._shaderLibrary.Initialise();
                resolve();
            }));
        });
    }
}
class Apex {
    constructor(name = "Apex") {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.quaternion = [0, 0, 0, 0];
        this.toRender = true;
        this.parentModelMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);
        this._modelMatrix = new Float32Array(16);
        this.children = []; // Array of Apex 's
        this.name = name;
        quat.fromEuler(this.quaternion, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.identity(this.parentModelMatrix);
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        mat4.identity(this._modelMatrix);
        this.updateModelMatrix();
    }
    get modelMatrix() {
        var ret = new Float32Array(16);
        mat4.mul(ret, this.parentModelMatrix, this._modelMatrix);
        return ret;
    }
    updateModelMatrix() {
        mat4.fromRotationTranslationScale(this._modelMatrix, this.quaternion, this.position, this.scale);
    }
    getName() {
        return this.name;
    }
    addChld(child) {
        this.children.push(child);
    }
    doUpdate() { }
    update() {
        this.doUpdate();
        for (let child of this.children) {
            child.parentModelMatrix = this._modelMatrix;
            child.viewMatrix = this.viewMatrix;
            child.projectionMatrix = this.projectionMatrix;
            child.update();
        }
    }
    doRender() { }
    render() {
        if (this.toRender) {
            this.doRender();
        }
        for (let child of this.children) {
            child.render();
        }
    }
    //    Override if you want to do something after transformations
    afterScale() { }
    afterTranslation() { }
    afterRotation() { }
    // I would like to move this outside of the main block
    setPosition(x, y, z) {
        this.position = [x, y, z];
        this.updateModelMatrix();
        this.afterTranslation();
    }
    setPositionX(x) { this.setPosition(x, this.getPositionY(), this.getPositionZ()); }
    setPositionY(y) { this.setPosition(this.getPositionX(), y, this.getPositionZ()); }
    setPositionZ(z) { this.setPosition(this.getPositionX(), this.getPositionY(), z); }
    move(x, y, z) { this.setPosition(this.getPositionX() + x, this.getPositionY() + y, this.getPositionZ() + z); }
    getPosition() { return this.position; }
    getPositionX() { return this.position[0]; }
    getPositionY() { return this.position[1]; }
    getPositionZ() { return this.position[2]; }
    setRotation(x, y, z) {
        this.rotation = [x, y, z];
        quat.fromEuler(this.quaternion, toDegrees(x), toDegrees(y), toDegrees(z));
        this.updateModelMatrix();
        this.afterRotation();
    }
    setRotationX(x) { this.setRotation(x, this.getRotationY(), this.getRotationZ()); }
    setRotationY(y) { this.setRotation(this.getRotationX(), y, this.getRotationZ()); }
    setRotationZ(z) { this.setRotation(this.getRotationX(), this.getRotationY(), z); }
    rotate(x, y, z) { this.setRotation(this.getRotationX() + x, this.getRotationY() + y, this.getRotationZ() + z); }
    getRotation() { return this.rotation; }
    getRotationX() { return this.rotation[0]; }
    getRotationY() { return this.rotation[1]; }
    getRotationZ() { return this.rotation[2]; }
    setScale(x, y, z) {
        this.scale = [x, y, z];
        this.updateModelMatrix();
        this.afterScale();
    }
    uniformSetScale(s) { this.setScale(s, s, s); }
    setScaleX(x) { this.setScale(x, this.getScaleY(), this.getScaleZ()); }
    setScaleY(y) { this.setScale(this.getScaleX(), y, this.getScaleZ()); }
    setScaleZ(z) { this.setScale(this.getScaleX(), this.getScaleY(), z); }
    scaleF(x, y, z) { this.setScale(this.getScaleX() + x, this.getScaleY() + y, this.getScaleZ() + z); }
    getScale() { return this.scale; }
    getScaleX() { return this.scale[0]; }
    getScaleY() { return this.scale[1]; }
    getScaleZ() { return this.scale[2]; }
}
class Scene extends Apex {
    constructor() {
        super("Scene");
        this.toRender = false;
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.buildScene();
    }
    buildScene() { }
}
class GameObject extends Apex {
    constructor(name, type) {
        super(name);
        this.normalMatrix = [];
        this.jointMatrices = [];
        for (var i = 0; i < 4; i++) {
            this.jointMatrices[i] = mat4.create();
        }
        this.program = ShaderLibrary.createProgram(0 /* default */, 0 /* default */);
        this.positionAttribLocation = Main.gl.getAttribLocation(this.program, 'vertPosition');
        this.normalAttribLocation = Main.gl.getAttribLocation(this.program, 'vertNormal');
        this.texCoordAttribLocation = Main.gl.getAttribLocation(this.program, 'vertTexCoord');
        this.meshMemberAttribLocation = Main.gl.getAttribLocation(this.program, 'meshMember');
        this.matModelUniformLocation = Main.gl.getUniformLocation(this.program, 'mModel');
        this.matViewUniformLocation = Main.gl.getUniformLocation(this.program, 'mView');
        this.matProjUniformLocation = Main.gl.getUniformLocation(this.program, 'mProj');
        this.samplerUniformLocation = Main.gl.getUniformLocation(this.program, 'uSampler');
        this.spritePosUniformLocation = Main.gl.getUniformLocation(this.program, 'spriteInfo.pos');
        this.spriteSizeUniformLocation = Main.gl.getUniformLocation(this.program, 'spriteInfo.size');
        var mesh = Engine.modelLibrary.get(type);
        this.bufferCount = mesh.model.byteLength / 36;
        this.boundingBox = mesh.boundingBox;
        this.modelBuffer = Main.gl.createBuffer();
        Main.gl.bindBuffer(Main.gl.ARRAY_BUFFER, this.modelBuffer);
        Main.gl.bufferData(Main.gl.ARRAY_BUFFER, mesh.model, Main.gl.STATIC_DRAW);
        Main.gl.bindBuffer(Main.gl.ARRAY_BUFFER, null);
    }
    doRender() {
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
        for (var i = 0; i < this.jointMatrices.length; i++) {
            Main.gl.uniformMatrix4fv(Main.gl.getUniformLocation(this.program, `jointMatrices[${i}]`), false, this.jointMatrices[i]);
        }
        if (this.baseTexture) {
            Main.gl.activeTexture(Main.gl.TEXTURE0);
            Main.gl.bindTexture(Main.gl.TEXTURE_2D, this.baseTexture);
            Main.gl.uniform1i(this.samplerUniformLocation, 0);
            Main.gl.uniform2fv(this.spritePosUniformLocation, this.sprite.pos);
            Main.gl.uniform2fv(this.spriteSizeUniformLocation, this.sprite.size);
        }
        Main.gl.drawArrays(Main.gl.TRIANGLES, 0, this.bufferCount);
        Main.gl.bindBuffer(Main.gl.ARRAY_BUFFER, null);
    }
    useBaseColourTexture(type) {
        if (type == -1 /* none */) {
            return;
        }
        this.sprite = Engine.textureLibrary.getSprite(type);
        this.baseTexture = Main.gl.createTexture();
        Main.gl.bindTexture(Main.gl.TEXTURE_2D, this.baseTexture);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_WRAP_T, Main.gl.REPEAT);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_WRAP_S, Main.gl.REPEAT);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_MIN_FILTER, Main.gl.LINEAR);
        Main.gl.texParameterf(Main.gl.TEXTURE_2D, Main.gl.TEXTURE_MAG_FILTER, Main.gl.LINEAR);
        Main.gl.texImage2D(Main.gl.TEXTURE_2D, 0, Main.gl.RGBA, Main.gl.RGBA, Main.gl.UNSIGNED_BYTE, Engine.textureLibrary.getTexture(this.sprite.textureType));
        Main.gl.bindTexture(Main.gl.TEXTURE_2D, null);
    }
}
class ModelLibrary {
    constructor() {
        this.library = [];
    }
    Initialise() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.library[0 /* tank */] = yield ModelLoader.getBinaryFromObj("/src/Assets/tankP.obj");
            this.library[1 /* plane */] = yield ModelLoader.getBinaryFromObj("/src/Assets/plane.obj");
            this.library[2 /* shell */] = yield ModelLoader.getBinaryFromObj("/src/Assets/shell.obj");
            resolve();
        }));
    }
    get(type) {
        return this.library[type];
    }
}
class ModelLoader {
    static getBinaryFromObj(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContents = yield ModelLoader.getFileContents(url);
            const mesh = ModelLoader.parseFile(fileContents);
            return mesh;
        });
    }
}
_a = ModelLoader;
ModelLoader.getFileContents = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield fetch(filename);
    const body = yield file.text();
    return body;
});
ModelLoader.stringsToNumbers = (strings) => {
    const numbers = [];
    for (const str of strings) {
        numbers.push(parseFloat(str));
    }
    return numbers;
};
ModelLoader.parseFile = (fileContents) => {
    const positions = [];
    const texCoords = [];
    const normals = [];
    const arrayBufferSource = [];
    var boundingBox = new BoundingBox([Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]);
    const lines = fileContents.split('\n');
    var pos = [0, 0, 0];
    var meshMember = [];
    var currentMember = 0;
    for (const line of lines) {
        const [command, ...values] = line.split(' ', 4);
        if (command === 'g') {
            var bruh = true;
            for (let i = 0; i < meshMember.length; i++) {
                if (values[0] == meshMember[i]) {
                    currentMember = i;
                    bruh = false;
                }
            }
            if (bruh) {
                currentMember = meshMember.length;
                meshMember.push(values[0]);
            }
        }
        if (command === 'v') {
            pos = ModelLoader.stringsToNumbers(values);
            boundingBox.updateBounds(pos);
            positions.push(pos);
        }
        else if (command === 'vt') {
            texCoords.push(ModelLoader.stringsToNumbers(values));
        }
        else if (command === 'vn') {
            normals.push(ModelLoader.stringsToNumbers(values));
        }
        else if (command === 'f') {
            for (const group of values) {
                const [positionIndex, texCoordIndex, normalIndex] = ModelLoader.stringsToNumbers(group.split('/'));
                arrayBufferSource.push(...positions[positionIndex - 1]);
                arrayBufferSource.push(...normals[normalIndex - 1]);
                arrayBufferSource.push(...texCoords[texCoordIndex - 1]);
                arrayBufferSource.push(currentMember);
            }
        }
    }
    var mod = new Float32Array(arrayBufferSource).buffer;
    return { model: mod, boundingBox: boundingBox };
};
class TextureLibrary {
    constructor() {
        this.texLibrary = [];
        this.spriteLib = [];
    }
    Initialise() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.texLibrary[0 /* bigSheet */] = yield ResourceLoader.loadImageResource("/src/Assets/Textures.png");
            this.spriteLib[0 /* blueTank */] = { textureType: 0 /* bigSheet */, pos: [877, 1241], size: [32, 32] };
            this.spriteLib[2 /* ashTank */] = { textureType: 0 /* bigSheet */, pos: [185, 1241], size: [32, 32] };
            this.spriteLib[3 /* blackTank */] = { textureType: 0 /* bigSheet */, pos: [259, 1241], size: [32, 32] };
            this.spriteLib[4 /* greenTank */] = { textureType: 0 /* bigSheet */, pos: [148, 1241], size: [32, 32] };
            this.spriteLib[5 /* oliveTank */] = { textureType: 0 /* bigSheet */, pos: [790, 1241], size: [32, 32] };
            this.spriteLib[6 /* marinTank */] = { textureType: 0 /* bigSheet */, pos: [221, 1241], size: [32, 32] };
            this.spriteLib[7 /* pinkTank */] = { textureType: 0 /* bigSheet */, pos: [4, 1241], size: [32, 32] };
            this.spriteLib[8 /* purpleTank */] = { textureType: 0 /* bigSheet */, pos: [927, 1172], size: [32, 32] };
            this.spriteLib[9 /* violetTank */] = { textureType: 0 /* bigSheet */, pos: [444, 1241], size: [32, 32] };
            this.spriteLib[10 /* whiteTank */] = { textureType: 0 /* bigSheet */, pos: [110, 1241], size: [32, 32] };
            this.spriteLib[11 /* yellowTank */] = { textureType: 0 /* bigSheet */, pos: [816, 1241], size: [32, 32] };
            this.spriteLib[12 /* woodenFloor */] = { textureType: 0 /* bigSheet */, pos: [5, 522], size: [1024, 512] };
            this.spriteLib[13 /* shell */] = { textureType: 0 /* bigSheet */, pos: [753, 1241], size: [32, 16] };
            for (var i in this.spriteLib) {
                this.spriteLib[i].pos[0] /= this.getTexture(this.spriteLib[i].textureType).width;
                this.spriteLib[i].pos[1] /= this.getTexture(this.spriteLib[i].textureType).height;
                this.spriteLib[i].size[0] /= this.getTexture(this.spriteLib[i].textureType).width;
                this.spriteLib[i].size[1] /= this.getTexture(this.spriteLib[i].textureType).height;
            }
            resolve();
        }));
    }
    getTexture(type) {
        return this.texLibrary[type];
    }
    getSprite(type) {
        return this.spriteLib[type];
    }
}
class ShaderLibrary {
    constructor() {
        this.vertexLibrary = new Array(1);
        this.fragmentLibrary = new Array(1);
    }
    getVertex(type) {
        return this.vertexLibrary[type];
    }
    getFragment(type) {
        return this.fragmentLibrary[type];
    }
    Initialise() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            // Amound of shaders
            var stringlib = new Array(1);
            stringlib[0 /* default */] = yield ResourceLoader.loadTextResource('/src/Shaders/shader.vs.glsl');
            for (let i = 0; i < stringlib.length; i++) {
                this.vertexLibrary[i] = Main.gl.createShader(Main.gl.VERTEX_SHADER);
                Main.gl.shaderSource(this.vertexLibrary[i], stringlib[i]);
                Main.gl.compileShader(this.vertexLibrary[i]);
                if (!Main.gl.getShaderParameter(this.vertexLibrary[i], Main.gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling vertex shader!', Main.gl.getShaderInfoLog(this.vertexLibrary[i]));
                    return;
                }
            }
            stringlib = new Array(1);
            stringlib[0 /* default */] = yield ResourceLoader.loadTextResource('/src/Shaders/shader.fs.glsl');
            for (let i = 0; i < stringlib.length; i++) {
                this.fragmentLibrary[i] = Main.gl.createShader(Main.gl.FRAGMENT_SHADER);
                Main.gl.shaderSource(this.fragmentLibrary[i], stringlib[i]);
                Main.gl.compileShader(this.fragmentLibrary[i]);
                if (!Main.gl.getShaderParameter(this.fragmentLibrary[i], Main.gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling fragment shader!', Main.gl.getShaderInfoLog(this.fragmentLibrary[i]));
                    return;
                }
            }
            resolve();
        }));
    }
    static createProgram(vert, frag) {
        var program = Main.gl.createProgram();
        Main.gl.attachShader(program, Engine.shaderLibrary.getVertex(vert));
        Main.gl.attachShader(program, Engine.shaderLibrary.getFragment(frag));
        Main.gl.linkProgram(program);
        if (!Main.gl.getProgramParameter(program, Main.gl.LINK_STATUS)) {
            console.error('ERROR linking program!', Main.gl.getProgramInfoLog(program));
        }
        Main.gl.validateProgram(program);
        if (!Main.gl.getProgramParameter(program, Main.gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', Main.gl.getProgramInfoLog(program));
        }
        return program;
    }
}
class ResourceLoader {
    static loadTextResource(url) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var request = yield fetch(url);
            if (request.status < 200 || request.status > 299) {
                reject('Error: HTTP Status ' + request.status + ' on resource ' + url);
            }
            else {
                resolve(request.text());
            }
        }));
    }
    // Load a JSON resource from a file over the network
    static loadJSONResource(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var json = yield this.loadTextResource(url);
            return JSON.parse(json);
        });
    }
    // Load an image resource from a file over the network
    static loadImageResource(url) {
        return new Promise((resolve) => {
            var image = new Image();
            image.onload = function () {
                resolve(image);
            };
            image.src = url;
        });
    }
}
class BoundingBox {
    constructor(min = [0, 0, 0], max = [0, 0, 0]) {
        this.minBounds = min;
        this.maxBounds = max;
    }
    get width() { return this.maxBounds[0] - this.minBounds[0]; }
    get height() { return this.maxBounds[1] - this.minBounds[1]; }
    get depth() { return this.maxBounds[2] - this.minBounds[2]; }
    scaleWidthTo(wide) { return wide / this.width; }
    scaleHeightTo(high) { return high / this.height; }
    scaleDepthTo(deep) { return deep / this.depth; }
    getScaledBounds(scale) {
        var box = new BoundingBox;
        box.minBounds = [this.minBounds[0] * scale[0], this.minBounds[1] * scale[1], this.minBounds[2] * scale[2]];
        box.maxBounds = [this.maxBounds[0] * scale[0], this.maxBounds[1] * scale[1], this.maxBounds[2] * scale[2]];
        return box;
    }
    updateBounds(pos) {
        //        Max bounds
        if (pos[1] > this.maxBounds[1]) {
            this.maxBounds[1] = pos[1];
        }
        if (pos[0] > this.maxBounds[0]) {
            this.maxBounds[0] = pos[0];
        }
        if (pos[2] > this.maxBounds[2]) {
            this.maxBounds[2] = pos[2];
        }
        //        Min Bounds
        if (pos[1] < this.minBounds[1]) {
            this.minBounds[1] = pos[1];
        }
        if (pos[0] < this.minBounds[0]) {
            this.minBounds[0] = pos[0];
        }
        if (pos[2] < this.minBounds[2]) {
            this.minBounds[2] = pos[2];
        }
    }
}
class TankScene extends Scene {
    buildScene() {
        this.tank1 = new Tank();
        this.tank1.tankBody.useBaseColourTexture(2 /* ashTank */);
        this.floor = new GameObject("Floor", 1 /* plane */);
        this.floor.useBaseColourTexture(12 /* woodenFloor */);
        mat4.lookAt(this.viewMatrix, [0, 10, 10], [0, 0, 0], normalise3([0, 5, -1]));
        mat4.perspective(this.projectionMatrix, Math.PI / 4.0, Main.canvas.width / Main.canvas.height, 0.1, 1000.0);
        // mat4.ortho(this.projectionMatrix, -10, 10, -7, 7, 0.1, 100.0);
        this.children[0] = this.tank1;
        this.children[1] = this.floor;
        this.tank1.tankBody.uniformSetScale(5);
        this.floor.uniformSetScale(10);
    }
    doUpdate() {
        if (Keyboard.isKeyDown('w')) {
            this.tank1.moveUp();
        }
        if (Keyboard.isKeyDown('s')) {
            this.tank1.moveDown();
        }
        if (Keyboard.isKeyDown('a')) {
            this.tank1.moveLeft();
        }
        if (Keyboard.isKeyDown('d')) {
            this.tank1.moveRight();
        }
    }
}
class Tank extends Apex {
    constructor() {
        super("Tank");
        this.speed = 0.1;
        this.rotationSpeed = 0.03;
        this.baseRotation = 0;
        this.screenCoords = [0, 0, 0];
        this.tankBody = new GameObject("TankBody", 0 /* tank */);
        mat4.fromRotation(this.tankBody.jointMatrices[0], Math.PI / 2, [0, 1, 0]);
        this.addChld(this.tankBody);
        this.tankBody.afterTranslation = () => {
            var bruh1 = mat4.create();
            mat4.mul(bruh1, this.projectionMatrix, this.viewMatrix);
            vec3.transformMat4(this.screenCoords, this.tankBody.getPosition(), bruh1);
            this.screenCoords[0] = ((this.screenCoords[0] + 1) / 2) * Main.canvas.width;
            this.screenCoords[1] = -1 * ((this.screenCoords[1] - 1) / 2) * Main.canvas.height;
        };
        this.tankBody.afterTranslation();
    }
    doUpdate() {
        this.updateTurretRotation();
    }
    shoot(dir = [0, 1]) {
        const cannonLength = this.tankBody.getScaleX() * 0.16;
        var dire = normalise2([(Mouse.mousePos[0] - this.screenCoords[0]), (Mouse.mousePos[1] - this.screenCoords[1])]);
        var bullet = new Bullet(dire, [this.getPositionX() + cannonLength * dire[0],
            this.getPositionY() + this.tankBody.getScaleX() * 0.1,
            this.getPositionZ() + cannonLength * dire[1]]);
        bullet.uniformSetScale(this.tankBody.getScale()[0] * 0.007);
        this.addChld(bullet);
    }
    moveUp() {
        this.tankBody.move(0, 0, -this.speed);
    }
    ;
    moveDown() {
        this.tankBody.move(0, 0, this.speed);
    }
    ;
    moveLeft() {
        this.tankBody.move(-this.speed, 0, 0);
    }
    ;
    moveRight() {
        this.tankBody.move(this.speed, 0, 0);
    }
    ;
    updateTurretRotation() {
        var rot = Math.atan2((Mouse.mousePos[1] - this.screenCoords[1]), (Mouse.mousePos[0] - this.screenCoords[0]));
        rot -= Math.PI / 2;
        rot *= -1;
        mat4.fromRotation(this.tankBody.jointMatrices[1], rot, [0, 1, 0]);
    }
}
class Bullet extends GameObject {
    constructor(dir, pos) {
        super("bullet", 2 /* shell */);
        this.speed = 0.1;
        this.bouncesLeft = 1;
        this.setPosition(pos[0], pos[1], pos[2]);
        this.useBaseColourTexture(13 /* shell */);
        this.direction = dir;
        let bruh = Math.atan2(dir[1], dir[0]);
        this.setRotationY(-(bruh - Math.PI / 2));
    }
    doUpdate() {
        this.move(this.direction[0] * this.speed, 0, this.direction[1] * this.speed);
    }
}
