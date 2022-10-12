#version 300 es
precision mediump float;

struct SpriteSheetInfo
{
    vec2 pos;
    vec2 size;
};



in vec3 vertPosition;
in vec3 vertNormal;
in vec2 vertTexCoord;

out vec2 fragTexCoord;
out vec3 fragNormal;

uniform mat4 mModel;
uniform mat4 mView;
uniform mat4 mProj;
uniform SpriteSheetInfo spriteInfo;

void main() {
    fragTexCoord = vertTexCoord * spriteInfo.size + spriteInfo.pos;
    fragNormal = vertNormal;
    gl_Position = (mProj * mView * mModel * vec4(vertPosition, 1.0));
}