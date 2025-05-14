import { Highlite } from "./core/core";
import { HPAlert } from "./core/plugins/HPAlert";
import { VersionNotification } from "./core/plugins/VersionNotification";
import { RefreshWarning } from "./core/plugins/RefreshWarning";

// This instance self-inserts itself into document.highlite
const highlite = new Highlite();
highlite.pluginLoader.registerPlugin(VersionNotification);
highlite.pluginLoader.registerPlugin(HPAlert);
highlite.pluginLoader.registerPlugin(RefreshWarning);
highlite.start();