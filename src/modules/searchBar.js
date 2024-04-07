import { createElement } from './Utilities.js'
import API from './API.js'

export default class searchBar {
    constructor(width) {
        this.searchComponent = this.createSearchBar(width)
        this.searchBar = this.searchComponent.querySelector('.search-bar')
        this.searchClear = this.searchComponent.querySelector('.search-clear')
        this.searchSuggestions = this.searchComponent.querySelector('.search-suggestions')
        this.#initEventListeners()
    }

    // TODO: Add debouncing https://medium.com/@kushal.bhargava01/debounce-optimizing-api-call-in-js-dc166b8a55ee
    // https://medium.com/@akhilanand.ak01/understanding-debounce-in-javascript-efficient-event-handling-d1d883628c6c#:~:text=Utilizing%20Debounce%3A&text=inputElement.,a%20delay%20of%20300%20milliseconds.

    #initEventListeners() {
        this.searchBar.addEventListener('input', () => this.#handleSearchInput())
        this.searchBar.addEventListener('keydown', (e) => this.#handleSearchSubmit(e))
        this.searchClear.addEventListener('click', () => this.#handleSearchClear())
        this.searchSuggestions.addEventListener('click', (e) =>
            this.#handleSearchSuggestionClick(e)
        )
    }

    #searchComponentState(arg) {
        arg == 'active'
            ? this.searchComponent.classList.add('active')
            : this.searchComponent.classList.remove('active')
    }

    #clearButtonState(arg) {
        arg == 'active'
            ? this.searchClear.classList.add('active')
            : this.searchClear.classList.remove('active')
    }

    #searchSuggestionState(arg) {
        arg == 'active'
            ? this.searchSuggestions.classList.add('active')
            : this.searchSuggestions.classList.remove('active')
    }

    #handleSearchInput() {
        if (this.searchBar.value !== '') {
            this.#clearButtonState('active')
            this.#searchComponentState('active')
            this.#searchSuggestionState('active')
            this.#getNearestMatches()
        } else {
            this.#clearButtonState('inactive')
            this.#searchComponentState('inactive')
            this.#searchSuggestionState('inactive')
        }
    }

    #handleSearchSubmit(event) {
        if (this.searchBar.value !== '' && event.key == 'Enter') {
            console.log(this.searchBar.value)

            // TODO: Connect forecasting API
        }
    }

    #handleSearchClear() {
        this.searchBar.value = ''
        this.#clearButtonState('inactive')
        this.#searchComponentState('inactive')
        this.#searchSuggestionState('inactive')
    }

    #handleSearchSuggestionClick(e) {
        const clickedElement = e.target.children[1].textContent

        this.searchBar.value = clickedElement
        this.#searchSuggestionState('inactive')

        // TODO: Connect forecasting API
    }

    #getNearestMatches() {
        this.searchSuggestions.textContent = ''

        // Append current search criteria
        this.searchSuggestions.appendChild(this.#createSuggestionItem(this.searchBar.value))

        // TODO: Connect nearest match API

        // Fetch nearest matches (up to 10 maximum)
        // If an element matches searchCriteria exactly, do not append
        // For each match,
        // Append the match to the DOM

        // Debugging
        this.searchSuggestions.appendChild(this.#createSuggestionItem('Newcastle Upon Tyne'))
        this.searchSuggestions.appendChild(this.#createSuggestionItem('London, United Kingdom'))
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
            }),
            createElement('span', {
                classList: 'search-clear material-symbols-rounded hidden',
                textContent: 'close',
            })
        )

        return search
    }

    getSearchBar() {
        return this.searchComponent
    }
}
