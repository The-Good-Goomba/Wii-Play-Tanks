precision mediump float;

attribute vec2 vert_Position;

void main()
{
    gl_Position = vec4(vert_Position, 0.0, 1.0);
}