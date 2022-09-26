/** @type {WebGLRenderingContext} */

var vertShaderText = `
precision mediump float;
attribute vec2 vertPosition;
attribute vec3 vertColour;

varying vec3 fragColour;

void main() {
    fragColour = vertColour;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}
`;

var fragShaderText = `
precision mediump float;

varying vec3 fragColour;

void main()
{
    gl_FragColor = vec4(fragColour,1.0);
}
`;


var InitApp = function()  {
    console.log('InitApp');

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

    // Create Shaders

    // Vertex Shader
    var source = vertShaderText;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, source);
    gl.compileShader(vertexShader);

    console.log(source);
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

    var triangleVertices = 
    [
        // X, Y
        0.0, 0.5, 1.0, 1.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0, 1.0
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
    var colourAttribLocation = gl.getAttribLocation(program, 'vertColour')

    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.vertexAttribPointer(
        colourAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    )

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colourAttribLocation);

    // Main Render Loop

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES ,0 ,3 );

}