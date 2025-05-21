import { NotificationManager } from "../core/managers/highlite/notificationManager";
import { Plugin } from "../core/interfaces/highlite/plugin/plugin.class";
import { SettingsTypes } from "../core/interfaces/highlite/plugin/pluginSettings.interface";

export class HPAlert extends Plugin {
    pluginName: string = "HP Alert";
    private notificationManager: NotificationManager = new NotificationManager();
    private doNotify: boolean = true;

    constructor() {
        super();
        this.settings.volume = {
            text: "Volume",
            type: SettingsTypes.range,
            value: 0.5,
            callback: () => { } //NOOP
        };
        this.settings.activationPercent = {
            text: "Activation Percent",
            type: SettingsTypes.range,
            value: 0.5,
            callback: () => { } //NOOP 
        };
        this.settings.notification = {
            text: "Notification",
            type: SettingsTypes.checkbox,
            value: false,
            callback: () => { } //NOOP 
        }
    }

    init(): void {
        this.log("Initializing");
    }
    
    start(): void {
        this.log("Started")
    }

    stop(): void {
        this.log("Stopped")
    }


    GameLoop_update(...args : any) {
        if (!this.settings.enable.value) {
            return;
        }
        const player = this.gameHooks.EntityManager.Instance._mainPlayer;

        if (player === undefined) {
            return;
        }

        if (player._hitpoints == undefined) {
            return;
        }

        if ((player._hitpoints._currentLevel / player._hitpoints._level) < ((this.settings.activationPercent?.value as number) / 100)) {
            const ctx = new AudioContext();
            const gain = ctx.createGain();
            gain.gain.value = ((this.settings.volume?.value as number)/100);
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
            if (this.doNotify && this.settings.notification?.value) {
                this.doNotify = false;
                this.notificationManager.createNotification(`${player._name} is low on health!`);
            }
        } else {
            this.doNotify = true;
        }
    }
}