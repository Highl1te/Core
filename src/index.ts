import { Highlite } from "./core/core";
import { HPAlert } from "./plugins/HPAlert";
import { IdleAlert } from "./plugins/IdleAlert/IdleAlert";
import { Lookup } from "./plugins/Lookup";
import { Nameplates } from "./plugins/Nameplates";
import { EnhancedHPBars } from "./plugins/EnhancedHPBars";
import { EnhancedLoginScreen } from "./plugins/EnhancedLoginScreen";
import { ContextMenuOptions } from "./plugins/ContextMenuOptions";
import { TradeAlerts } from "./plugins/TradeAlerts";
import { PMAlerts } from "./plugins/PMAlerts";
import { CoinCounter } from "./plugins/CoinCounter";
import { ExperienceTracker } from "./plugins/ExperienceTracker";

// Wait for document.client to be defined from the HighSpell client
const waitForLoader = () => {
    return new Promise((resolve) => {
        const checkClient = () => {
            if (document.client) {
                resolve(true);
            } else {
                setTimeout(checkClient, 100);
            }
        };
        checkClient();
    });
};

// This waitForLoader self-inserts itself into document.highlite
waitForLoader().then(() => {
    const highlite = new Highlite();

    highlite.pluginManager.registerPlugin(HPAlert);  
    highlite.pluginManager.registerPlugin(IdleAlert);
    highlite.pluginManager.registerPlugin(Lookup);
    highlite.pluginManager.registerPlugin(Nameplates);
    highlite.pluginManager.registerPlugin(EnhancedHPBars);
    highlite.pluginManager.registerPlugin(EnhancedLoginScreen);
    highlite.pluginManager.registerPlugin(ContextMenuOptions);
    highlite.pluginManager.registerPlugin(TradeAlerts);
    highlite.pluginManager.registerPlugin(PMAlerts);
    highlite.pluginManager.registerPlugin(CoinCounter);
    highlite.pluginManager.registerPlugin(ExperienceTracker);

    // Start the highlite instance
    highlite.start();
});

