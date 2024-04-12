import API from './API.js'
import searchBar from './searchBar.js'
import { createElement, parseDate } from './Utilities.js'

export default class UI {
    constructor() {
        if (this instanceof UI) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static initApp() {
        UI.renderDashboard()
    }

    static #initEventListeners() {
        return
    }

    static #clear() {
        document.querySelector('.location > .name').textContent = ''
        document.querySelector('.location > .region').textContent = ''
        document.querySelector('.location > .country').textContent = ''
        document.querySelector('.local-time').textContent = ''
    }

    static #populateHeader() {
        const header = document.querySelector('header')
        if (header.textContent) return

        header.append(
            createElement('div', { classList: 'logo', textContent: 'Logo' }),
            createElement('div', { classList: 'unit-toggle' }),
            new searchBar().getSearchBar()
        )
        header
            .querySelector('.unit-toggle')
            .append(
                createElement('span', { classList: 'active', textContent: '\u00B0C' }),
                createElement('span', { classList: '', textContent: '|' }),
                createElement('span', { classList: '', textContent: '\u00B0F' })
            )
    }

    static #populateHome() {
        document.querySelector('section.homepage').append(new searchBar('70%').getSearchBar())
    }

    static #populateDashboard(data) {
        this.#populateHeader()

        API.forecast('Newcastle Upon Tyne').then((data) => {
            console.log(data)
            const location = data[0].location
            const current = data[1].current
            const forecast = data[2].forecast

            // Debugging
            console.log(location, current, forecast)
            for (let property in location) {
                console.log(location[property])
            }

            // Location
            document.querySelector('.location > .name').textContent = location['name']

            // Region
            if (location['name'] !== location['region'])
                document.querySelector('.location > .region').textContent = location['region']

            // Country
            document.querySelector('.location > .country').textContent = location['country']

            // Local Time
            document.querySelector('.local-time').textContent = parseDate(
                new Date().toLocaleString('en-GB', {
                    timeZone: location['tz_id'],
                })
            )

            // Local Stats
            // TODO

            // Current Weather
            // TODO

            // Forecasted Weather
            // TODO
        })
    }

    static #displaySection(section) {
        document.querySelector('#grid-container').className = ''
        document
            .querySelectorAll('section')
            .forEach((section) => section.classList.remove('active'))

        if (section == 'homepage') {
            document.querySelector('#grid-container').classList.add('homepage--active')
            document.querySelector('section.homepage').classList.add('active')
        }
        if (section == 'forecast') {
            document.querySelector('#grid-container').classList.add('dashboard--active')
            document.querySelector('section.dashboard').classList.add('active')
        }
    }

    static renderHome() {
        UI.#clear()
        UI.#populateHome()
        UI.#displaySection('homepage')
    }

    static renderDashboard(data) {
        UI.#clear()
        UI.#populateDashboard(data)
        UI.#displaySection('forecast')
    }
}
