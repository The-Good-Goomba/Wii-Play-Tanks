var { mat4 } = glMatrix;

var InitApp = function() {
    loadTextResource('/shader.vs.glsl', function(vsErr, vsText){
        if (vsErr) {
            alert('Fatal Error getting vertex shader');
            console.log(vsErr);
        } else {
            loadTextResource('/shader.fs.glsl', function(fsErr, fsText){  
                if (fsErr) {
                    alert('Fatal Error getting fragment shader');
                    console.log(fsErr);
                } else {
                    loadJSONResource('/s', function(jsonErr, scene){
                        if (jsonErr) {
                            alert('Fatal Error getting scene.json');
                            console.log(jsonErr);
                        } else {
                             RunApp(vsText, fsText);
                        }
                    });
                }
            });
        }
    });
};

var RunApp = function(vertShaderText, fragShaderText, tankModel)  {

    var canvas = document.getElementById('game-surface');

    /** @type {WebGLRenderingContext} */
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

    var boxVertices = 
    [
        // X, Y, Z           U, V
        // Top
        -1.0, 1.0, -1.0,     0, 0,
        -1.0, 1.0, 1.0,      0, 1,
        1.0, 1.0, 1.0,       1, 1,
        1.0, 1.0, -1.0,      1, 0,

        // Left
        -1.0, 1.0, 1.0,      1, 1,
        -1.0, -1.0, 1.0,     0,1,
        -1.0, -1.0, -1.0,    0, 0,
        -1.0, 1.0, -1.0,     1, 0,

        // Right
        1.0, 1.0, 1.0,       1, 1,
        1.0, -1.0, 1.0,      0, 1,
        1.0, -1.0, -1.0,     0, 0,
        1.0, 1.0, -1.0,      1, 0,

        // Front
        1.0, 1.0, 1.0,       1, 1,
        1.0, -1.0, 1.0,      1, 0,
        -1.0, -1.0, 1.0,     0, 0,
        -1.0, 1.0, 1.0,      0, 1,

        // Back
        1.0, 1.0, -1.0,      1, 1,
        1.0, -1.0, -1.0,     1, 0,
        -1.0, -1.0, -1.0,    0, 0,
        -1.0, 1.0, -1.0,     0, 1,

        // Bottom
        -1.0, -1.0, -1.0,    0, 0,
        -1.0, -1.0, 1.0,     0, 1,
        1.0, -1.0, 1.0,      1, 1,
        1.0, -1.0, -1.0,     1, 0,

    ];

    var boxIndices =
    [
        // Top
        0, 1, 2,
        0, 2, 3,

        // Left
        5, 4, 6,
        6, 4, 7,

        // Right
        8, 9, 10,
        8, 10, 11,

        // Front
        13, 12, 14,
        15, 14, 12,

        // Back
        16, 17, 18,
        16, 18, 19,

        // Bottom
        21, 20, 22,
        22, 20, 23
    ];

    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var indexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        false,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.vertexAttribPointer(
        texCoordAttribLocation,
        2,
        gl.FLOAT,
        false,
        5 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    )

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    //  Create Texture

    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('amongus'));

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

    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);

    var theta = 0;

    var loop = () => 
    {
        theta = performance.now() / 1000 / 6 * 2 * Math.PI;
        mat4.rotate(xRotationMat, identityMatrix, theta, [1, 0, 0]);
        mat4.rotate(yRotationMat, identityMatrix, theta / 4, [0, 1, 0]);
        mat4.mul(worldMatrix, xRotationMat, yRotationMat);
        gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);


}