import { ActionState } from "../../interfaces/game/actionStates.enum";
import { ContextMenuTypes } from "../../interfaces/game/contextMenuTypes.enum";

export enum EntityType {
    Any = -1,
    WorldObject = 0,
    GroundItem = 1,
    NPC = 2,
    Player = 3,
    
}

export class ContextMenuManager {
    private static instance: ContextMenuManager;
    defaultActions = {};
    inventoryActions = {};
    gameWorldActions = {};
    spellActions = {};

    constructor() {
        if (ContextMenuManager.instance) {
            return ContextMenuManager.instance;
        }
        ContextMenuManager.instance = this;
        document.highlite.managers.ContextMenuManager = this;
    }

    AddDefaultMenuAction(actionName : string) : number {
        return -1;
    }

    AddInventoryItemMenuAction(actionName : string, handleFunction: Function,  actionState : ActionState = ActionState.Any, contextMenuType: ContextMenuTypes) : number {
        const ContextMenuActions = document.client.get('QA');

        let actionNumber = -1;
        if (ContextMenuActions[actionName] === undefined) {
            ContextMenuActions[ContextMenuActions[actionName] = (Object.keys(ContextMenuActions).length) / 2] = actionName;
            actionNumber = (Object.keys(ContextMenuActions).length / 2) - 1;
        } else {
            actionNumber = ContextMenuActions[actionName];
        }


        if (!this.inventoryActions[contextMenuType]) {
            this.inventoryActions[contextMenuType] = {};
        }

        if (!this.inventoryActions[contextMenuType][actionState]) {
            this.inventoryActions[contextMenuType][actionState] = {};
        }

        if (!this.inventoryActions[contextMenuType][actionState][actionName]) {
            this.inventoryActions[contextMenuType][actionState][actionName] = {actionNumber : actionNumber, handleFunctions: [handleFunction]};
        } else {
            this.inventoryActions[contextMenuType][actionState][actionName].handleFunctions.push(handleFunction);
        }

        return actionNumber;
    }

    AddGameWorldMenuAction(actionName : string, handleFunction : Function, entityType: EntityType = EntityType.Any) : number {
        const ContextMenuActions = document.client.get('VA');
    
        let actionNumber = -1;
        if (ContextMenuActions[actionName] === undefined) {
            ContextMenuActions[ContextMenuActions[actionName] = (Object.keys(ContextMenuActions).length) / 2] = actionName;
            actionNumber = (Object.keys(ContextMenuActions).length / 2) - 1;
        } else {
            actionNumber = ContextMenuActions[actionName];
        }

        if (!this.gameWorldActions[entityType]) {
            this.gameWorldActions[entityType] = {}
        }

        if (!this.gameWorldActions[entityType][actionName]) {
            this.gameWorldActions[entityType][actionName] = {actionNumber : actionNumber, handleFunctions: [handleFunction]}
        } else {
            this.gameWorldActions[entityType][actionName].handleFunctions.push(handleFunction);
        }

        return actionNumber;
    }

    RemoveGameWorldMenuAction(actionName : string, handleFunction : Function, entityType: EntityType = EntityType.Any) {
        if (this.gameWorldActions[entityType] && this.gameWorldActions[entityType][actionName]) {
            const actionInfo = this.gameWorldActions[entityType][actionName];
            const index = actionInfo.handleFunctions.indexOf(handleFunction);
            if (index > -1) {
                actionInfo.handleFunctions.splice(index, 1);
            }
        }

        // If no handle functions left, remove the action
        if (this.gameWorldActions[entityType] && this.gameWorldActions[entityType][actionName] && this.gameWorldActions[entityType][actionName].handleFunctions.length === 0) {
            delete this.gameWorldActions[entityType][actionName];
        }

        if (Object.keys(this.gameWorldActions[entityType]).length === 0) {
            delete this.gameWorldActions[entityType];
        }
        return true;
    }

    RemoveInventoryItemMenuAction(actionName : string, handleFunction : Function, actionState : ActionState = ActionState.Any, contextMenuType: ContextMenuTypes) {
        if (this.inventoryActions[contextMenuType] && this.inventoryActions[contextMenuType][actionState] && this.inventoryActions[contextMenuType][actionState][actionName]) {
            const actionInfo = this.inventoryActions[contextMenuType][actionState][actionName];
            const index = actionInfo.handleFunctions.indexOf(handleFunction);
            if (index > -1) {
                actionInfo.handleFunctions.splice(index, 1);
            }
        }
        
        // If no handle functions left, remove the action
        if (this.inventoryActions[contextMenuType] && this.inventoryActions[contextMenuType][actionState] && this.inventoryActions[contextMenuType][actionState][actionName] && this.inventoryActions[contextMenuType][actionState][actionName].handleFunctions.length === 0) {
            delete this.inventoryActions[contextMenuType][actionState][actionName];
        }

        if (Object.keys(this.inventoryActions[contextMenuType][actionState]).length === 0) {
            delete this.inventoryActions[contextMenuType][actionState];
        }
        return true;
    }
    



    AddSpellMenuAction(actionName : string) : number {
        return -1;
    }

    inventoryContextHook(inputArguments : any, actions : any, aG : any) : any {
        const e : any = inputArguments[0];
        const t : any = inputArguments[1];
        const i : any = inputArguments[2];
        const n : any = inputArguments[3];
        const r : any = inputArguments[4];
        const s : any = inputArguments[5];

        let output = actions;

        // Check if this.inventoryActions has key 'r'
        if (this.inventoryActions[r] !== undefined) {
            const contextMenuActionsContextSpecific = this.inventoryAction[r][ActionState.Any];
            if (contextMenuActionsContextSpecific) {
                for (const [actionName, actionInformation] of Object.entries(contextMenuActionsContextSpecific)) {
                    output.push(aG._contextMenuItemFactory.createInventoryItemContextMenuItem(this.inventoryActionHandler.bind(this, r, ActionState.Any), r, actionInformation.actionNumber, i, n, null, 0));
                }
            }
            
            const contextMenuActionsContextSpecificActionSpecific = this.inventoryAction[r][document.highlite.gameHooks.EntityManager.Instance._mainPlayer._currentState.getCurrentState()];
            if (contextMenuActionsContextSpecificActionSpecific) {
                for (const [actionName, actionInformation] of Object.entries(contextMenuActionsContextSpecificActionSpecific)) {
                    output.push(aG._contextMenuItemFactory.createInventoryItemContextMenuItem(this.inventoryActionHandler.bind(this, r, document.highlite.gameHooks.EntityManager.Instance._mainPlayer._currentState.getCurrentState()), r, actionInformation.actionNumber, i, n, null, 0));
                }
            }
        }

        // Check if this.inventoryActions has key 'ContextMenuTypes.Any'
        if (this.inventoryActions[ContextMenuTypes.Any] !== undefined) {
            const contextMenuActions = this.inventoryActions[ContextMenuTypes.Any][ActionState.Any];
            if (contextMenuActions) {
                for (const [actionName, actionInformation] of Object.entries(contextMenuActions)) {
                    output.push(aG._contextMenuItemFactory.createInventoryItemContextMenuItem(this.inventoryActionHandler.bind(this, ContextMenuTypes.Any, ActionState.Any), r, actionInformation.actionNumber, i, n, null, 0));
                }
            }

            const contextMenuActionsActionSpecific = this.inventoryActions[ContextMenuTypes.Any][document.highlite.gameHooks.EntityManager.Instance._mainPlayer._currentState.getCurrentState()];
            if (contextMenuActionsActionSpecific) {
                for (const [actionName, actionInformation] of Object.entries(contextMenuActionsActionSpecific)) {
                    output.push(aG._contextMenuItemFactory.createInventoryItemContextMenuItem(this.inventoryActionHandler.bind(this, ContextMenuTypes.Any, document.highlite.gameHooks.EntityManager.Instance._mainPlayer._currentState.getCurrentState()), r, actionInformation.actionNumber, i, n, null, 0));
                }
            }
        }

        return output;
    }

    gameWorldContextHook(e, i, vG) : any {
        const cG = e[0]
        const actionsAndEntities = cG._actionsAndEntities

        // Find 'unique' enities (where actionsAndEntities._entity is unique)
        const uniqueEntities = []
        for (const actionInformation of Object.entries(actionsAndEntities)) {
            if (actionInformation[1]._entity != null && !uniqueEntities.includes(actionInformation[1]._entity)) {
                uniqueEntities.push(actionInformation[1]._entity);
            }
        }


        let outputs = i;
        // Now we 'create' actions as needed
        for (const entity of uniqueEntities) {
            const contextMenuActionsSpecific = this.gameWorldActions[entity._entityType];
            if (contextMenuActionsSpecific) {
                for (const [actionName, actionInfo] of Object.entries(contextMenuActionsSpecific)) {
                    // TODO: Figure out if we ever need these nulls
                    outputs.push(vG._contextMenuItemFactory.createGameWorldContextMenuItem(actionInfo.actionNumber, this.worldObjectActionHandler.bind(this, entity._entityType), entity, null, null, null));                    
                }
            }
            

            // EntityType.Any
            const contextMenuActionsAny = this.gameWorldActions[EntityType.Any];
            if (contextMenuActionsAny) {
                for (const [actionName, actionInfo] of Object.entries(contextMenuActionsAny)) {
                    // TODO: Figure out if we ever need these nulls
                    outputs.push(vG._contextMenuItemFactory.createGameWorldContextMenuItem(actionInfo.actionNumber, this.worldObjectActionHandler.bind(this, EntityType.Any), entity, null, null, null));
                }
            }
        }


        return outputs;
    }

    inventoryActionHandler(contextType, actionState, e, i : any) {
        let actionNumber = e.getItemAction();

        const inventoryActions = this.inventoryActions[contextType][actionState];
        if (inventoryActions) {
            for (const [actionName, actionInformation] of Object.entries(inventoryActions)) {
                if (actionInformation.actionNumber == actionNumber) {
                    for (const handleFunction of actionInformation.handleFunctions) {
                        handleFunction(e, i);
                    }
                }
            }
        }
    }

    worldObjectActionHandler(entityType, e, i) {
        // Loop over all the EntityTypes to find the actionNumber
        const entityActions = this.gameWorldActions[entityType];
        if (entityActions) {
            for (const [actionName, actionInformation] of Object.entries(entityActions)) {
                if (actionInformation.actionNumber == e.Action) {
                    for (const handleFunction of actionInformation.handleFunctions) {
                        handleFunction(e, i);
                    }
                }
            }
        }
    }

    registerContextHook(sourceClass : string, fnName : string, hookFn : Function) : boolean {
        const self = this;
        const classObject = document.client.get(sourceClass).prototype;

        (function (originalFunction : any) {
            classObject[fnName] = function (...args : Array<unknown>) {
                const originalReturn = originalFunction.apply(this, arguments);
                return hookFn.apply(self, [args, originalReturn, this]);
            }
        }(classObject[fnName]));

        return true;
    }
}