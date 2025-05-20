import { NotificationHelper } from "../helpers/NotificationHelper";
import { Plugin } from "../interfaces/plugin.class";
let pJSON = require('../../../package.json');


export class VersionNotification extends Plugin {
    pluginName: string = "Version Notification";
    highliteVersionElement : HTMLButtonElement | null = null;

    settings = {
        enable: true
    };

    init(): void {
        this.log('Initializing');
        this.highliteVersionElement = document.createElement('button');
        this.highliteVersionElement.id = "login-screen-clear-game-cache-button";
        this.highliteVersionElement.className = "login-screen-default-text-shadow";
        this.highliteVersionElement.innerText = `Highlite Version ${pJSON.version}`;
        this.highliteVersionElement.style = "left 0; right: auto; margin:.75rem;";
        
        document.getElementById('game-container')?.appendChild(this.highliteVersionElement);
    }

    SocketManager_loggedIn(...args : any) {
        if (!this.settings.enable) {
            return;
        }

        if (!this.highliteVersionElement) {
            return;
        }
        this.highliteVersionElement.style.visibility = 'hidden'
    }

    SocketManager_handleLoggedOut(...args : any) {
        if (!this.settings.enable) {
            return;
        }

        if (!this.highliteVersionElement) {
            return;
        }

        this.highliteVersionElement.style.visibility = 'visible'
    }
    
    start(): void {
        if (!this.settings.enable) {
            return;
        }

        if (!this.highliteVersionElement) {
            return;
        }
        // Re-add the element to the DOM
        document.getElementById('game-container')?.appendChild(this.highliteVersionElement);
    }

    stop(): void {
        this.highliteVersionElement?.remove();
    }

}