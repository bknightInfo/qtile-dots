"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProvider = void 0;
const vscode = require("vscode");
const Locator_1 = require("./Locator");
class HoverProvider {
    provideHover(document, position, token) {
        const range = new vscode.Range(position, position);
        return (0, Locator_1.locate)(document, range)
            .then(place => {
            if (undefined === place) {
                return;
            }
            (0, Locator_1.moveToSymbol)(place);
            let command = 'workbench.action.quickOpen';
            let arg = place.path;
            if (1 === place.uris.length) {
                command = 'vscode.open';
                arg = vscode.Uri.file(place.uris[0].path);
            }
            const args = encodeURIComponent(JSON.stringify([arg]));
            const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
            const contents = new vscode.MarkdownString(`[${place.path}](${commentCommandUri})`);
            contents.isTrusted = true;
            return new vscode.Hover(contents);
        });
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=HoverProvider.js.map