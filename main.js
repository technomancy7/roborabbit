const fs = require("fs");
//import { fs } from "fs";

const config = {
    "timeout": 1000
}

const scriptUrl = new URL(import.meta.url);
let path = scriptUrl.pathname;
const path2 = path.split("/");
path2.pop();
path = path2.join("/")

console.log('Client startup.');
console.log(`Running in ${path}`)

class Context {
    read_file(filename) {
        return fs.readFileSync(`${path}/${filename}`, "utf8");
    }
    write_cache(data) {
        fs.writeFileSync(`${path}/cache.json`, JSON.stringify(data))
    }

    read_cache() {
        return JSON.parse(fs.readFileSync(`${path}/cache.json`, "utf8"));
    }
}

const ctx = new Context();
setTimeout(async function(){
    const files = fs.readdirSync(`${path}/bots/`);

    for (const file of files) {
      // do something with the file, such as reading its contents
      const contents = JSON.parse(fs.readFileSync(`${path}/bots/${file}`, "utf8"));
      console.log(contents.trigger);
      const trigger = await import (`${path}/triggers/${contents.trigger.id}.js`)
      
      const payload = await trigger.isTriggered(ctx, contents.trigger.data);
      //console.log(payload);

      const action = await import (`${path}/actions/${contents.action.id}.js`)

      await action.activate(ctx, contents.action.data, payload)
    }

}, config.timeout);
