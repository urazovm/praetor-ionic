cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/ch.ti8m.documenthandler/www/DocumentHandler.js",
        "id": "ch.ti8m.documenthandler.DocumentHandler",
        "clobbers": [
            "handleDocumentWithURL"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "ch.ti8m.documenthandler": "0.2.1"
}
// BOTTOM OF METADATA
});