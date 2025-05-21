import { ContextMenuManager } from "./managers/game/contextMenuManager";
import { HookManager } from "./managers/highlite/hookManager";
import { NotificationManager } from "./managers/highlite/notificationManager";
import { PluginManager } from "./managers/highlite/pluginManger";

export class Highlite {
    hookManager : HookManager;
    contextMenuHelper : ContextMenuManager;
    notificationManager : NotificationManager;
    pluginManager : PluginManager;

    constructor() {
        console.info("[Highlite] Core Initializing!");
        this.hookManager = new HookManager();
        this.contextMenuHelper = new ContextMenuManager();
        this.notificationManager = new NotificationManager();
        this.pluginManager = new PluginManager();

        document.highlite = {};
        document.highlite.Helpers = {};
        document.highlite.Helpers.ContextMenu = this.contextMenuHelper;
        document.highlite.gameHooks = {};
        document.highlite.gameHooks.Classes = {};
        document.highlite.gameHooks.Listeners = {};
        document.highlite.plugins = [];
        document.BABYLON = document.client.get("ro")

        this.hookManager.registerClass("Ck", "EntityManager");
        this.hookManager.registerClass("hN", "GroundItemManager");
        this.hookManager.registerClass("oF", "MeshManager");
        this.hookManager.registerClass("_F", "WorldMapManager");
        this.hookManager.registerClass("GR", "AtmosphereManager");
        this.hookManager.registerClass("sD", "WorldEntityManager");
        this.hookManager.registerClass("Iz", "SpellManager")
        this.hookManager.registerClass("Dk", "SpellMeshManager");
        this.hookManager.registerClass("wk", "GameLoop");
        this.hookManager.registerClass("$V", "ChatManager");
        this.hookManager.registerClass("Pz", "RangeManager");
        this.hookManager.registerClass("zz", "SocketManager");
        this.hookManager.registerClass("qz", "ItemManager");
        this.hookManager.registerClass("$z", "GameEngine");
        this.hookManager.registerClass("LF", "MainPlayer");
        this.hookManager.registerClass("tR", "GameCameraManager");
        this.hookManager.registerClass("RX", "HealthBar")
        this.hookManager.registerClass("AF", "AF"); // Unkown Name
        this.hookManager.registerClass("aG", "aG") // Unkown Name

        // Function Hook-ins
        this.hookManager.registerClassHook("GameLoop", "_update");
        this.hookManager.registerClassHook("GameLoop", "_draw");
        this.hookManager.registerClassHook("SocketManager", "_loggedIn");
        // this.hookManager.registerClassHook("SocketManager", "_loggedIn", this.postLogin);
        // this.hookManager.registerClassHook("SocketManager", "_handleLoggedOut", this.postLogout);
        this.hookManager.registerClassHook("SocketManager", "_handleLoggedOut");
        this.hookManager.registerClassHook("SocketManager", "_handleEnteredIdleStateAction");
        this.hookManager.registerClassHook("EntityManager", "addOtherPlayer");
        this.hookManager.registerClassHook("HealthBar", "_updateCurrentHealthbarColor");

        // Needs Naming
        this.hookManager.registerClassHook("AF", "addItemToInventory");
        this.contextMenuHelper.registerContextHook("vG", "_createInventoryItemContextMenuItems", this.contextMenuHelper.inventoryContextHook);
        this.contextMenuHelper.registerContextHook("vG", "_createGameWorldContextMenuItems", this.contextMenuHelper.gameWorldContextHook);
        this.hookManager.registerClassHook("ItemManager", "invokeInventoryAction");
        this.hookManager.registerStaticClassHook('dG', 'handleTargetAction');
    };

    start() {
        console.info("[Highlite] Core Started!");
        this.pluginManager.initAll();
        this.pluginManager.postInitAll();
        this.pluginManager.startAll();
    }

    stop() {
        console.info("[Highlite] Core Stopped!");
        this.pluginManager.stopAll();
    }

    reload() {
        console.info("[Highlite] Core Reloading");
        this.stop();
        this.start();
    }
}