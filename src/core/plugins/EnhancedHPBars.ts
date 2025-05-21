import { Plugin } from "../interfaces/plugin.class";

export class EnhancedHPBars extends Plugin {
    pluginName: string = "Enhanced HP Bars";

    targetContainer: HTMLDivElement | null = null;
    previousTarget: any | null = null;
    lostTargetTime: number | null = null;
    nameDiv: HTMLDivElement | null = null;
    healthBarBack: HTMLDivElement | null = null;
    healthBarFront: HTMLDivElement | null = null;
    healthText: HTMLSpanElement | null = null;

    init(): void {
        this.log("Initializing");
    }

    start(): void {
        this.log("Started");
        if (this.settings.enable.value && this.targetContainer !== null) {
            // Re-add the element to the DOM
            document.getElementById('hs-screen-mask')?.appendChild(this.targetContainer);
        }
    }

    stop(): void {
        this.targetContainer?.remove();
    }

    SocketManager_loggedIn(...args: any) {
        if (!this.settings.enable.value) {
            return;
        }
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
        if (!this.settings.enable.value) {
            return;
        }

        if (!this.targetContainer || !this.nameDiv || !this.healthBarBack || !this.healthText || !this.healthBarFront) {
            return;
        }

        const target = this.gameHooks.Classes.EntityManager.Instance.MainPlayer.CurrentTarget;
        if (target && target.Def && target.Def.Combat) {
            this.targetContainer.style.visibility = "visible";
            this.nameDiv.innerText = target.Name;
            this.healthText.innerText = `${target.Hitpoints.CurrentLevel}/${target.Hitpoints.Level}`;
            this.healthBarFront.style.width = `${(target.Hitpoints.CurrentLevel / target.Hitpoints.Level) * 100}%`;
            this.previousTarget = target;
            this.lostTargetTime = null;
        } else if (!target && this.previousTarget && this.previousTarget.Def && this.previousTarget.Def.Combat) {
            if (!this.lostTargetTime) {
                this.lostTargetTime = Date.now();
            }
            if ((Date.now() - this.lostTargetTime) >= 20000) {
                this.lostTargetTime = null;
                this.previousTarget = null;
                return;
            }
            this.targetContainer.style.visibility = "visible";
            this.nameDiv.innerText = this.previousTarget.Name;
            this.healthText.innerText = `${this.previousTarget.Hitpoints.CurrentLevel}/${this.previousTarget.Hitpoints.Level}`;
            this.healthBarFront.style.width = `${(this.previousTarget.Hitpoints.CurrentLevel / this.previousTarget.Hitpoints.Level) * 100}%`;

        } else {
            this.targetContainer.style.visibility = "hidden";
        }

    }
}