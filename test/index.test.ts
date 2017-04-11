import * as assert from "assert";
import { ConfigurationManager } from "./../src/index";

suite("Basic tests", () =>
{
    test("when reading existing value, value should be returned", () =>
    {
        let value = ConfigurationManager.getConfig<number>("test");
        assert.strictEqual(value, 23);
    });
    
    test("when reading null value, null should be returned", () =>
    {
        let value = ConfigurationManager.getConfig("test1");
        assert.strictEqual(value, null);
    });
    
    test("when reading non-existing (undefined) value, null should be returned", () =>
    {
        let value = ConfigurationManager.getConfig("test2");
        assert.strictEqual(value, null);
    });
});