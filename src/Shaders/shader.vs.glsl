#version 300 es
precision mediump float;

in vec3 vertPosition;
in vec2 vertTexCoord;
in vec3 vertNormal;

out vec2 fragTexCoord;
out vec3 fragNormal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragTexCoord = vertTexCoord;
    fragNormal = vertNormal;
    gl_Position = (mProj * mView * mWorld * vec4(vertPosition, 1.0));
}