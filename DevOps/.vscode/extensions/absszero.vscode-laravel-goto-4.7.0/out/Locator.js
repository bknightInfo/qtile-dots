"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToSymbol = exports.getSelection = exports.locate = void 0;
const path_1 = require("path");
const vscode = require("vscode");
const Finder_1 = require("./Finder");
const MAX_RESULTS = 2;
const excludes = vscode.workspace.getConfiguration().get('laravelGoto.exclusion', null);
/**
 * locate files
 *
 * @var {[type]}
 */
function locate(document, range) {
    return __awaiter(this, void 0, void 0, function* () {
        const selection = getSelection(document, range, "<(\"'[,)>");
        if (!selection) {
            return undefined;
        }
        const finder = new Finder_1.Finder(document, selection);
        const place = finder.getPlace();
        if (place.path) {
            place.uris = yield vscode.workspace.findFiles('**/' + place.path, excludes, MAX_RESULTS);
        }
        return place;
    });
}
exports.locate = locate;
/**
 * get selection from cursor or first selection
 * @param selected
 */
function getSelection(document, selected, delimiters) {
    let start = selected.start;
    let end = selected.end;
    const line = document.lineAt(start);
    while (start.isAfter(line.range.start)) {
        let next = start.with({ character: start.character - 1 });
        let char = document.getText(new vscode.Range(next, start));
        if (-1 !== delimiters.indexOf(char)) {
            break;
        }
        start = next;
    }
    while (end.isBefore(line.range.end)) {
        let next = end.with({ character: end.character + 1 });
        let char = document.getText(new vscode.Range(end, next));
        if (-1 !== delimiters.indexOf(char)) {
            break;
        }
        end = next;
    }
    let range = new vscode.Range(start, end);
    if (range.isEqual(line.range)) {
        return undefined;
    }
    return range;
}
exports.getSelection = getSelection;
/**
 * go to the symbol in place after file is opened
 *
 * @param   {Place}  place  [place description]
 *
 * @return  {void}
 */
function moveToSymbol(place) {
    if (!place.location) {
        return;
    }
    const event = vscode.window.onDidChangeActiveTextEditor(e => {
        console.log(e === null || e === void 0 ? void 0 : e.document.fileName);
        if (undefined === e) {
            return;
        }
        if ((0, path_1.basename)(place.path) !== (0, path_1.basename)(e.document.uri.path)) {
            event.dispose();
            return;
        }
        event.dispose();
        // It's a controller method
        if ('@' === place.location[0]) {
            vscode.commands.executeCommand('workbench.action.quickOpen', place.location);
        }
        else {
            const range = locationRange(e.document, place.location);
            if (range) {
                e.selection = new vscode.Selection(range.start, range.end);
                e.revealRange(range);
            }
        }
    });
}
exports.moveToSymbol = moveToSymbol;
/**
 * return the range of location
 * @param doc
 * @param location
 */
function locationRange(doc, location) {
    const regx = new RegExp(location);
    const match = regx.exec(doc.getText());
    if (match) {
        return new vscode.Range(doc.positionAt(match.index), doc.positionAt(match.index + match[0].length));
    }
}
//# sourceMappingURL=Locator.js.map