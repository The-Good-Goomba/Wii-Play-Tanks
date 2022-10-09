#version 300 es
precision mediump float;

struct SpriteSheetInfo
{
    vec2 pos;
    vec2 size;
};

layout(location=0) in vec3 vertPosition;
layout(location=1) in vec3 vertNormal;
layout(location=2) in vec2 vertTexCoord;


out vec2 fragTexCoord;
out vec3 fragNormal;

uniform SpriteSheetInfo spriteInfo;
uniform mat4 mModel;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragTexCoord = vertTexCoord * spriteInfo.size + spriteInfo.pos;
    fragNormal = vertNormal;
    gl_Position = (mProj * mView * mModel * vec4(vertPosition, 1.0));
}