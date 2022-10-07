#version 300 es
precision mediump float;

layout(location=0) in vec3 vertPosition;
layout(location=1) in vec3 vertNormal;
layout(location=2) in vec2 vertTexCoord;


flat out vec2 fragTexCoord;
flat out vec3 fragNormal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragTexCoord = vertTexCoord;
    fragNormal = vertNormal;
    gl_Position = (mProj * mView * mWorld * vec4(vertPosition, 1.0));
}