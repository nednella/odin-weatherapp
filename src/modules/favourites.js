import UI from './UI.js'
import Storage from './localStorage.js'
import { createElement } from './Utilities.js'

export default class Favourites {
    constructor() {
        if (this instanceof Favourites) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static #favourites = Storage.getFavourites() || []

    static #add(item) {
        if (this.#favourites.find((element) => element === item))
            return console.log(`${item} is already favourited.`)
        else return this.#favourites.push(item)
    }

    static #remove(item) {
        const selectedItem = this.#favourites.find((element) => element === item)
        if (!selectedItem) return
        else return this.#favourites.splice(this.#favourites.indexOf(selectedItem), 1)
    }

    static #getItem(item) {
        return this.#favourites.find((element) => element === item)
    }

    static #getAll() {
        return this.#favourites
    }

    static #createListItem(item) {
        const container = createElement('div', { classList: 'favourite-item' })
        container.append(
            createElement('p', { classList: 'fw-400', textContent: item }),
            createElement('span', { classList: 'material-symbols-rounded', textContent: 'close' })
        )
        container.addEventListener('click', (e) => this.#handleFavouriteItemClick(e.target))

        return container
    }

    static #createEmptyMessage() {
        const message = createElement('p', { textContent: 'There are no favourited locations.' })
        return message
    }

    static renderList() {
        const container = document.getElementById('favourites')
        container.innerHTML = ''

        const items = this.#getAll()
        if (items.length === 0) {
            container.appendChild(this.#createEmptyMessage())
        } else {
            items.forEach((item) => {
                container.appendChild(this.#createListItem(item))
            })
        }

        Storage.setFavourites(items)
    }

    static updateButton(item) {
        const parent = document.getElementById('favourite-button')
        const icon = parent.children[0]
        const text = parent.children[1]

        if (Favourites.#getItem(item)) {
            if (icon.classList.contains('fa-regular')) {
                icon.classList.remove('fa-regular')
                icon.classList.add('fa-solid')
                text.textContent = 'Added to Favourites'
            }
        } else {
            if (icon.classList.contains('fa-solid')) {
                icon.classList.remove('fa-solid')
                icon.classList.add('fa-regular')
                text.textContent = 'Add to Favourites'
            }
        }
    }

    static handleFavouriteButtonClick() {
        const item = UI.getLocation()
        this.#getItem(item) ? this.#remove(item) : this.#add(item)
        this.renderList()
        this.updateButton(item)
    }

    static #handleFavouriteItemClick(item) {
        if (item.nodeName === 'P') {
            const clickedElement = item.textContent
            UI.handleSearch(clickedElement)
        }

        if (item.nodeName === 'SPAN') {
            const clickedElement = item.parentElement.children[0].textContent
            this.#remove(clickedElement)
            this.renderList()
            this.updateButton(clickedElement)
        }
    }
}
