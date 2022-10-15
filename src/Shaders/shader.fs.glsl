#version 300 es
precision mediump float;

in vec2 fragTexCoord;
in vec3 fragNormal;

uniform sampler2D uSampler;

out vec4 fragColour;
void main()
{
    vec4 baseColour = texture(uSampler, fragTexCoord);
    vec4 diffuseColour = vec4(0.0, 0.0, 0.0, 1.0);

    vec3 normalDir = normalize(fragNormal);
    vec3 lightDir = normalize(vec3(0.0, 1.0, 1.0));
    float diffuse = max(dot(normalDir, lightDir), 0.0);
    diffuseColour += baseColour * diffuse;

    fragColour = diffuseColour;
}