import { EntityType } from "../helpers/ContextMenuHelpers";
import { Plugin } from "../interfaces/plugin.class";
import { ActionState } from "../interfaces/game/actionStates.enum";
import { ContextMenuTypes } from "../interfaces/game/contextMenuTypes.enum";

export class Lookup extends Plugin {
    pluginName: string = "Lookup";

    
    lookupContextActionInventory: number = 0;
    lookupContextActionEntities: number = 0;

    init(): void {
        this.log("Initializing");
    }

    handleInventoryLookup(actionInfo: any, clickInfo: any): any {
        let item = actionInfo.getItem();
        window.open(`https://highspell.wiki/w/${(item.Def._nameCapitalized).replace(" ", "_")}`);
    }

    handlePlayerLookup(actionInfo: any, clickInfo: any): any {
        let player = actionInfo.getEntity();
        let playerName = player._name;
        window.open(`https://highspell.com/hiscores/player/${playerName}`);
    }

    handleWorldObjectLookup(actionInfo: any, clickInfo: any): any {
        let object = actionInfo.getEntity();
        let objectName = object._name;
        window.open(`https://highspell.wiki/w/${(objectName).replace(" ", "_")}`);
    }

    start(): void {
        document.highlite.Helpers.ContextMenu.AddInventoryItemMenuAction("Lookup", this.handleInventoryLookup, ActionState.Any, ContextMenuTypes.Any);
        document.highlite.Helpers.ContextMenu.AddGameWorldMenuAction("Lookup", this.handlePlayerLookup, EntityType.Player);
        document.highlite.Helpers.ContextMenu.AddGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.NPC);
        document.highlite.Helpers.ContextMenu.AddGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.WorldObject);
        document.highlite.Helpers.ContextMenu.AddGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.GroundItem);
    }

    stop(): void {
        document.highlite.Helpers.ContextMenu.RemoveInventoryItemMenuAction("Lookup", this.handleInventoryLookup, ActionState.Any, ContextMenuTypes.Any);
        document.highlite.Helpers.ContextMenu.RemoveGameWorldMenuAction("Lookup", this.handlePlayerLookup, EntityType.Player);
        document.highlite.Helpers.ContextMenu.RemoveGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.NPC);
        document.highlite.Helpers.ContextMenu.RemoveGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.WorldObject);
        document.highlite.Helpers.ContextMenu.RemoveGameWorldMenuAction("Lookup", this.handleWorldObjectLookup, EntityType.GroundItem);
    }
}