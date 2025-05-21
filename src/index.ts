import { Highlite } from "./core/core";
import { HPAlert } from "./core/plugins/HPAlert";
import { IdleAlert } from "./core/plugins/IdleAlert";
import { VersionNotification } from "./core/plugins/VersionNotification";
import { Lookup } from "./core/plugins/Lookup";
import { Nameplates } from "./core/plugins/Nameplates";
import { RefreshWarning } from "./core/plugins/RefreshWarning";
import { EnhancedHPBars } from "./core/plugins/EnhancedHPBars";

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
waitForLoader().then(async () => {
    const highlite = new Highlite();

    highlite.pluginLoader.registerPlugin(VersionNotification);
    highlite.pluginLoader.registerPlugin(HPAlert);  
    highlite.pluginLoader.registerPlugin(IdleAlert);
    highlite.pluginLoader.registerPlugin(Lookup);
    highlite.pluginLoader.registerPlugin(Nameplates);
//    highlite.pluginLoader.registerPlugin(RefreshWarning);
    highlite.pluginLoader.registerPlugin(EnhancedHPBars);

    // Start the highlite instance
    await highlite.start();
});

