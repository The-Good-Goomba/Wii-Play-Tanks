export enum TextureTypes
{
    none = -1,

    blueTank,
    redTank,
    ashTank,
    blackTank,
    brownTank,
    greenTank,
    marinTank,
    pinkTank,
    purpleTank,
    violetTank,
    whiteTank,
    yellowTank
}


export class TextureLibrary
{
    private library: TexImageSource[] = [];

    constructor()
    {
        (async () => {
            this.library[TextureTypes.blueTank] = await loadImageResource("/src/Assets/Tanks/textures/player/tank_blue.png"); 
            this.library[TextureTypes.redTank] = await loadImageResource("/src/Assets/Tanks/textures/player/tank_red.png");
            this.library[TextureTypes.ashTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_ash.png");
            this.library[TextureTypes.blackTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_black.png");
            this.library[TextureTypes.brownTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_brown.png");
            this.library[TextureTypes.greenTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_green.png");
            this.library[TextureTypes.marinTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_marin.png");
            this.library[TextureTypes.pinkTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_pink.png");
            this.library[TextureTypes.purpleTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_purple.png");
            this.library[TextureTypes.violetTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_violet.png");
            this.library[TextureTypes.whiteTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_white.png");
            this.library[TextureTypes.yellowTank] = await loadImageResource("/src/Assets/Tanks/textures/enemy/tank_yellow.png");

        })();
    }

    public get(type: TextureTypes): TexImageSource
    {
        return this.library[type]
    }

    
}
