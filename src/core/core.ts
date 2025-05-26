import { ContextMenuManager } from "./managers/game/contextMenuManager";
import { HookManager } from "./managers/highlite/hookManager";
import { NotificationManager } from "./managers/highlite/notificationManager";
import { PanelManager } from "./managers/highlite/panelManager";
import { PluginManager } from "./managers/highlite/pluginManger";
import { UIManager } from "./managers/highlite/uiManager";
import { SettingsManager } from "./managers/highlite/settingsManager";
import { DatabaseManager } from "./managers/highlite/databaseManager";
import { SoundManager } from "./managers/highlite/soundsManager";

export class Highlite {
    hookManager : HookManager;
    contextMenuManager : ContextMenuManager;
    notificationManager : NotificationManager;
    pluginManager : PluginManager;
    uiManager : UIManager;
    panelManager : PanelManager
    settingsManager : SettingsManager;
    databaseManager : DatabaseManager;
    soundManager : SoundManager;

    constructor() {
        console.info("[Highlite] Core Initializing!");

        document.highlite = {};
        document.highlite.managers = {};
        document.highlite.gameHooks = {};
        document.highlite.gameLookups = {};
        document.highlite.plugins = [];

        this.hookManager = new HookManager();
        this.contextMenuManager = new ContextMenuManager();
        this.notificationManager = new NotificationManager();
        this.pluginManager = new PluginManager();
        this.uiManager = new UIManager();
        this.panelManager = new PanelManager();
        this.soundManager = new SoundManager();
        this.settingsManager = new SettingsManager();
        this.databaseManager = new DatabaseManager();


        // Class Mappings
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
        this.hookManager.registerClass("DW", "PrivateChatMessageList");

        // Function Hook-ins
        this.hookManager.registerClassHook("GameLoop", "_update");
        this.hookManager.registerClassHook("GameLoop", "_draw");
        this.hookManager.registerClassHook("PrivateChatMessageList", "addChatMessage");
        this.hookManager.registerClassHook("SocketManager", "_loggedIn");
        this.hookManager.registerClassHook("SocketManager", "_handleLoggedOut");
        this.hookManager.registerClassHook("SocketManager", "_handleEnteredIdleStateAction");
        this.hookManager.registerClassHook("SocketManager", "_handleTradeRequestedPacket");
        this.hookManager.registerClassHook("EntityManager", "addOtherPlayer");
        this.hookManager.registerClassHook("HealthBar", "_updateCurrentHealthbarColor");
        this.hookManager.registerClassHook("ItemManager", "invokeInventoryAction");

        // Needs Naming
        this.hookManager.registerStaticClassHook('dG', 'handleTargetAction');
        this.hookManager.registerStaticClassHook('dG', 'getActionsAndEntitiesAtMousePointer');
        this.hookManager.registerClassHook("AF", "addItemToInventory");
        this.contextMenuManager.registerContextHook("vG", "_createInventoryItemContextMenuItems", this.contextMenuManager.inventoryContextHook);
        this.contextMenuManager.registerContextHook("vG", "_createGameWorldContextMenuItems", this.contextMenuManager.gameWorldContextHook);
        this.hookManager.registerStaticClassHook('dG', 'getActionsAndEntitiesAtMousePointer', this.contextMenuManager.ActionSorting);



        

        // Lookup Table Mappings
        document.highlite.gameLookups["GameWorldActions"] = document.client.get("VA");
        document.highlite.gameLookups["InventoryActions"] = document.client.get("QA");
    };

    async start() {
        console.info("[Highlite] Core Started!");
        await this.databaseManager.initDB();
        if (!this.databaseManager.database) {
            console.error("[Highlite] Database not initialized!");
            return;
        } else {
            console.info("[Highlite] Database initialized!");
        }
        await this.notificationManager.askNotificationPermission();
        this.settingsManager.init();
        await this.settingsManager.registerPlugins();
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
