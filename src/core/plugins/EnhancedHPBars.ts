import { Plugin } from "../interfaces/plugin.class";

export class EnhancedHPBars extends Plugin {
    pluginName: string = "EnhancedHPBars";
    settings: { [key: string]: string | number | boolean; } = {};

    targetContainer : HTMLDivElement | null = null;
    nameDiv : HTMLDivElement | null = null;
    healthBarBack : HTMLDivElement | null = null;
    healthBarFront : HTMLDivElement | null = null;
    healthText : HTMLSpanElement | null = null;

    init(): void {
        this.log("Initializing");
    }

    start(): void {
        this.log("Started");
    }

    stop(): void {
        this.log("Stopped");
    }

    SocketManager_loggedIn(...args : any) {
        this.targetContainer = document.createElement('div');
        this.targetContainer.id = "highlite-target-container";
        this.targetContainer.className = "hs-menu hs-game-menu";
        this.targetContainer.style.position = "absolute";
        this.targetContainer.style.height = "75px";
        this.targetContainer.style.zIndex = "1000";
        this.targetContainer.style.right = "6px";
        this.targetContainer.style.top = "260px";
        this.targetContainer.style.display = "flex";
        this.targetContainer.style.flexDirection = "column";
        this.targetContainer.style.justifyContent = "space-evenly";
        document.getElementById('hs-screen-mask')?.appendChild(this.targetContainer);

        this.nameDiv = document.createElement('div');
        this.nameDiv.id = "highlite-target-name";
        this.nameDiv.style.textAlign = "center";
        this.nameDiv.style.display = "flex";
        this.nameDiv.style.justifyContent = "center";
        this.targetContainer.appendChild(this.nameDiv);

        const healthBarContainer = document.createElement('div');
        healthBarContainer.id = "highlite-target-healthbar-container";
        healthBarContainer.style.display = "flex";
        healthBarContainer.style.justifyContent = "center";
        this.targetContainer.appendChild(healthBarContainer);

        const healthBar = document.createElement('div');
        healthBar.id = "highlite-target-healthbar";
        healthBar.style.width = "90%";
        healthBar.style.height = "15px";
        healthBar.style.display = "flex";
        healthBar.style.justifyContent = "center";
        healthBarContainer.appendChild(healthBar);


        this.healthBarBack = document.createElement('div');
        this.healthBarBack.id = "highlite-target-healthbar-back";
        this.healthBarBack.style.width = "100%";
        this.healthBarBack.style.height = "15px";
        this.healthBarBack.style.backgroundColor = "rgba(242, 67, 67, 0.5)";
        this.healthBarBack.style.display = "flex";
        healthBar.appendChild(this.healthBarBack);

        this.healthBarFront = document.createElement('div');
        this.healthBarFront.id = "highlite-target-healthbar-front";
        this.healthBarFront.style.width = "100%";
        this.healthBarFront.style.height = "15px";
        this.healthBarFront.style.backgroundColor = "rgba(88, 162, 23, 1)";
        this.healthBarFront.style.display = "flex";
        this.healthBarFront.style.transition = "width 0.5s ease-in-out";
        this.healthBarBack.appendChild(this.healthBarFront);

        this.healthText = document.createElement('span');
        this.healthText.id = "highlite-target-health-text";
        this.healthText.style.fontSize = "10px";
        this.healthText.style.fontWeight = "bold";
        this.healthText.style.fontFamily = "Inter";
        this.healthText.style.position = "absolute";
        this.healthText.style.left = "50%";
        this.healthText.style.transform = "translateX(-50%)";


        healthBar.appendChild(this.healthText);
    }

    GameLoop_draw() {
        if (!this.targetContainer || !this.nameDiv || !this.healthBarBack || !this.healthText || !this.healthBarFront) {
            return;
        }

        const target = this.gameHooks.Classes.EntityManager.Instance.MainPlayer._currentTarget;
        if (target && target._def._combat) {
            this.targetContainer.style.visibility = "visible";
            this.nameDiv.innerText = target._name;
            this.healthText.innerText = `${target._hitpoints._currentLevel}/${target._hitpoints._level}`;
            this.healthBarFront.style.width = `${(target._hitpoints._currentLevel / target._hitpoints._level) * 100}%`;
        } else {
            this.targetContainer.style.visibility = "hidden";
        }

    }
}