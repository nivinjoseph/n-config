"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
require("n-ext");
var config = {};
var filePath = path.join(process.cwd(), "config.json");
if (fs.existsSync(filePath)) {
    var json = fs.readFileSync(filePath, "utf8");
    if (json != null && !json.isEmptyOrWhiteSpace())
        config = JSON.parse(json);
}
var ConfigurationManager = (function () {
    function ConfigurationManager() {
    }
    ConfigurationManager.getConfig = function (key) {
        var value = config[key];
        if (value === undefined || value == null)
            return null;
        return value;
    };
    return ConfigurationManager;
}());
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=index.js.map