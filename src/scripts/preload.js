const { contextBridge, ipcRenderer } = require("electron");
const {Tagify} = require("@yaireo/tagify")


function callIpcRenderer(method, channel, ...args) {
  console.log("Arguments are: ", ...args);
  if (typeof channel !== "string" || !channel.startsWith("APP_")) {
    throw "Error: IPC channel name not allowed";
  }
  if (["invoke", "send"].includes(method)) {
    console.log("Received by right caller");
    return ipcRenderer[method](channel, ...args);
  }

  if ("on" === method) {
    const listener = args[0];
    if (!listener) throw "Listener must be provided";

    // Wrap the given listener in a new function to avoid exposing
    // the `event` arg to our renderer.
    const wrappedListener = (_event, ...a) => listener(...a);
    ipcRenderer.on(channel, wrappedListener);

    // The returned function must not return anything (and NOT
    // return the value from `removeListener()`) to avoid exposing ipcRenderer.
    return () => {
      ipcRenderer.removeListener(channel, wrappedListener);
    };
  }
}

contextBridge.exposeInMainWorld("myIpcRenderer", {
  invoke: (...args) => callIpcRenderer("invoke", ...args),
  send: (...args) => callIpcRenderer("send", ...args),
  on: (...args) => callIpcRenderer("on", ...args),
  import: () =>  require("@yaireo/tagify")
});
