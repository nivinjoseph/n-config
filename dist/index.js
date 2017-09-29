"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("n-ext");
const n_defensive_1 = require("n-defensive");
// declare const fs: any;
// declare const path: any;
let config = {};
if (typeof window !== "undefined" && typeof document !== "undefined") {
    config = Object.assign(config, window.config);
}
else {
    // import * as fs from "fs";
    // import * as path from "path";
    let fs;
    let path;
    eval(`fs = require("fs");`);
    eval(`path = require("path");`);
    const filePath = path.join(process.cwd(), "config.json");
    if (fs.existsSync(filePath)) {
        const json = fs.readFileSync(filePath, "utf8");
        if (json != null && !json.isEmptyOrWhiteSpace())
            config = JSON.parse(json);
    }
    let args = process.argv;
    if (args.length > 2) {
        for (let i = 2; i < args.length; i++) {
            let arg = args[i].trim();
            if (!arg.contains("="))
                continue;
            let parts = arg.split("=");
            if (parts.length !== 2)
                continue;
            let key = parts[0].trim();
            let value = parts[1].trim();
            if (key.isEmptyOrWhiteSpace() || value.isEmptyOrWhiteSpace())
                continue;
            let boolVal = value.toLowerCase();
            if (boolVal === "true" || boolVal === "false") {
                config[key] = boolVal === "true";
                continue;
            }
            try {
                let numVal = value.contains(".") ? Number.parseFloat(value) : Number.parseInt(value);
                if (!Number.isNaN(numVal)) {
                    config[key] = numVal;
                    continue;
                }
            }
            catch (error) { }
            let strVal = value;
            config[key] = strVal;
        }
    }
}
class ConfigurationManager {
    constructor() { }
    static getConfig(key) {
        n_defensive_1.given(key, "key").ensureHasValue().ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        return config.getValue(key);
        // let value = config[key];
        // if (value === undefined || value == null)
        //     return null;
        // return value as T;
    }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=index.js.map