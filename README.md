## Description
This repo is to demenstrate the memory leaking beheavior when using NextJs [custom server](https://github.com/vercel/next.js/blob/canary/examples/custom-server/server.ts) with [dd-trace](https://github.com/DataDog/dd-trace-js) package.

## Install
```bash
npm install
npm run build
npm run start
```

## Run the app
`http://localhost:3000/demo`
`http://localhost:3000/demo2`

## Steps to reproduce
1. repeatly visit `/demo` and `/demo2` pages a couple times
2. generate the heap snapshot through Chrome inspect device
![](images/memory_leak.png?raw=true)
3. repeat step 1 and continue observe more `IncomingMessage` are generated 
![](images/spike.png?raw=true)
4. wait a couple more seconds and see some of them getting garbage collected but the remaining stay in the memory forever 
![](images/dip.png?raw=true)


## Temporary solution and fix
We found that it has something to do with dd-trace [async_resource](https://github.com/DataDog/dd-trace-js/blob/master/packages/datadog-core/src/storage/async_resource.js) is not working well with callback style Promise. In Next custom server, both `getServer` and `getServerRequestHandler` do use callback. https://github.com/vercel/next.js/blob/canary/packages/next/server/next.ts#L150-L180

Our solution is to patch the compiled `getServer` and `getServerRequestHandler` at `node_modules/next/dist/server/next.js` 
```javascript

    async getServer() {
        if (!this.serverPromise) {
            const conf = await this.loadConfig();
            if (conf.experimental.appDir) {
                process.env.NEXT_PREBUNDLED_REACT = "1";
                (0, _requireHook).overrideBuiltInReactPackages();
            }
            this.server = await this.createServer({
                ...this.options,
                conf
            });
            if (this.preparedAssetPrefix) {
                this.server.setAssetPrefix(this.preparedAssetPrefix);
            }
            this.serverPromise = this.server;
        }
        return this.serverPromise;
    }
    async getServerRequestHandler() {
        // Memoize request handler creation
        if (!this.reqHandlerPromise) {
            const server = await this.getServer();
            this.reqHandlerPromise = server.getRequestHandler().bind(server);
        }
        return this.reqHandlerPromise;
    }
```
with the fix
1. repeatly visit `/demo` and `/demo2` pages a couple times
2. generate the heap snapshot through Chrome inspect device. We would still see a couple `IncomingMessage`. 
![](images/fixed_rightafter.png?raw=true)
3. However, if you wait 2-3 seconds and regenerate the heap snapshot. All those `IncomingMessage` will be cleared out.
![](images/fixed_wait.png?raw=true)
