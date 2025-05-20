import { NotificationHelper } from "../helpers/NotificationHelper";
import { Plugin } from "../interfaces/plugin.class";
import { SettingsTypes } from "../interfaces/PluginSettings";

export class HPAlert extends Plugin {
    pluginName: string = "HP Alert";
    settings = {
        enable: {
            text: "Enabled",
            type: SettingsTypes.checkbox,
            value: false,
            callback: () => { } //TODO 
        },
        volume: {
            text: "Volume",
            type: SettingsTypes.range,
            value: 0.5,
            callback: () => { } //TODO 
        },
        activationPercent: {
            text: "Activation Percent",
            type: SettingsTypes.range,
            value: 0.5,
            callback: () => { } //TODO 
        },
    };

    init(): void {
        this.log("Initializing");
    }

    start(): void {
        this.log("Started");
    }

    stop(): void {
        this.log("Stopped");
    }


    GameLoop_update(...args: any) {
        if (!this.settings.enable) {
            return;
        }
        const player = this.gameHooks.Classes.EntityManager.Instance._mainPlayer;

        if (player === undefined) {
            return;
        }

        if (player._hitpoints == undefined) {
            return;
        }

        if ((player._hitpoints._currentLevel / player._hitpoints._level) < (this.settings.activationPercent / 100)) {
            const ctx = new AudioContext();
            const gain = ctx.createGain();
            gain.gain.value = (this.settings.volume / 100);
            gain.connect(ctx.destination);

            // First chirp
            const osc1 = ctx.createOscillator();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(440, ctx.currentTime);
            osc1.connect(gain);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.2); // Chirp for 0.2 seconds

            // Second chirp (starts after 0.25 seconds)
            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.25);
            osc2.connect(gain);
            osc2.start(ctx.currentTime + 0.25);
            osc2.stop(ctx.currentTime + 0.45); // Another 0.2-second chirp
            if (this.doNotify && this.settings.notification) {
                this.doNotify = false;
                NotificationHelper.showNotification(`${player._name} is low on health!`);
            }
        } else {
            this.doNotify = true;
        }
    }
}