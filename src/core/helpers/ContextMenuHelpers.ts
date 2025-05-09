export function AddEntityAction(actionName : string) : number {
    const ContextMenuActions = document.client.get('VA');
    
    if (ContextMenuActions[actionName] !== undefined) {
        return ContextMenuActions[actionName];
    }

    ContextMenuActions[ContextMenuActions[actionName] = (Object.keys(ContextMenuActions).length) / 2] = actionName;

    // Returns Entity Action Number;
    const actionNumber = (Object.keys(ContextMenuActions).length / 2) - 1
    return actionNumber;
}

export function AddInventoryItemAction(actionName: string) : number {
    const ContextMenuActions = document.client.get('QA');
    ContextMenuActions[ContextMenuActions[actionName] = (Object.keys(ContextMenuActions).length) / 2] = actionName;
    
    // Returns Entity Action Number;
    const actionNumber = (Object.keys(ContextMenuActions).length / 2) - 1
    return actionNumber;
} 