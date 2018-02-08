import "n-ext";
import { given } from "n-defensive";


let config: { [index: string]: any } = {};

if (typeof window !== "undefined" && typeof document !== "undefined")
{
    config = Object.assign(config, (<any>window).config);
}    
else
{    
    let fs: any;
    let path: any;
    
    eval(`fs = require("fs");`);
    eval(`path = require("path");`);
    
    
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
            obj.appInfo = {
                name: parsed.getValue("name"),
                description: parsed.getValue("description"),
                version: parsed.getValue("version")
            };
        }

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
                if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"')
                {
                    value = value.replace(/\\n/gm, "\n");
                }

                // remove any surrounding quotes and extra spaces
                value = value.replace(/(^['"]|['"]$)/g, "").trim();

                obj[key] = value;
            }
        });

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
        
        return obj;
    };
    
    const parseProcessDotEnv = () =>
    {
        return process.env || {};
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
                const numVal = value.contains(".") ? Number.parseFloat(value) : Number.parseInt(value);
                if (!Number.isNaN(numVal))
                {
                    obj[key] = numVal;
                    continue;
                }
            }
            catch (error)
            { }

            const strVal = value;
            obj[key] = strVal;
        }
    };
    
    
    config = Object.assign(config, parsePackageDotJson(), parseDotEnv(), parseConfigDotJson(),
        parseProcessDotEnv(), parseCommandLineArgs());
}


export abstract class ConfigurationManager
{
    private constructor() { }
    
    
    public static getConfig<T>(key: string): T
    {
        given(key, "key").ensureHasValue().ensureIsString().ensure(t => !t.isEmptyOrWhiteSpace());
        
        return config.getValue(key);
    }
}
