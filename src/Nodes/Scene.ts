import { Apex } from "./Node";

class Scene extends Apex
{
    viewMatrix = new Float32Array(16);
    projectionMatrix = new Float32Array(16);

    constructor()
    {
        super();
        mat4.identity(this.viewMatrix);
        mat4.identity(this.projectionMatrix);
        this.buildScene();
    }

    buildScene() { }

    render(gl: WebGL2RenderingContext)
    {
        super.render(gl);
    }

}