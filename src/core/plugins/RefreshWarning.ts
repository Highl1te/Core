import { Plugin } from "../interfaces/plugin.class";
import { SettingsTypes } from "../interfaces/PluginSettings";
let pJSON = require('../../../package.json');

export class RefreshWarning extends Plugin {
    pluginName: string = "Refresh Warning";

    settings = {
        enable: {
            text: "Enabled",
            type: SettingsTypes.checkbox,
            value: true,
            callback: () => { } //TODO 
        },
    }

    init(): void {
        this.log("Initializing");
    }
    
    start(): void {
        this.log("Started");
        if (this.settings.enable) {
            this.enableWarning();
        }
    }

    stop(): void {
        this.log("Stopped");
    }

    enableWarning() {
        window.addEventListener("beforeunload", this.refreshWarning);
    }

    disableWarning() {
        window.removeEventListener("beforeunload", this.refreshWarning);
    }

    refreshWarning(e: BeforeUnloadEvent) {
        e.preventDefault();
    }
}