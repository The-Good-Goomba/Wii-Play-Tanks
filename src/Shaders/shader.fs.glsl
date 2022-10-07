#version 300 es
precision mediump float;

in vec2 fragTexCoord;
in vec3 fragNormal;

uniform sampler2D sampler;

out vec4 fragColour;
void main()
{
    fragColour = vec4((texture(sampler, fragTexCoord).xyz * normalize(fragNormal)), 1);
}