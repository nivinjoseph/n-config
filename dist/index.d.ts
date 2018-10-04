import "@nivinjoseph/n-ext";
export declare abstract class ConfigurationManager {
    static readonly configObject: object;
    private constructor();
    static getConfig<T>(key: string): T;
}
