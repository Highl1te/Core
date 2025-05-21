import { Plugin } from "../interfaces/plugin.class";
import { ActionState } from "../interfaces/game/actionStates.enum.ts";
import { NotificationHelper } from "../helpers/NotificationHelper.ts";
import { SettingsTypes } from "../interfaces/PluginSettings.ts";

export class IdleAlert extends Plugin {
    pluginName: string = "Idle Alert";

    ignoredStates: ActionState[] = [ActionState.BankingState, ActionState.ClimbSameMapLevelState, ActionState.GoThroughDoorState, ActionState.PlayerLoggingOutState, ActionState.PlayerDeadState, ActionState.StunnedState, ActionState.TradingState];
    actionState: number = ActionState.IdleState;
    idleTicks: number = 0;
    shouldTick: boolean = false;

    constructor() {
        super();
        this.settings.volume = {
            text: "Volume",
            type: SettingsTypes.range,
            value: 50,
            callback: () => { } //TODO 
        };
        this.settings.activationTicks = {
            text: "Activation Ticks",
            type: SettingsTypes.range,
            value: 0.5,
            callback: () => { } //TODO 
        };
        this.settings.notification = {
            text: "Notification",
            type: SettingsTypes.checkbox,
            value: false,
            callback: () => { } //TODO 
        };
    }


    init(): void {
        this.log("Initialized");
    }
    start(): void {
        this.log("Started");
    }
    stop(): void {
        this.log("Stopped");
    }

    GameLoop_update(...args: any) {
        if (!this.settings.enable.value) {
            return;
        }
        const player = this.gameHooks.Classes.EntityManager.Instance._mainPlayer;

        if (player === undefined) {
            return;
        }

        if (this.ignoredStates.includes(player._currentState.getCurrentState())) {
            return;
        }

        // If player moves we stop tracking ticks since they are no longer during an "AFK" action.
        if (player._isMoving && player._currentTarget == null && player._currentState.getCurrentState() == ActionState.IdleState) {
            this.shouldTick = false;
            this.actionState = ActionState.IdleState;
            return;
        } else {
            this.shouldTick = true;
        }

        // Updates system so we know we have been doing actions
        if (player._currentState.getCurrentState() !== ActionState.IdleState) {
            this.actionState = player._currentState.getCurrentState();
        }

        if (player._currentState.getCurrentState() == ActionState.IdleState && this.actionState !== ActionState.IdleState && player._currentTarget == null && this.shouldTick) {
            this.idleTicks++
        } else {
            this.idleTicks = 0;
        }

        if (this.idleTicks > (this.settings.activationTicks!.value as number)) {
            const ctx = new AudioContext();
            const gain = ctx.createGain();
            gain.gain.value = (this.settings.volume!.value as number) / 100;
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

            if (this.settings.notification?.value) {
                NotificationHelper.showNotification(`${player._name} is idle!`);
            }
            this.actionState = 0;
            this.idleTicks = 0;
        }
    }
}
