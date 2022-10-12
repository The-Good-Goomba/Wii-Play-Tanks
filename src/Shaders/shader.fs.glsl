#version 300 es
precision mediump float;

in vec2 fragTexCoord;
in vec3 fragNormal;

uniform sampler2D uSampler;

out vec4 fragColour;
void main()
{
    fragColour = vec4(texture(uSampler, fragTexCoord).xyz * normalize(fragNormal),1);
}