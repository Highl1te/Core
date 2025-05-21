import { EntityType } from "../core/managers/game/contextMenuManager";
import { Plugin } from "../core/interfaces/highlite/plugin/plugin.class";
import { ActionState } from "../core/interfaces/game/actionStates.enum";
import { ContextMenuTypes } from "../core/interfaces/game/contextMenuTypes.enum";

export class Lookup extends Plugin {
    pluginName: string = "Lookup";

    lookupContextActionInventory : number = 0;
    lookupContextActionEntities : number = 0;

    init(): void {
        this.log("Initializing");
    }

    handleInventoryLookup(actionInfo : any, clickInfo : any) : any {
        let item = actionInfo.getItem();
        window.open(`https://highspell.wiki/w/${(item.Def._nameCapitalized).replace(" ", "_")}`);
    }

    handlePlayerLookup(actionInfo : any, clickInfo : any) : any {
        let player = actionInfo.getEntity();
        let playerName = player._name;
        window.open(`https://highspell.com/hiscores/player/${playerName}`);
    }

    handleWorldObjectLookup(actionInfo : any, clickInfo : any) : any {
        let object = actionInfo.getEntity();
        let objectName = object._name;
        window.open(`https://highspell.wiki/w/${(objectName).replace(" ", "_")}`);
    }

    start(): void {
        document.highlite.managers.ContextMenuManager.AddInventoryItemMenuAction("Lookup", this.handleInventoryLookup, ActionState.Any, ContextMenuTypes.Any);
        document.highlite.managers.ContextMenuManager.AddGameWorldMenuAction("Lookup", this.handlePlayerLookup, EntityType.Player);
        document.highlite.managers.ContextMenuManager.AddGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.NPC);
        document.highlite.managers.ContextMenuManager.AddGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.WorldObject);
        document.highlite.managers.ContextMenuManager.AddGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.GroundItem);
    }

    stop(): void {
        document.highlite.managers.ContextMenuManager.RemoveInventoryItemMenuAction("Lookup", this.handleInventoryLookup, ActionState.Any, ContextMenuTypes.Any);
        document.highlite.managers.ContextMenuManager.RemoveGameWorldMenuAction("Lookup", this.handlePlayerLookup, EntityType.Player);
        document.highlite.managers.ContextMenuManager.RemoveGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.NPC);
        document.highlite.managers.ContextMenuManager.RemoveGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.WorldObject);
        document.highlite.managers.ContextMenuManager.RemoveGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.GroundItem);
    }
}