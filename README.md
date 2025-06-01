# HighLite Core

HighLite Core is responsible for hooking into the game client and providing a landscape for plugins to execute.


# Development
## Software Requirements
- NodeJS v22 LTS (https://nodejs.org/en/download)
- Yarn (`npm install --global corepack`)

## Building
`yarn core:dist`

## Testing
- Clone HighLite Desktop (https://github.com/Highl1te/HighliteDesktop)
- Modify HighLite Desktop -> `generatePage.js` to no longer load remote HighLite Core
    - Remove [Reference](https://github.com/Highl1te/HighliteDesktop/blob/097f959f34890fbb3c1096765ee45e87aab195b4/src/loader/generatePage.js#L176)
- Modify HighLite Desktop -> `index.html` to load local script
  - Look for [Reference](https://github.com/Highl1te/HighliteDesktop/blob/097f959f34890fbb3c1096765ee45e87aab195b4/src/index.html#L9)
  - Add `<script type="module" src="./highliteCore.js"></script>`
- The above steps only need to be completed once.
- Copy `highliteCore.js` and `highliteCore.js.map` into the HighLite Desktop `src` folder
- Run `yarn start`
- Load Web Dev Tools via F12
- Enjoy Debugging
