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

    mat3 normalMatrix = mat3(transpose(inverse(mModel)));
    
    vec4 norm = vec4(vertNormal, 1.0);
    norm = jointMatrices[mm] * norm;

    fragTexCoord = vertTexCoord * spriteInfo.size + spriteInfo.pos;
    fragNormal = normalMatrix * norm.xyz;
    gl_Position = (mProj * mView * mModel * jointMatrices[mm] * vec4(vertPosition, 1.0));
}