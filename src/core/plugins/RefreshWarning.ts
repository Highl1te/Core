import { Plugin } from "../interfaces/plugin.class";
let pJSON = require('../../../package.json');

export class RefreshWarning extends Plugin {
    pluginName: string = "Refresh Warning";

    settings = {
        enabled: true
    };

    init(): void {
        this.log("Initializing");
    }
    
    start(): void {
        this.log("Started");
        if (this.settings.enabled) {
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