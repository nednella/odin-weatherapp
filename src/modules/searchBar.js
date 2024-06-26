import { createElement } from './Utilities.js'
import API from './API.js'
import UI from './UI.js'

export default class searchBar {
    // Init private class constructor variables
    #searchComponent
    #searchBar
    #searchClear
    #searchSuggestions

    constructor(width) {
        this.#searchComponent = this.createSearchBar(width)
        this.#searchBar = this.#searchComponent.querySelector('.search-bar')
        this.#searchClear = this.#searchComponent.querySelector('.search-clear')
        this.#searchSuggestions = this.#searchComponent.querySelector('.search-suggestions')
        this.#initEventListeners()
    }

    // TODO: Add a 'use your current location' search suggestion

    #debounce(func, timeout) {
        let timer
        return () => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                func.apply()
            }, timeout)
        }
    }

    #debounceNearestMatches = this.#debounce(() => {
        // Debounce nearestMatch API (triggered by search bar input) to avoid API call spam
        if (this.#searchBar.value !== '') this.#getNearestMatches() // API call
    }, 300)

    #initEventListeners() {
        this.#searchBar.addEventListener('input', () => this.#handleSearchInput())
        this.#searchBar.addEventListener('keydown', (e) => this.#handleSearchSubmit(e))
        this.#searchClear.addEventListener('click', () => this.#handleSearchClear())
        this.#searchSuggestions.addEventListener('click', (e) =>
            this.#handleSearchSuggestionClick(e)
        )
    }

    #searchComponentState(arg) {
        arg == 'active'
            ? this.#searchComponent.classList.add('active')
            : this.#searchComponent.classList.remove('active')
    }

    #clearButtonState(arg) {
        arg == 'active'
            ? this.#searchClear.classList.add('active')
            : this.#searchClear.classList.remove('active')
    }

    #searchSuggestionState(arg) {
        arg == 'active'
            ? this.#searchSuggestions.classList.add('active')
            : this.#searchSuggestions.classList.remove('active')
    }

    #handleSearchInput() {
        if (this.#searchBar.value !== '') {
            this.#clearButtonState('active')
            this.#searchComponentState('active')
            this.#searchSuggestionState('active')
            this.#appendSuggestions()
        } else {
            this.#handleSearchClear()
        }
    }

    #handleSearchSubmit(event) {
        if (this.#searchBar.value !== '' && event.key == 'Enter') {
            UI.handleSearch(this.#searchBar.value)
            this.#handleSearchClear()
        }
    }

    #handleSearchSuggestionClick(e) {
        const clickedElement = e.target.children[1].textContent
        UI.handleSearch(clickedElement)
        this.#handleSearchClear()
        this.#searchBar.focus()
    }

    #handleSearchClear() {
        this.#searchBar.value = ''
        this.#clearButtonState('inactive')
        this.#searchComponentState('inactive')
        this.#searchSuggestionState('inactive')
    }

    #appendSuggestions() {
        this.#searchSuggestions.textContent = ''

        // Append current search query
        this.#searchSuggestions.appendChild(this.#createSuggestionItem(this.#searchBar.value))

        // Fetch nearest matches
        this.#debounceNearestMatches()
    }

    async #getNearestMatches() {
        const results = await API.nearestMatch(this.#searchBar.value)
        this.#handleNearestMatches(results)
    }

    #handleNearestMatches(nearestMatches) {
        nearestMatches.forEach((result, index) => {
            // Up to a maximum of 10 matches
            if (index < 10) {
                let suggestion
                !result.region || result.region === result.name
                    ? (suggestion = result.name + ', ' + result.country)
                    : (suggestion = result.name + ', ' + result.region + ', ' + result.country)

                this.#searchSuggestions.appendChild(this.#createSuggestionItem(suggestion))
            }
        })
    }

    #createSuggestionItem(content) {
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

    createSearchBar(width) {
        const search = createElement('div', {
            classList: 'search',
            style: `width: ${width}; min-width: 220px; max-width: 600px;`,
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
                spellcheck: false,
            }),
            createElement('span', {
                classList: 'search-clear material-symbols-rounded hidden',
                textContent: 'close',
            })
        )

        return search
    }

    getSearchBar() {
        return this.#searchComponent
    }
}
