import { describe, test } from "node:test";
import assert from "node:assert";
import { ConfigurationManager, type ConfigurationProvider } from "./../src/index.js";


await describe("ConfigurationManager", async () =>
{
    await describe("getConfig — direct key lookup", async () =>
    {
        await test("returns an existing numeric value", () =>
        {
            assert.strictEqual(ConfigurationManager.getConfig<number>("test"), 23);
        });

        await test("returns null when the stored value is explicitly null", () =>
        {
            assert.strictEqual(ConfigurationManager.getConfig("test1"), null);
        });

        await test("returns null when the key does not exist", () =>
        {
            assert.strictEqual(ConfigurationManager.getConfig("doesNotExist"), null);
        });

        await test("returns a string value", () =>
        {
            assert.strictEqual(ConfigurationManager.getConfig<string>("testValue"), "foo");
        });

        await test("reads package.json fields under the 'package' key", () =>
        {
            const pkg = ConfigurationManager.getConfig<{ name: string; version: string; description: string; }>("package")!;
            assert.ok(pkg);
            assert.strictEqual(pkg.name, "@nivinjoseph/n-config");
            assert.strictEqual(typeof pkg.version, "string");
            assert.strictEqual(typeof pkg.description, "string");
        });

        await test("trims whitespace from the lookup key", () =>
        {
            assert.strictEqual(ConfigurationManager.getConfig<number>("  test  "), 23);
        });

        await test("throws when the key is an empty string", () =>
        {
            assert.throws(() => ConfigurationManager.getConfig(""));
        });

        await test("throws when the key is whitespace only", () =>
        {
            assert.throws(() => ConfigurationManager.getConfig("   "));
        });

        await test("throws when the key is null", () =>
        {
            assert.throws(() => ConfigurationManager.getConfig(null as unknown as string));
        });
    });

    await describe("getConfig — wildcards", async () =>
    {
        await test("'*' returns an object with more than one entry", () =>
        {
            const value = ConfigurationManager.getConfig<Record<string, unknown>>("*")!;
            assert.ok(Object.keys(value).length > 1);
        });

        await test("'*' returns a deep copy — mutating the result does not affect the store", () =>
        {
            const snapshot = ConfigurationManager.getConfig<Record<string, unknown>>("*")!;
            snapshot["test"] = 999;
            assert.strictEqual(ConfigurationManager.getConfig<number>("test"), 23);
        });

        await test("'prefix*' returns keys starting with the prefix", () =>
        {
            const value = ConfigurationManager.getConfig<Record<string, unknown>>("test1*")!;
            assert.ok("test1" in value);
            assert.ok("test1Value" in value);
            // only keys starting with "test1" should be present
            for (const key of Object.keys(value))
                assert.ok(key.startsWith("test1"), `unexpected key: ${key}`);
        });

        await test("'*suffix' returns keys ending with the suffix", () =>
        {
            const value = ConfigurationManager.getConfig<Record<string, unknown>>("*Value")!;
            assert.ok("testValue" in value);
            assert.ok("test1Value" in value);
            for (const key of Object.keys(value))
                assert.ok(key.endsWith("Value"), `unexpected key: ${key}`);
        });

        await test("'*contains*' returns keys containing the substring", () =>
        {
            const value = ConfigurationManager.getConfig<Record<string, unknown>>("*test1*")!;
            assert.ok("test1" in value);
            assert.ok("test1Value" in value);
            for (const key of Object.keys(value))
                assert.ok(key.includes("test1"), `unexpected key: ${key}`);
        });

        await test("wildcard with no matches returns an empty object", () =>
        {
            const value = ConfigurationManager.getConfig<Record<string, unknown>>("zzzNoMatch*")!;
            assert.deepStrictEqual(value, {});
        });
    });

    await describe("requireConfig", async () =>
    {
        await test("returns the value when it exists", () =>
        {
            assert.strictEqual(ConfigurationManager.requireConfig("test"), 23);
        });

        await test("throws when the key does not exist", () =>
        {
            assert.throws(() => ConfigurationManager.requireConfig("doesNotExist"), /Required config/);
        });

        await test("throws when the value is null", () =>
        {
            assert.throws(() => ConfigurationManager.requireConfig("test1"), /Required config/);
        });

        await test("throws when the value is an empty string", () =>
        {
            assert.throws(() => ConfigurationManager.requireConfig("requireEmpty"), /Required config/);
        });

        await test("throws when the value is whitespace only", () =>
        {
            assert.throws(() => ConfigurationManager.requireConfig("requireWhitespace"), /Required config/);
        });
    });

    await describe("requireStringConfig", async () =>
    {
        await test("returns a string value", () =>
        {
            assert.strictEqual(ConfigurationManager.requireStringConfig("testValue"), "foo");
        });

        await test("throws when the key is missing", () =>
        {
            assert.throws(() => ConfigurationManager.requireStringConfig("doesNotExist"));
        });
    });

    await describe("requireNumberConfig", async () =>
    {
        await test("returns a numeric value", () =>
        {
            assert.strictEqual(ConfigurationManager.requireNumberConfig("test"), 23);
        });

        await test("parses a numeric string", () =>
        {
            assert.strictEqual(ConfigurationManager.requireNumberConfig("requireNumericStr"), 42);
        });

        await test("throws when the value is not numeric", () =>
        {
            assert.throws(() => ConfigurationManager.requireNumberConfig("testValue"), /Required number config/);
        });

        await test("throws when the key is missing", () =>
        {
            assert.throws(() => ConfigurationManager.requireNumberConfig("doesNotExist"));
        });
    });

    await describe("requireBooleanConfig", async () =>
    {
        await test("returns true for a true boolean value", () =>
        {
            assert.strictEqual(ConfigurationManager.requireBooleanConfig("requireTrue"), true);
        });

        await test("returns false for a false boolean value", () =>
        {
            assert.strictEqual(ConfigurationManager.requireBooleanConfig("requireFalse"), false);
        });

        await test("throws when the value is not a boolean", () =>
        {
            assert.throws(() => ConfigurationManager.requireBooleanConfig("testValue"), /Required boolean config/);
        });

        await test("throws when the key is missing", () =>
        {
            assert.throws(() => ConfigurationManager.requireBooleanConfig("doesNotExist"));
        });
    });

    // NOTE: initializeProviders mutates the shared module-level config, so these
    // tests run last. Provider keys use a "provided" prefix that does not
    // collide with the wildcard counts asserted above.
    await describe("initializeProviders", async () =>
    {
        await test("throws when given an empty array", async () =>
        {
            await assert.rejects(() => ConfigurationManager.initializeProviders([]));
        });

        await test("throws when given null", async () =>
        {
            await assert.rejects(() => ConfigurationManager.initializeProviders(null as unknown as Array<ConfigurationProvider>));
        });

        await test("merges values from a single provider into the config store", async () =>
        {
            const provider: ConfigurationProvider = {
                provide: () => Promise.resolve({ providedAlpha: "alphaValue" })
            };

            await ConfigurationManager.initializeProviders([provider]);

            assert.strictEqual(ConfigurationManager.getConfig<string>("providedAlpha"), "alphaValue");
        });

        await test("later providers override earlier providers on conflicting keys", async () =>
        {
            const first: ConfigurationProvider = {
                provide: () => Promise.resolve({ providedBeta: "first" })
            };
            const second: ConfigurationProvider = {
                provide: () => Promise.resolve({ providedBeta: "second" })
            };

            await ConfigurationManager.initializeProviders([first, second]);

            assert.strictEqual(ConfigurationManager.getConfig<string>("providedBeta"), "second");
        });
    });
});
