import { Plugin } from "../core/interfaces/highlite/plugin/plugin.class"
import { SettingsTypes } from "../core/interfaces/highlite/plugin/pluginSettings.interface";

export class Nameplates extends Plugin {
    pluginName: string = "Nameplates";
    DOMElement: HTMLDivElement | null = null;
    constructor() {
        super();
        this.settings.playerNameplates = {
            text: "Player Nameplates",
            type: SettingsTypes.checkbox,
            value: true,
            callback: () => { } //NOOP

        };
        this.settings.npcNameplates = {
            text: "NPC Nameplates",
            type: SettingsTypes.checkbox,
            value: true,
            callback: () => { } //NOOP
        };
    }

    NampeplateContainer : HTMLDivElement | null = null;
    NPCDomElements : {
        [key : string] : HTMLDivElement
    } = {}
    PlayerDomElements : {
        [key : string] : HTMLDivElement
    } = {}


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
        this.DOMElement = document.createElement('div');
        this.DOMElement.id = "highlite-nameplates";
        this.DOMElement.style.position = "absolute";
        this.DOMElement.style.pointerEvents = "none";
        this.DOMElement.style.zIndex = "1";
        this.DOMElement.style.overflow = "hidden";
        this.DOMElement.style.width = "100%";
        this.DOMElement.style.height = "100%";
        this.DOMElement.style.fontFamily = "Inter";
        this.DOMElement.style.fontSize = "12px";
        this.DOMElement.style.fontWeight = "bold";
        document.getElementById('hs-screen-mask')?.appendChild(this.DOMElement);
    }

    SocketManager_handleLoggedOut(...args : any) {
        // Clear the NPC and Player DOM elements
        for (const key in this.NPCDomElements) {
            if (this.NPCDomElements[key]) {
                this.NPCDomElements[key].remove();
            }
        }
        for (const key in this.PlayerDomElements) {
            if (this.PlayerDomElements[key]) {
                this.PlayerDomElements[key].remove();
            }
        }

        this.NPCDomElements = {};
        this.PlayerDomElements = {};
    }

    GameLoop_draw() {
        const NPCS = this.gameHooks.EntityManager.Instance._npcs; // Map
        const Players = this.gameHooks.EntityManager.Instance._players; // Array
        const playerCombatLevel = this.gameHooks.EntityManager.Instance.MainPlayer._combatLevel;
        const _W = document.client.get("_W");


        // Clear non-existing NPCs
        if (NPCS.size == 0 || this.settings.enable.value == false || this.settings.npcNameplates!.value == false) {
            for (const key in this.NPCDomElements) {
                this.NPCDomElements[key]!.remove();
                delete this.NPCDomElements[key];
            }
        }
        for (const key in this.NPCDomElements) {
            if (!NPCS[key]) {
                this.NPCDomElements[key]!.remove();
                delete this.NPCDomElements[key];
            }
        }
        

        // Clear non-existing Players
        if (Players.length == 0 || this.settings.enable.value == false || this.settings.playerNameplates!.value == false) {
            for (const key in this.PlayerDomElements) {
                this.PlayerDomElements[key]!.remove();
                delete this.PlayerDomElements[key];
            }
        }

        for (const key in this.PlayerDomElements) {
            for (const player of Players) {
                if (key == player._entityId) {
                    break;
                }

                if (player == Players[Players.length - 1]) {
                    this.PlayerDomElements[key]!.remove();
                    delete this.PlayerDomElements[key];
                }
            }
        }

        if (!this.settings.enable.value) {
            return;
        }

        // Loop through all NPCs
        if (this.settings.npcNameplates!.value) {
            for (const [key,value] of NPCS) {
                const npc = value;
                if (!this.NPCDomElements[key]) {
                    this.NPCDomElements[key] = document.createElement('div');
                    this.NPCDomElements[key].id = `highlite-nameplates-${key}`;
                    this.NPCDomElements[key].style.position = "absolute";
                    this.NPCDomElements[key].style.pointerEvents = "none";
                    this.NPCDomElements[key].style.zIndex = "1000";
                    this.NPCDomElements[key].style.display = "flex";
                    this.NPCDomElements[key].style.flexDirection = "column";
                    // Center children
                    this.NPCDomElements[key].style.justifyContent = "center";
                    // this.NPCDomElements[key].innerHTML = npc._name;
                    
                    // Create Name Holder
                    const nameSpan = document.createElement("div");
                    nameSpan.style.color = "yellow";
                    nameSpan.style.textAlign = "center";

                    nameSpan.innerText = npc._name;
                    this.NPCDomElements[key].append(nameSpan);

                    // Create Lvl Holder
                    if (npc._combatLevel != 0) {
                        const lvlSpan = document.createElement("div");
                        lvlSpan.style.textAlign = "center";
                        lvlSpan.innerText = `Lvl. ${npc._combatLevel}`
                        lvlSpan.className = _W.getTextColorClassNameForCombatLevelDifference(playerCombatLevel, npc._combatLevel)
                        
                        if (npc._def._combat._isAggressive && !npc._def._combat._isAlwaysAggro) {
                            lvlSpan.innerText += " 😠"
                        }

                        if (!npc._def._combat._isAggressive && !npc._def._combat._isAlwaysAggro) {
                            lvlSpan.innerText += " 😐"
                        }

                        if (npc._def._combat._isAlwaysAggro) {
                            lvlSpan.innerText += " 👿";
                        }
                        this.NPCDomElements[key].append(lvlSpan);
                    }

                    document.getElementById('highlite-nameplates')?.appendChild(this.NPCDomElements[key]);
                }

                const npcMesh = npc._appearance._haloNode;
                try {
                    this.updateElementPosition(npcMesh, this.NPCDomElements[key]);
                } catch (e) {
                    this.log("Error updating NPC element position: ", e);
                }
            }
        }

        if (this.settings.playerNameplates!.value) {
            for (const player of Players) {
                if (!this.PlayerDomElements[player._entityId]) {
                    this.PlayerDomElements[player._entityId] = document.createElement('div');
                    this.PlayerDomElements[player._entityId]!.id = `highlite-nameplates-${player._entityId}`;
                    this.PlayerDomElements[player._entityId]!.style.position = "absolute";
                    this.PlayerDomElements[player._entityId]!.style.pointerEvents = "none";
                    this.PlayerDomElements[player._entityId]!.style.zIndex = "1000";
                    this.PlayerDomElements[player._entityId]!.style.color = "white";
                    this.PlayerDomElements[player._entityId]!.innerHTML = player._name;
                    document.getElementById('highlite-nameplates')?.appendChild(this.PlayerDomElements[player._entityId]!);
                }

                // Check if Player is a friend
                const playerFriends = this.gameHooks.ChatManager.Instance._friends;
                for (const friend of playerFriends) {
                    if (friend == player._nameLowerCase) {
                        this.PlayerDomElements[player._entityId]!.style.color = "lightgreen";
                        break;
                    } else {
                        this.PlayerDomElements[player._entityId]!.style.color = "white";
                    }
                }

                const playerMesh = player._appearance._haloNode;
                try {
                    this.updateElementPosition(playerMesh, this.PlayerDomElements[player._entityId]);
                } catch (e) {
                    this.log("Error updating Player element position: ", e);
                }   
            }
        }
    }

                        // Halo  // DIV Element
    updateElementPosition(e: any, t : any) {
        const translationCoordinates = document.BABYLON.Pq.Project(document.BABYLON.Pq.ZeroReadOnly, 
            e.getWorldMatrix(), 
            this.gameHooks.GameEngine.Instance.Scene.getTransformMatrix(),
            this.gameHooks.GameCameraManager.Camera.viewport.toGlobal(this.gameHooks.GameEngine.Instance.Engine.getRenderWidth(1), this.gameHooks.GameEngine.Instance.Engine.getRenderHeight(1)),
        );
        const camera =  this.gameHooks.GameCameraManager.Camera;
        // camera._scene._frustrumPlanes
        const isInFrustrum = camera.isInFrustum(e);
        if (!isInFrustrum) {
            t.style.visibility = "hidden";
        } else {
            t.style.visibility = "visible";
        }

        t.style.transform = "translate3d(calc(" + this.pxToRem(translationCoordinates.x) + "rem - 50%), calc(" + this.pxToRem(translationCoordinates.y - 15) + "rem - 50%), 0px)"


    }
    pxToRem(px: number) {
        return px / 16;
    }

}