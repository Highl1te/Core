import { Highlite } from "./core/core";
import { HPAlert } from "./core/plugins/HPAlert";
import { IdleAlert } from "./core/plugins/IdleAlert";
import { PlayerLookup } from "./core/plugins/PlayerLookup";
import { VersionNotification } from "./core/plugins/VersionNotification";
import { WikiLookup } from "./core/plugins/WikiLookup";

// This instance self-inserts itself into document.highlite


// If in development mode, set a documnet variable to allow manual access to startHighlite() function, otherwise just run startHighlite()
if (process.env.NODE_ENV === 'development') {
    document.startHighlite = startHighlite;
}
// If in production mode, just run startHighlite()
else {
    startHighlite();
}


function startHighlite() {
    // Initialize the Highlite instance
    const highlite = new Highlite();

    highlite.pluginLoader.registerPlugin(VersionNotification);
    highlite.pluginLoader.registerPlugin(HPAlert);  
    highlite.pluginLoader.registerPlugin(IdleAlert);
    highlite.pluginLoader.registerPlugin(PlayerLookup);
    highlite.pluginLoader.registerPlugin(WikiLookup);

    // Start the highlite instance
    highlite.start();
}