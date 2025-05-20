import { Highlite } from "./core/core";
import { HPAlert } from "./core/plugins/HPAlert";
import { IdleAlert } from "./core/plugins/IdleAlert";
import { VersionNotification } from "./core/plugins/VersionNotification";
import { Lookup } from "./core/plugins/Lookup";
import { Nameplates } from "./core/plugins/Nameplates";
import { RefreshWarning } from "./core/plugins/RefreshWarning";
import { EnhancedHPBars } from "./core/plugins/EnhancedHPBars";

// This instance self-inserts itself into document.highlite


// If in development mode, set a documnet variable to allow manual access to startHighlite() function, otherwise just run startHighlite()
if (process.env.NODE_ENV === 'development') {
    document.startHighlite = startHighlite;
}
// If in production mode, just run startHighlite()
else {
   await startHighlite();
}


async function startHighlite() {
    // Initialize the Highlite instance
    const highlite = new Highlite();

    highlite.pluginLoader.registerPlugin(VersionNotification);
    highlite.pluginLoader.registerPlugin(HPAlert);  
    highlite.pluginLoader.registerPlugin(IdleAlert);
    highlite.pluginLoader.registerPlugin(Lookup);
    highlite.pluginLoader.registerPlugin(Nameplates);
    highlite.pluginLoader.registerPlugin(RefreshWarning);
    highlite.pluginLoader.registerPlugin(EnhancedHPBars);

    // Start the highlite instance
    await highlite.start();
}
