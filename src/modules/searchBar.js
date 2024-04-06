import { createElement } from './Utilities.js'

export default class searchBar {
    constructor(width) {
        searchBar.idIncrement()
        this.id = searchBar.id
        this.searchBar = this.createSearchBar(width)
        this.searchSuggestions = []
    }

    static id = 0

    static idIncrement() {
        return this.id++
    }

    createSearchBar(width) {
        const search = createElement('div', {
            classList: 'search',
            id: this.id,
            style: `width: ${width}px`,
        })

        search.append(
            createElement('div', {
                classList: 'search-bar-container',
            }),
            createElement('div', {
                classList: 'search-suggestions',
            })
        )

        const searchBarContainer = search.querySelector('.search-bar-container')
        searchBarContainer.append(
            createElement('span', {
                classList: 'material-symbols-rounded',
                textContent: 'search',
            }),
            createElement('input', {
                type: 'text',
                classList: 'search-bar',
                placeholder: 'Search Location',
                autocomplete: 'off',
                autocapitalize: 'on',
            }),
            createElement('span', {
                classList: 'search-clear material-symbols-rounded hidden',
                textContent: 'close',
            })
        )

        // Append event listeners
        this.addEventListeners(search)

        // Debugging
        // searchSuggestions.append(
        //     this.createSuggestionItem('Suggestion item 1'),
        //     this.createSuggestionItem('Suggestion item 2'),
        //     this.createSuggestionItem('Suggestion item 3')
        // )

        return search
    }

    addEventListeners(element) {
        const searchBar = element.querySelector(
            '.search-bar-container > .search-bar'
        )
        const searchClear = element.querySelector(
            '.search-bar-container > .search-clear'
        )

        searchBar.addEventListener('input', (e) => {
            // If search bar contains text, show clear button
            e.target.value !== ''
                ? searchClear.classList.remove('hidden')
                : searchClear.classList.add('hidden')

            // TODO: Add search API and append searchSuggestions with each wildcard match

            console.log(e.target.value)
        })

        searchClear.addEventListener('click', () => {
            searchBar.value = ''
            searchClear.classList.add('hidden')
        })
    }

    getSearchBar() {
        return this.searchBar
    }

    createSuggestionItem(content) {
        const item = createElement('div', { classList: 'suggestion-item' })
        item.append(
            createElement('span', {
                classList: 'material-symbols-rounded',
                textContent: 'search',
            }),
            createElement('span', {
                textContent: `${content}`,
            })
        )

        return item
    }
}
