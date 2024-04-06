import searchBar from './searchBar.js'
import element from './Utilities.js'

export default class UI {
    constructor() {
        if (this instanceof UI) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static initApp() {
        console.log('UI: App initialising')
        UI.renderHome()
    }

    static initEventListeners() {
        return
    }

    static clear() {
        console.log('Clearing UI')
        document.getElementById('content').textContent = ''
    }

    static renderHome() {
        UI.clear()

        const content = document.getElementById('content')
        content.append(
            element('div', {
                classList: 'heading',
                textContent: 'Weather App',
            }),
            new searchBar(400).getSearchBar()
        )
    }
}
