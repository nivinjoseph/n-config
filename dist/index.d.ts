import "@nivinjoseph/n-ext";
export declare abstract class ConfigurationManager {
    private constructor();
    static getConfig<T>(key: string): T;
}
