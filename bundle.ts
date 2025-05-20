const pJSON = require('./package.json');
const UserBannerStandalone = `// ==UserScript==\n\
// @name         Highlite Standalone Core\n\
// @namespace    Highlite\n\
// @version      ${pJSON.version}\n\
// @description  Rune-lite esque client for High Spell.\n\
// @author       KKonaOG\n\
// @match        https://highspell.com/game\n\
// @icon         https://www.google.com/s2/favicons?sz=64&domain=highspell.com\n\
// @run-at       document-start\n\
// ==/UserScript==`

await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: 'highliteCore.js',
    minify: true,
});

await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: 'highliteCoreStandalone.user.js',
    banner: UserBannerStandalone
})
