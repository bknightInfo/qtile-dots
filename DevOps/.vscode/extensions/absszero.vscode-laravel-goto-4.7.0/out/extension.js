"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const HoverProvider_1 = require("./HoverProvider");
const Command_1 = require("./Command");
function activate(context) {
    const php = {
        language: "php",
        scheme: "file"
    };
    const hoverDispose = vscode.languages.registerHoverProvider(php, new HoverProvider_1.HoverProvider());
    context.subscriptions.push(hoverDispose);
    const commandDispose = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto', Command_1.default);
    context.subscriptions.push(commandDispose);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map