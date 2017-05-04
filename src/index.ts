import * as fs from "fs";
import * as path from "path";
import "n-ext";


let config: {[index: string]: any} = {};
const filePath = path.join(process.cwd(), "config.json");

if (fs.existsSync(filePath))
{
    const json = fs.readFileSync(filePath, "utf8");
    if (json != null && !json.isEmptyOrWhiteSpace())
        config = JSON.parse(json);
}

let args = process.argv;
if (args.length > 2)
{
    for (let i = 2; i < args.length; i++)
    {
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
        if (boolVal === "true" || boolVal === "false")
        {
            config[key] = boolVal === "true";
            continue;
        }   
        
        try 
        {
            let numVal = value.contains(".") ? Number.parseFloat(value) : Number.parseInt(value);
            if (!Number.isNaN(numVal))
            {
                config[key] = numVal;
                continue;
            }
        }
        catch (error)
        { }
        
        let strVal = value;
        config[key] = strVal;
    }    
}    


export class ConfigurationManager
{
    private constructor() { }
    
    
    public static getConfig<T>(key: string): T
    {
        let value = config[key];
        if (value === undefined || value == null)
            return null;
        return value as T;
    }
}
