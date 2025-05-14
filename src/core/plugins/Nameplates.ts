import { Plugin } from "../interfaces/plugin.class";
import {Viewport, Matrix, Vector3, Frustum, Camera, Mesh} from "@babylonjs/core";

export class Nameplates extends Plugin {
    pluginName: string = "Nameplates";
    settings: { [key: string]: string | number | boolean; } = {};

    NampeplateContainer : HTMLDivElement | null = null;
    NPCDomElements = {}
    PlayerDomElements = {}


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
        if (!this.DOMElement) {
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
            document.getElementById('game-container')?.appendChild(this.DOMElement);
        }
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
        const NPCS = this.gameHooks.Classes.EntityManager.Instance._npcs; // Map
        const Players = this.gameHooks.Classes.EntityManager.Instance._players; // Array

        // Clear non-existing NPCs
        if (NPCS.size == 0) {
            for (const key in this.NPCDomElements) {
                this.NPCDomElements[key].remove();
                delete this.NPCDomElements[key];
            }
        }
        for (const key in this.NPCDomElements) {
            if (!NPCS[key]) {
                this.NPCDomElements[key].remove();
                delete this.NPCDomElements[key];
            }
        }

        // Clear non-existing Players
        if (Players.length == 0) {
            for (const key in this.PlayerDomElements) {
                this.PlayerDomElements[key].remove();
                delete this.PlayerDomElements[key];
            }
        }

        for (const key in this.PlayerDomElements) {
            for (const player of Players) {
                if (key == player._entityId) {
                    break;
                }

                if (player == Players[Players.length - 1]) {
                    this.PlayerDomElements[key].remove();
                    delete this.PlayerDomElements[key];
                }
            }
        }


        
        // Loop through all NPCs   
        for (const [key,value] of NPCS) {
            const npc = value;
            if (!this.NPCDomElements[key]) {
                this.NPCDomElements[key] = document.createElement('div');
                this.NPCDomElements[key].id = `highlite-nameplates-${key}`;
                this.NPCDomElements[key].style.position = "absolute";
                this.NPCDomElements[key].style.pointerEvents = "none";
                this.NPCDomElements[key].style.zIndex = "1000";
                this.NPCDomElements[key].style.color = "yellow";
                this.NPCDomElements[key].innerHTML = npc._name;
                document.getElementById('highlite-nameplates')?.appendChild(this.NPCDomElements[key]);
            }

            const npcMesh = npc._appearance._haloNode;
            try {
                this.updateElementPosition(npcMesh, this.NPCDomElements[key]);
            } catch (e) {
                this.log("Error updating NPC element position: ", e);
            }
            
        }

        for (const player of Players) {
            if (!this.PlayerDomElements[player._entityId]) {
                this.PlayerDomElements[player._entityId] = document.createElement('div');
                this.PlayerDomElements[player._entityId].id = `highlite-nameplates-${player._entityId}`;
                this.PlayerDomElements[player._entityId].style.position = "absolute";
                this.PlayerDomElements[player._entityId].style.pointerEvents = "none";
                this.PlayerDomElements[player._entityId].style.zIndex = "1000";
                this.PlayerDomElements[player._entityId].style.color = "white";
                this.PlayerDomElements[player._entityId].innerHTML = player._name;
                document.getElementById('highlite-nameplates')?.appendChild(this.PlayerDomElements[player._entityId]);
            }

            // Check if Player is a friend
            const playerFriends = this.gameHooks.Classes.ChatManager.Instance._friends;
            for (const friend of playerFriends) {
                if (friend == player._nameLowerCase) {
                    this.PlayerDomElements[player._entityId].style.color = "lightgreen";
                    break;
                } else {
                    this.PlayerDomElements[player._entityId].style.color = "white";
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

                        // Halo  // DIV Element
    updateElementPosition(e: Mesh, t: Vector3) {
        const translationCoordinates = Vector3.Project(Vector3.ZeroReadOnly, 
            e.getWorldMatrix(), 
            this.gameHooks.Classes.GameEngine.Instance.Scene.getTransformMatrix(),
            this.gameHooks.Classes.GameCameraManager.Camera.viewport.toGlobal(this.gameHooks.Classes.GameEngine.Instance.Engine.getRenderWidth(1), this.gameHooks.Classes.GameEngine.Instance.Engine.getRenderHeight(1)),
        );
        const camera : Camera =  this.gameHooks.Classes.GameCameraManager.Camera;
        const isInFrustrum = e.isInFrustum(Frustum.GetPlanes(camera.getTransformationMatrix()));
        if (!isInFrustrum) {
            t.style.visibility = "hidden";
        } else {
            t.style.visibility = "visible";
        }

        t.style.transform = "translate3d(calc(" + this.pxToRem(translationCoordinates.x) + "rem - 50%), calc(" + this.pxToRem(translationCoordinates.y) + "rem - 50%), 0px)"


    }
    pxToRem(px: number) {
        return px / 16;
    }

}


// 