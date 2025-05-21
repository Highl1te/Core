import { Highlite } from "./core/core";
import { HPAlert } from "./plugins/HPAlert";
import { IdleAlert } from "./plugins/IdleAlert";
import { Lookup } from "./plugins/Lookup";
import { Nameplates } from "./plugins/Nameplates";
import { EnhancedHPBars } from "./plugins/EnhancedHPBars";
import { EnhancedLoginScreen } from "./plugins/EnhancedLoginScreen";

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

    // Start the highlite instance
    highlite.start();
});

