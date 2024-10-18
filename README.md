# lsd-stack-app

LSD Stack is an open-source software suite designed to promote the public good in the realm of staking and to fully unleash the power of decentralization. As a convention in web3 all API users interact with are directly from the RPC configured in wallet, so the app is a pure DApp.

## Setup Node.js env

1. Install Node.js >= v16
2. Install yarn via npm: `npm install --global yarn`
3. Enter project root directory then install all dependencies via terminal: `yarn`
4. Start app by: `yarn dev`

## Request to add new External Module

- Add a new enum type in: `interfaces/common.ts` `ModuleType`
- Add your module config here: `config/modular/index.ts` `externalModules`
- Config the networks that support your module here: `config/modular/index.ts` `supportList`

## Customize theme

You can change color config in `tailwind.config.js`, each color has light & dark versions(i.e text1 & text1Dark).

## Build and deploy

Run `yarn build` or `yarn build:dev` to build your app, the static files will be placed in `out` folder. Upload those files to any static web hosting services you like.

## Other resources

You can find more details here: [lsaas-docs](https://docs.stafi.io/lsaas/)
