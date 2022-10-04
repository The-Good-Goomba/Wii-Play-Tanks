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
const { mat4, vec3, quat } = glMatrix;
var InitApp = function () {
    (() => __awaiter(this, void 0, void 0, function* () {
        var vertShaderText = yield loadTextResource('/src/Shaders/shader.vs.glsl');
        var fragShaderText = yield loadTextResource('/src/Shaders/shader.fs.glsl');
        var tankModel = yield loadJSONResource('/src/Assets/tankP.json');
        var tankImage = yield loadImageResource('/src/Assets/Tanks/textures/player/tank_blue.png');
        RunApp(vertShaderText, fragShaderText, tankModel, tankImage);
    }))();
};
var RunApp = function (vertShaderText, fragShaderText, tankModel, tankImage) {
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
};
// Load a text resource from a file over the network
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