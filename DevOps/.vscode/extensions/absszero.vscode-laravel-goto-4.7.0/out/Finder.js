"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Finder = void 0;
const vscode = require("vscode");
const NS_1 = require("./NS");
const Locator_1 = require("./Locator");
class Finder {
    constructor(document, selection) {
        this.document = document;
        this.selection = selection;
        this.path = document.getText(selection).trim();
        this.line = document.getText(document.lineAt(selection.start).range);
        this.blocks = (new NS_1.Namespace(document)).blocks(selection);
    }
    /**
     * get place by selection
     * @param selection
     */
    getPlace() {
        let places = [
            this.pathHelperPlace,
            this.controllerPlace,
            this.configPlace,
            this.langPlace,
            this.envPlace,
            this.namespacePlace,
            this.staticPlace,
            this.inertiajsPlace,
            this.livewirePlace,
        ];
        let place = { path: '', location: '', uris: [] };
        for (let i = 0; i < places.length; i++) {
            place = places[i].call(this, place);
            if (place.path) {
                return place;
            }
        }
        place = this.viewPlace(place);
        return place;
    }
    /**
    * get path helper place
    */
    pathHelperPlace(place) {
        const pattern = /([\w^_]+)_path\(\s*(['"])([^'"]*)\2/;
        const match = pattern.exec(this.line);
        if ((Boolean)(match && match[3] === this.path)) {
            let prefix = match[1] + '/';
            if ('base/' === prefix) {
                prefix = '';
            }
            else if ('resource/' === prefix) {
                prefix = 'resources/';
            }
            place.path = prefix + this.path;
            return place;
        }
        return place;
    }
    /**
     * get view place
     *
     */
    viewPlace(place) {
        const componentPattern = /<\/?x-([^\/>]*)/;
        const isComponent = componentPattern.exec(this.line);
        if (isComponent) {
            this.path = isComponent[1].trim();
        }
        let split = this.path.split(':');
        let vendor = '';
        // namespace or vendor
        if (3 === split.length) {
            // it's vendor
            if (split[0] === split[0].toLowerCase()) {
                vendor = split[0] + '/';
            }
        }
        place.path = split[split.length - 1];
        place.path = vendor + place.path.replace(/\./g, '/');
        // a component can be a class or blade view file
        if (isComponent) {
            place.path += '.php';
        }
        else {
            place.path += '.blade.php';
        }
        return place;
    }
    /**
     * get controller place
     *
     */
    controllerPlace(place) {
        const controllerNotInPath = (-1 === this.path.indexOf('Controller'));
        if (0 === this.blocks.length && controllerNotInPath) {
            return place;
        }
        place.path = this.path;
        place = this.setControllerAction(place);
        place = this.setControllerNamespace(place);
        place.path = place.path
            .replace('::class', '')
            .replace(/\\/g, '/') + '.php';
        return place;
    }
    /**
     * get config place
     */
    configPlace(place) {
        const patterns = [
            /Config::[^'"]*(['"])([^'"]*)\1/,
            /config\([^'"]*(['"])([^'"]*)\1/g
        ];
        for (const pattern of patterns) {
            let match;
            do {
                match = pattern.exec(this.line);
                if (match && match[2] === this.path) {
                    let split = this.path.split('.');
                    place.path = 'config/' + split[0] + '.php';
                    if (2 <= split.length) {
                        place.location = "(['\"]{1})" + split[1] + "\\1\\s*=>";
                    }
                    return place;
                }
            } while (match);
        }
        return place;
    }
    /**
     * get language place
     *
     */
    langPlace(place) {
        const patterns = [
            /__\([^'"]*(['"])([^'"]*)\1/,
            /@lang\([^'"]*(['"])([^'"]*)\1/,
            /trans\([^'"]*(['"])([^'"]*)\1/,
            /trans_choice\([^'"]*(['"])([^'"]*)\1/,
        ];
        for (const pattern of patterns) {
            let match = pattern.exec(this.line);
            if (match && match[2] === this.path) {
                let split = this.path.split(':');
                let vendor = (3 === split.length) ? `/vendor/${split[0]}` : '';
                let keys = split[split.length - 1].split('.');
                place.path = `lang${vendor}/${keys[0]}.php`;
                if (2 <= keys.length) {
                    place.location = "(['\"]{1})" + keys[1] + "\\1\\s*=>";
                }
                return place;
            }
        }
        return place;
    }
    /**
     * get env place
     */
    envPlace(place) {
        const pattern = /env\(\s*(['"])([^'"]*)\1/;
        const match = pattern.exec(this.line);
        if ((Boolean)(match && match[2] === this.path)) {
            place.location = this.path;
            place.path = '.env';
        }
        return place;
    }
    /**
     * get static place
     */
    staticPlace(place) {
        const split = this.path.split('.');
        const ext = split[split.length - 1].toLocaleLowerCase();
        let extensions = vscode.workspace.getConfiguration().get('laravelGoto.staticFileExtensions', []);
        extensions = extensions.map(ext => ext.toLowerCase());
        if (-1 !== extensions.indexOf(ext)) {
            let split = this.path.split('/');
            split = split.filter(d => (d !== '..' && d !== '.'));
            place.path = split.join('/');
        }
        return place;
    }
    /**
     * get Inertia.js place
     */
    inertiajsPlace(place) {
        const patterns = [
            /Route::inertia\s*\([^,]+,\s*['"]([^'"]+)/,
            /Inertia::render\s*\(\s*['"]([^'"]+)/,
            /inertia\s*\(\s*['"]([^'"]+)/,
        ];
        for (const pattern of patterns) {
            let match = pattern.exec(this.line);
            if ((Boolean)(match && match[1] === this.path)) {
                place.path = this.path;
                return place;
            }
        }
        return place;
    }
    /**
     * get Livewire place
     */
    livewirePlace(place) {
        const patterns = [
            /livewire:([^ ]+)/,
            /@livewire\s*\(\s*['"]([^"']+)/,
        ];
        const snakeToCamel = (str) => str.toLowerCase()
            .replace(/([-_.][a-z])/g, group => group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
            .replace('.', '/'));
        for (const pattern of patterns) {
            let match = pattern.exec(this.line);
            if (null === match) {
                continue;
            }
            if ((Boolean)(match && this.path.includes(match[1]))) {
                place.path = snakeToCamel(match[1]);
                place.path = place.path.charAt(0).toUpperCase() + place.path.slice(1) + '.php';
                return place;
            }
        }
        return place;
    }
    /**
     * get namespace place
     */
    namespacePlace(place) {
        const pattern = /([A-Z][\w]+[\\])+[A-Z][\w]+/;
        const match = pattern.exec(this.path);
        if (match) {
            place.path = this.path + '.php';
        }
        console.log(place.path);
        return place;
    }
    /**
     * set controller action
     *
     * @param place
     */
    setControllerAction(place) {
        if (-1 !== place.path.indexOf('@')) {
            let split = place.path.split('@');
            place.path = split[0];
            place.location = '@' + split[1];
        }
        else if (place.path.endsWith('::class')) {
            let action = (0, Locator_1.getSelection)(this.document, this.selection, "[]");
            if (action) {
                // HiController, 'index' => index
                place.location = '@' + this.document
                    .getText(action)
                    .split(',')[1]
                    .replace(/['"]+/g, '')
                    .trim();
            }
        }
        else if (this.blocks.length && !this.blocks[0].isNamespace) { // resource or controller route
            place.path = this.blocks[0].namespace;
            if (place.path !== this.path) {
                place.location = '@' + this.path;
            }
        }
        return place;
    }
    /**
     * set controller namespace
     *
     * @param   {Place}  place  [place description]
     *
     * @return  {Place}         [return description]
     */
    setControllerNamespace(place) {
        // group namespace
        const isClass = place.path.endsWith('::class');
        if ('\\' !== place.path[0] || isClass) {
            if ('\\' === place.path[0]) {
                place.path = place.path.substring(1);
            }
            let namespace = NS_1.Namespace.find(this.blocks);
            if (namespace) {
                place.path = namespace + '/' + place.path;
            }
        }
        return place;
    }
}
exports.Finder = Finder;
//# sourceMappingURL=Finder.js.map