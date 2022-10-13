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
in float meshMember;

out vec2 fragTexCoord;
out vec3 fragNormal;

uniform mat4 mModel;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4[4] jointMatrices;
uniform SpriteSheetInfo spriteInfo;

void main() {
    int mm = int(meshMember);
    fragTexCoord = vertTexCoord * spriteInfo.size + spriteInfo.pos;
    fragNormal = vertNormal;
    gl_Position = (mProj * mView * mModel * jointMatrices[mm] * vec4(vertPosition, 1.0));
}