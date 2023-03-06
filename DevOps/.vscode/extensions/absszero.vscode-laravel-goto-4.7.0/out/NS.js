"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Namespace = void 0;
const vscode = require("vscode");
class Namespace {
    constructor(document) {
        this.patterns = new Map([
            [/namespace\s*\(\s*(['"])\s*([^'"]+)\1/g, true],
            [/['\"]namespace['"]\s*=>\s*(['"])([^'"]+)\1/g, true],
            [/(controller)\s*\(\s*['"]?([^'")]+)/g, false],
            [/resource\s*\(\s*['"][^'"]+['"]\s*,\s*(['"]?)([^,'"]+)/g, false],
        ]);
        this.document = document;
        this.fullText = document.getText();
    }
    /**
     * find the namespace of the selection
     *
     * @param   {Block[]}  blocks  [blocks description]
     *
     * @return  {string}           [return description]
     */
    static find(blocks) {
        for (const block of blocks) {
            if (block.isNamespace) {
                return block.namespace;
            }
        }
        return '';
    }
    /**
     * get all closure blocks
     * @param selection
     */
    blocks(selection) {
        let match;
        let blocks = [];
        for (const pattern of this.patterns) {
            while ((match = pattern[0].exec(this.fullText)) !== null) {
                let start = this.document.positionAt(match.index);
                if (start.isAfter(selection.start)) {
                    continue;
                }
                let end = this.document.positionAt(this.getEndPosition(match.index));
                if (end.isBefore(selection.end)) {
                    continue;
                }
                blocks.push({
                    isNamespace: pattern[1],
                    namespace: match[2].trim().replace('::class', ''),
                    range: new vscode.Range(start, end)
                });
            }
        }
        return blocks.reverse();
    }
    /**
     * get the end position from the start position
     * @param start
     */
    getEndPosition(start) {
        let result = [];
        const length = this.fullText.length;
        while (length > start++) {
            if ('{' === this.fullText[start]) {
                result.push(start);
            }
            else if ('}' === this.fullText[start]) {
                result.pop();
                if (0 === result.length) {
                    return start;
                }
            }
        }
        return start;
    }
}
exports.Namespace = Namespace;
//# sourceMappingURL=NS.js.map