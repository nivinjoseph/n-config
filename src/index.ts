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
