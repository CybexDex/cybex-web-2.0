# cybex-ex-2

> Cybex Ex Frontend 2.0

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at 127.0.0.1:8000
$ npm run dev             # test chain
$ npm run dev:prod        # production chain
$ npm run dev:prod:no_mdp # production chain + mdp data from http

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

## About Fonts

  Cybex use paid fonts `Avenir`, if you want to use it on your website, please buy the copyright or replace with other fonts in css.

  Icons are free to reuse.
  
## Depends on
- [cybexjs](https://github.com/CybexDex/cybexjs) 
- [cybexjs-ws](https://github.com/CybexDex/cybexjs-ws)

## UI Framework
- [vuetify](https://vuetifyjs.com)
   Material Design Component Framework
   built with [stylus](http://stylus-lang.com/)

## Third-party tools and plugins

 - [lodash](https://lodash.com/)
   A modern JavaScript utility library delivering modularity, performance & extras.
 - [moment](https://momentjs.com/)
   Parse, validate, manipulate, and display dates and times in JavaScript
 - [bignumber.js](https://github.com/MikeMcl/bignumber.js/)
   A JavaScript library for arbitrary-precision decimal and non-decimal arithmetic.
 - [vue2-filters](https://github.com/freearhey/vue2-filters#readme)
   A list of standard filters 
 - [vue2-perfect-scrollbar](https://github.com/mercs600/vue2-perfect-scrollbar#readme)
   Depends on [perfect-scrollbar](https://github.com/utatti/perfect-scrollbar), nice scroll bar.


## FAQ

- **How to change UI icons?**
  
  Import file `client/assets/fonts/icons/icomoon.json` to [Icomoon](https://icomoon.io/app/#/select)
  Update following

  `client/assets/fonts/icons/*`

  `client/assets/style/_fonts/_icons.styl`

  `client/assets/style/_fonts/_icons_variables.styl`

- **Why could not I see console.log?**
  
  Check config option `log_ignore`, set to false
