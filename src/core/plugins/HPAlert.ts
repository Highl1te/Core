import { Plugin } from "../interfaces/plugin.class";
let pJSON = require('../../../package.json');


export class HPAlert extends Plugin {
    pluginName: string = "HPAlert";
    settings = {
        volume : 0.5,
        activationPercent : 0.5,
        enabled : true
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


    GameLoop_update(...args : any) {
        const player = this.gameHooks.Classes.EntityManager.Instance._mainPlayer;

        if (player === undefined) {
            return;
        }

        if (player._hitpoints == undefined) {
            return;
        }

        if ((player._hitpoints._currentLevel / player._hitpoints._level) < 0.5) {
            const ctx = new AudioContext();
            const gain = ctx.createGain();
            gain.gain.value = 0.1;
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
        }
    }

}