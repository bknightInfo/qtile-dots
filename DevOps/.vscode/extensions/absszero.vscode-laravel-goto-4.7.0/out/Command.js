"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Locator_1 = require("./Locator");
exports.default = (editor, edit, args) => {
    (0, Locator_1.locate)(editor.document, editor.selection)
        .then(place => {
        if (undefined === place) {
            return;
        }
        (0, Locator_1.moveToSymbol)(place);
        if (1 === place.uris.length) {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(place.uris[0].path));
            return;
        }
        vscode.commands.executeCommand('workbench.action.quickOpen', place.path);
    });
};
//# sourceMappingURL=Command.js.map