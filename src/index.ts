import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";


declare const APP_CONFIG: any;

let config: { [index: string]: any } = {};

const parseProcessDotEnv = () =>
{
    const obj = process.env || {};

    // we need to remove useless values from obj
    const uselessValue = "[object Object]";
    Object.keys(obj).forEach(t =>
    {
        if (obj[t] === uselessValue)
            delete obj[t];
    });
    // console.log("parseProcessDotEnv", JSON.stringify(obj));
    return obj;
};

const parseCommandLineArgs = () =>
{
    const obj: any = {};
    const args = process.argv;
    if (args.length <= 2)
        return obj;

    for (let i = 2; i < args.length; i++)
    {
        const arg = args[i].trim();

        if (!arg.contains("="))
            continue;

        const parts = arg.split("=");
        if (parts.length !== 2)
            continue;

        const key = parts[0].trim();
        const value = parts[1].trim();

        if (key.isEmptyOrWhiteSpace() || value.isEmptyOrWhiteSpace())
            continue;

        const boolVal = value.toLowerCase();
        if (boolVal === "true" || boolVal === "false")
        {
            obj[key] = boolVal === "true";
            continue;
        }

        try 
        {
            // const numVal = value.contains(".") ? Number.parseFloat(value) : Number.parseInt(value);
            // if (!Number.isNaN(numVal))
            // {
            //     obj[key] = numVal;
            //     continue;
            // }

            const parsed = +value;
            if (!isNaN(parsed) && isFinite(parsed))
            {
                obj[key] = parsed;
                continue;
            }
        }
        catch (error)
        { }

        const strVal = value;
        obj[key] = strVal;
    }
    // console.log("parseCommandLineArgs", JSON.stringify(obj));
    return obj;
};

if (typeof window !== "undefined" && typeof document !== "undefined")
{
    const conf = APP_CONFIG;
    if (conf && typeof (conf) === "object")
        config = Object.assign(config, conf);
    
    if ((<any>window).config != null && typeof((<any>window).config) === "string")
        config = Object.assign(config, JSON.parse((<string>(<any>window).config).hexDecode()));
}    
else
{    
    let fs: any;
    let path: any;
    /* tslint:disable */
    eval(`fs = require("fs");`);
    eval(`path = require("path");`);
    /* tslint:enable */
    
    
    const parsePackageDotJson = () =>
    {
        const packageDotJsonPath = path.resolve(process.cwd(), "package.json");
        const obj: any = {};
        if (!fs.existsSync(packageDotJsonPath))
            return obj;

        const json: string = fs.readFileSync(packageDotJsonPath, "utf8");
        if (json != null && !json.toString().isEmptyOrWhiteSpace())
        {
            const parsed = JSON.parse(json.toString());
            obj.package = {
                name: parsed.getValue("name"),
                description: parsed.getValue("description"),
                version: parsed.getValue("version")
            };
        }
        // console.log("parsePackageDotJson", JSON.stringify(obj));
        return obj;
    };
    
    const parseConfigDotJson = () =>
    {
        const configDotJsonPath = path.resolve(process.cwd(), "config.json");
        let obj: any = {};
        if (!fs.existsSync(configDotJsonPath))
            return obj;    
        
        const json: string = fs.readFileSync(configDotJsonPath, "utf8");
        if (json != null && !json.toString().isEmptyOrWhiteSpace())
            obj = JSON.parse(json.toString());
        // console.log("parseConfigDotJson", JSON.stringify(obj));
        return obj;
    };
    
    /* BORROWED FROM https://github.com/motdotla/dotenv/blob/master/lib/main.js
    * Parses a string or buffer into an object
    * @param {(string|Buffer)} src - source to be parsed
    * @returns {Object} keys and values from src
    */
    const parseDotEnv = () =>
    {
        const dotEnvPath: string = path.resolve(process.cwd(), ".env");
        const obj: any = {};
        if (!fs.existsSync(dotEnvPath))
            return obj;

        const src: string = fs.readFileSync(dotEnvPath, "utf8");
        src.toString().split("\n").forEach((line) =>
        {
            // matching "KEY' and 'VAL' in 'KEY=VAL'
            const keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
            // matched?
            if (keyValueArr != null)
            {
                const key = keyValueArr[1];

                // default undefined or missing values to empty string
                let value = keyValueArr[2] || "";

                // expand newlines in quoted values
                const len = value ? value.length : 0;
                if (len > 0 && value.charAt(0) === `"` && value.charAt(len - 1) === `"`)
                {
                    value = value.replace(/\\n/gm, "\n");
                }

                // remove any surrounding quotes and extra spaces
                value = value.replace(/(^['"]|['"]$)/g, "").trim();

                obj[key] = value;
            }
        });
        // console.log("parseDotEnv", JSON.stringify(obj));
        return obj;
    };
    
    const mergedConfig = Object.assign(config, parsePackageDotJson(), parseConfigDotJson()) as Object;
    
    [
        ...Object.entries(parseDotEnv()),
        ...Object.entries(parseProcessDotEnv()),
        ...Object.entries(parseCommandLineArgs())
    ].forEach((entry) => mergedConfig.setValue(entry[0], entry[1]));
    
    config = mergedConfig;
}


export abstract class ConfigurationManager
{
    private constructor() { }
    
    
    public static async initializeProviders(providers: ReadonlyArray<ConfigurationProvider>): Promise<void>
    {
        given(providers, "providers").ensureHasValue().ensureIsArray().ensure(t => t.isNotEmpty);
        
        const providedConfig = (await Promise.all(providers.map(t => t.provide())))
            .reduce((acc, t) => Object.assign(acc, t), {});
        
        [
            ...Object.entries(providedConfig),
            ...Object.entries(parseProcessDotEnv()),
            ...Object.entries(parseCommandLineArgs())
        ].forEach((entry) => config.setValue(entry[0], entry[1]));
    }
    
    public static getConfig<T>(key: string): T
    {
        given(key, "key").ensureHasValue().ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        
        return config.getValue(key);
    }
}

export interface ConfigurationProvider
{
    provide(): Promise<Object>;
}
