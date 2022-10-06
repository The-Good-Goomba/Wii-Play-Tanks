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
var start = function () {
    Main.InitApp();
};
class Main {
    static InitApp() {
        (() => __awaiter(this, void 0, void 0, function* () {
            var vertShaderText = yield loadTextResource('/src/Shaders/shader.vs.glsl');
            var fragShaderText = yield loadTextResource('/src/Shaders/shader.fs.glsl');
            var tankModel = yield loadJSONResource('/src/Assets/tankP.json');
            var tankImage = yield loadImageResource('/src/Assets/Tanks/textures/player/tank_blue.png');
            this.RunApp(vertShaderText, fragShaderText, tankModel, tankImage);
        }))();
    }
    ;
    static RunApp(vertShaderText, fragShaderText, tankModel, tankImage) {
        var model = tankModel;
        var canvas = document.getElementById('game-surface');
        var gl = canvas.getContext('webgl');
        if (!gl) {
            console.log('WebGL not supported, falling back on experimental-webgl');
            gl = canvas.getContext('experimental-webgl');
        }
        if (!gl) {
            alert('Your browser does not support WebGL');
        }
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        // Create Shaders
        // Vertex Shader
        var source = vertShaderText;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, source);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
            return;
        }
        // Fragment Shader
        source = fragShaderText;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, source);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
            return;
        }
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('ERROR linking program!', gl.getProgramInfoLog(program));
            return;
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', gl.getProgramInfoLog(program));
            return;
        }
        // Create Buffer
        var tankVertices = model.meshes[0].vertices;
        var tankIndices = [].concat.apply([], model.meshes[0].faces);
        var tankTexCoords = model.meshes[0].texturecoords[0];
        var tankVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tankVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tankVertices), gl.STATIC_DRAW);
        var tankIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tankIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tankIndices), gl.STATIC_DRAW);
        var tankTexCoordBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tankTexCoordBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tankTexCoords), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, tankVertexBufferObject);
        var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, tankTexCoordBufferObject);
        var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
        gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(texCoordAttribLocation);
        //  Create Texture
        var tankTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tankTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tankImage);
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
        mat4.perspective(projMatrix, Math.PI / 4.0, canvas.width / canvas.height, 0.1, 1000.0);
        gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);
        // Main Render Loop
        var xRotationMat = new Float32Array(16);
        var yRotationMat = new Float32Array(16);
        var scaleMat = new Float32Array(16);
        var identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);
        var theta = 0;
        var loop = () => {
            theta = performance.now() / 1000 / 6 * 2 * Math.PI;
            mat4.rotate(xRotationMat, identityMatrix, theta, [1, 0, 0]);
            mat4.rotate(yRotationMat, identityMatrix, theta / 4, [0, 1, 0]);
            mat4.scale(scaleMat, identityMatrix, [0.1, 0.1, 0.1]);
            mat4.mul(worldMatrix, xRotationMat, yRotationMat);
            mat4.mul(worldMatrix, worldMatrix, scaleMat);
            gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
            gl.clearColor(0.75, 0.85, 0.8, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.bindTexture(gl.TEXTURE_2D, tankTexture);
            gl.activeTexture(gl.TEXTURE0);
            gl.drawElements(gl.TRIANGLES, tankIndices.length, gl.UNSIGNED_SHORT, 0);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
class Engine {
    static get modelLibrary() { return this._modelLibrary; }
    static get textureLibrary() { return this._textureLibrary; }
    static Initialise() {
        this._textureLibrary = new TextureLibrary();
        this._modelLibrary = new ModelLibrary();
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
        this._modelMatrix = new Float32Array(16);
        this.children = []; // Array of Apex 's
        this.name = name;
        quat.fromEuler(this.quaternion, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.identity(this.parentModelMatrix);
        this.updateModelMatrix();
    }
    get modelMatrix() {
        var ret = new Float32Array(16);
        mat4.mul(ret, this.parentModelMatrix, this._modelMatrix);
        return ret;
    }
    updateModelMatrix() {
        mat4.fromRotationTranslationScale(this.modelMatrix, this.quaternion, this.position, this.scale);
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
            child.update();
        }
    }
    doRender(gl) { }
    render(gl) {
        if (this.toRender) {
            this.doRender(gl);
        }
        for (let child of this.children) {
            child.render(gl);
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
    move(x = 0, y = 0, z = 0) { this.setPosition(this.getPositionX() + x, this.getPositionY() + y, this.getPositionZ() + z); }
    getPosition() { return this.position; }
    getPositionX() { return this.position[0]; }
    getPositionY() { return this.position[1]; }
    getPositionZ() { return this.position[2]; }
    setRotation(x, y, z) {
        this.rotation = [x, y, z];
        quat.fromEuler(this.quaternion, x, y, z);
        this.updateModelMatrix();
        this.afterRotation();
    }
    setRotationX(x) { this.setRotation(x, this.getRotationY(), this.getRotationZ()); }
    setRotationY(y) { this.setRotation(this.getRotationX(), y, this.getRotationZ()); }
    setRotationZ(z) { this.setRotation(this.getRotationX(), this.getRotationY(), z); }
    rotate(x = 0, y = 0, z = 0) { this.setRotation(this.getRotationX() + x, this.getRotationY() + y, this.getRotationZ() + z); }
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
    scaleF(x = 0, y = 0, z = 0) { this.setScale(this.getScaleX() + x, this.getScaleY() + y, this.getScaleZ() + z); }
    getScale() { return this.scale; }
    getScaleX() { return this.scale[0]; }
    getScaleY() { return this.scale[1]; }
    getScaleZ() { return this.scale[2]; }
}
class Scene extends Apex {
    constructor() {
        super();
        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.buildScene();
    }
    buildScene() { }
    render(gl) {
        super.render(gl);
    }
}
class GameObject extends Apex {
    constructor(name, type) {
        super(name);
        this.normalMatrix = [];
        this.baseTexture = -1 /* none */;
        this.normalMap = -1 /* none */;
        this.mesh = Engine.modelLibrary.get(type);
    }
}
class ModelLibrary {
    constructor() {
        this.library = [];
        (() => __awaiter(this, void 0, void 0, function* () {
            this.library[0 /* tank */] = yield Model.getBinaryFromObj("/src/Assets/tankP.obj");
        }))();
    }
    get(type) {
        return this.library[type];
    }
}
class Mesh {
    constructor(model, bounds) {
        this.model = model;
        this.boundingBox = bounds;
    }
}
class Model {
    static getBinaryFromObj(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContents = yield this.getFileContents(url);
            const mesh = this.parseFile(fileContents);
            return mesh;
        });
    }
}
_a = Model;
Model.getFileContents = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield fetch(filename);
    const body = yield file.text();
    return body;
});
Model.stringsToNumbers = (strings) => {
    const numbers = [];
    for (const str of strings) {
        numbers.push(parseFloat(str));
    }
    return numbers;
};
Model.parseFile = (fileContents) => {
    const positions = [];
    const texCoords = [];
    const normals = [];
    const arrayBufferSource = [];
    var boundingBox = new BoundingBox([Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]);
    const lines = fileContents.split('\n');
    var pos = [0, 0, 0];
    for (const line of lines) {
        const [command, ...values] = line.split(' ', 4);
        if (command === 'v') {
            pos = _a.stringsToNumbers(values);
            boundingBox.updateBounds(pos);
            positions.push(_a.stringsToNumbers(values));
        }
        else if (command === 'vt') {
            texCoords.push(_a.stringsToNumbers(values));
        }
        else if (command === 'vn') {
            normals.push(_a.stringsToNumbers(values));
        }
        else if (command === 'f') {
            for (const group of values) {
                const [positionIndex, texCoordIndex, normalIndex] = _a.stringsToNumbers(group.split('/'));
                arrayBufferSource.push(...positions[positionIndex - 1]);
                arrayBufferSource.push(...texCoords[texCoordIndex - 1]);
                arrayBufferSource.push(...normals[normalIndex - 1]);
            }
        }
    }
    return new Mesh(new Float32Array(arrayBufferSource).buffer, boundingBox);
};
class TextureLibrary {
    constructor() {
        this.library = [];
        (() => __awaiter(this, void 0, void 0, function* () {
            this.library[0 /* blueTank */] = yield loadImageResource("/src/Assets/Tanks/textures/player/tank_blue.png");
            this.library[1 /* redTank */] = yield loadImageResource("/src/Assets/Tanks/textures/player/tank_red.png");
            this.library[2 /* ashTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_ash.png");
            this.library[3 /* blackTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_black.png");
            this.library[4 /* brownTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_brown.png");
            this.library[5 /* greenTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_green.png");
            this.library[6 /* marinTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_marin.png");
            this.library[7 /* pinkTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_pink.png");
            this.library[8 /* purpleTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_purple.png");
            this.library[9 /* violetTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_violet.png");
            this.library[10 /* whiteTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_white.png");
            this.library[11 /* yellowTank */] = yield loadImageResource("/src/Assets/Tanks/textures/enemy/tank_yellow.png");
        }))();
    }
    get(type) {
        return this.library[type];
    }
}
function loadTextResource(url) {
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
function loadJSONResource(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var json = yield loadTextResource(url);
        return JSON.parse(json);
    });
}
// Load an image resource from a file over the network
function loadImageResource(url) {
    return new Promise((resolve) => {
        var image = new Image();
        image.onload = function () {
            resolve(image);
        };
        image.src = url;
    });
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
