import API from './API.js'
import searchBar from './searchBar.js'
import Carousel from './carousel.js'
import Storage from './localStorage.js'
import Favourites from './favourites.js'
import { createElement, formatLocalTime, getHour, getFormattedHour } from './Utilities.js'
import { conditions } from './conditions.js'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export default class UI {
    constructor() {
        if (this instanceof UI) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static #lastQuery
    static #location
    static #localTime

    static initApp() {
        this.#initHome()
        this.#initHeader()
        this.#initSettings()
        this.#initScroller()
        this.#initEventListeners()
        this.#renderHome()
    }

    static #reload() {
        // Reload data to match updated settings
        const active = this.#getActiveSection()
        if (active === 'dashboard') this.handleSearch(this.#lastQuery)
    }

    static #initEventListeners() {
        // Settings modal listeners
        const settingsOpen = document.querySelectorAll('.settingsOpen')
        const settingsClose = document.getElementById('settingsClose')
        const settingsModal = document.getElementById('settings')

        settingsOpen.forEach((button) =>
            button.addEventListener('click', () => this.toggleSettings())
        )
        settingsClose.addEventListener('click', () => this.toggleSettings())
        settingsModal.addEventListener('click', (e) => this.#handleSettingsClick(e))

        // Page listeners
        const logo = document.querySelector('header > .logo')
        const scroller = document.getElementById('scroller')
        const favourite = document.getElementById('favourite-button')

        logo.addEventListener('click', () => this.#renderHome())
        scroller.addEventListener('click', (e) => this.#handlePopularClick(e))
        favourite.addEventListener('click', () => Favourites.handleFavouriteButtonClick())

        // Settings
        const temp = document.getElementById('unit-temp')
        const wind = document.getElementById('unit-wind')

        temp.addEventListener('change', (e) => this.#handleSettingsChange(e))
        wind.addEventListener('change', (e) => this.#handleSettingsChange(e))
    }

    static #clear() {
        this.#localTime = ''
        document.querySelectorAll('.api-element').forEach((element) => (element.textContent = ''))
    }

    static #initHome() {
        document.querySelector('section.homepage').append(
            new searchBar('70%').getSearchBar(),
            createElement('span', {
                classList: 'settingsOpen material-symbols-rounded',
                textContent: 'menu',
            })
        )
    }

    static #initHeader() {
        const header = document.querySelector('header')
        if (header.textContent) return

        header.append(
            createElement('img', { classList: 'logo', src: '../content/images/logo_small.png' }),
            new searchBar('270px').getSearchBar(),
            createElement('span', {
                classList: 'settingsOpen material-symbols-rounded',
                textContent: 'menu',
            })
        )
    }

    static #initScroller() {
        const scrollers = document.querySelectorAll('.scroller__container')
        scrollers.forEach((scroller) => {
            const innerScroller = scroller.querySelector('.scroller__inner-scroll')
            const scrollerContent = Array.from(innerScroller.children)

            // Duplicate content for infinite loop
            scrollerContent.forEach((element) => {
                const duplicateElement = element.cloneNode(true)
                innerScroller.append(duplicateElement)
            })
        })
    }

    static #initSettings() {
        const modalHeader = document.querySelector('#settings > div > .header')
        modalHeader.append(new searchBar('270px').getSearchBar())

        // Pre-select the active units
        const tempOptions = Array.from(document.querySelectorAll('#unit-temp > option'))
        tempOptions.forEach((option) => {
            if (option.value === Storage.getTempUnit()) option.selected = 'selected'
        })

        const windOptions = Array.from(document.querySelectorAll('#unit-wind > option'))
        windOptions.forEach((option) => {
            if (option.value === Storage.getWindUnit()) option.selected = 'selected'
        })

        // Render the favourites
        Favourites.renderList()
    }

    static toggleSettings() {
        const modal = document.getElementById('settings')
        modal.hasAttribute('open') ? modal.close() : modal.showModal()
    }

    static #handleSettingsClick(e) {
        const target = e.target
        const settings = document.getElementById('settings')

        if (target.nodeName === 'DIALOG') {
            settings.hasAttribute('open') ? this.toggleSettings() : null
        }
    }

    static #handlePopularClick(e) {
        if (e.target.classList.contains('scroller-item')) this.handleSearch(e.target.textContent)
    }

    static #handleSettingsChange(e) {
        e.target.id === 'unit-temp'
            ? Storage.setTempUnit(e.target.value)
            : Storage.setWindUnit(e.target.value)

        this.#reload()
    }

    static #setLocation(location) {
        this.#location = `${location.name}, ${location.country}`
    }

    static getLocation() {
        return this.#location
    }

    static #setLocalTime(location) {
        this.#localTime = formatInTimeZone(new Date(), location.timezone, 'yyyy-MM-dd HH:mm')
    }

    static #populateLocationInfo(location) {
        const name = document.getElementById('location-name')
        const region = document.getElementById('location-region')
        const country = document.getElementById('location-country')
        const time = document.getElementById('location-time')

        name.textContent = location.name
        region.textContent = location.region
        country.textContent = location.country
        time.textContent = formatLocalTime(this.#localTime)

        location.name == location.region
            ? region.classList.add('hidden')
            : region.classList.remove('hidden')
    }

    static #populateForecast(current, forecast) {
        const icon = document.getElementById('current-icon')
        const alt = document.getElementById('current-alt')
        const temp = document.getElementById('current-temp')
        const realFeel = document.getElementById('current-feel')
        const high = document.getElementById('high')
        const low = document.getElementById('low')
        const sunrise = document.getElementById('sunrise')
        const sunset = document.getElementById('sunset')
        const chanceOfRain = document.getElementById('chance-of-rain')
        const humidity = document.getElementById('humidity')
        const wind = document.getElementById('wind')
        const gust = document.getElementById('gust')
        const uv = document.getElementById('uv-index')
        const visibility = document.getElementById('visibility')

        // Populate current conditions
        let imagePath
        current.is_day ? (imagePath = 'day') : (imagePath = 'night')

        const currentCondition = conditions.find((obj) => obj.code === current.condition.code)
        const imageIcon = currentCondition.icon
        const imageAlt = currentCondition[imagePath]

        icon.src = `./content/icons/${imagePath}/${imageIcon}.svg`
        alt.textContent = imageAlt
        temp.textContent = `${current.temp}\u00B0`
        realFeel.textContent = `Feels Like ${current.feel}\u00B0`

        // Populate forecasted conditions for today
        const today = forecast.days[0]

        high.textContent = `${today.day.maxtemp}\u00B0`
        low.textContent = `${today.day.mintemp}\u00B0`
        sunrise.textContent = today.astro.sunrise
        sunset.textContent = today.astro.sunset
        wind.textContent = `${current.wind} ${Storage.getWindUnit()}`
        gust.textContent = `${current.gust} ${Storage.getWindUnit()}`
        uv.textContent = current.uv
        visibility.textContent = `${current.visibility} ${
            Storage.getWindUnit() === 'mph' ? 'miles' : 'km'
        }`
        chanceOfRain.textContent = `${today.day.chance_of_rain}%`
        humidity.textContent = `${today.day.avghumidity}%`
    }

    static #populateHourly(forecast) {
        const container = document.querySelector('.forecast-hourly')

        if (!container.querySelector('.carousel__container')) {
            container.append(new Carousel().getCarousel())
        }

        const content = container.querySelector('.carousel__content')
        content.innerHTML = ''

        const today = forecast.days[0]
        const tomorrow = forecast.days[1]

        let todayHours = today.hours,
            tomorrowHours = tomorrow.hours,
            currentHour = getHour(this.#localTime),
            nextHour = currentHour + 1,
            hourCount = 0

        // Display the next 24 hours of forecast
        while (hourCount < 24) {
            // Check if end of day is reached
            if (nextHour === 24) {
                nextHour = 0
                todayHours = tomorrowHours
            }

            // Get forecasted hour to display
            const hourToDisplay = todayHours[nextHour]

            // Display hour forecast
            content.appendChild(this.#appendHour(hourToDisplay))

            // Update hour counters
            nextHour++
            hourCount++
        }
    }

    static #populateDaily(forecast) {
        const container = document.querySelector('.forecast-weekly > .details-container')
        container.innerHTML = ''

        const days = forecast.days
        days.splice(0, 1) // Remove current day from array

        days.forEach((day) => {
            container.appendChild(this.#appendDay(new Date(day.date), day.day))
        })
    }

    static #populateError(error) {
        const errorMessage = document.getElementById('error-message')
        errorMessage.textContent = `${error.message} (${error.code})`
    }

    static #appendHour(hour) {
        // Get image source based on current hours' conditions
        let imagePath, imageIcon

        hour.is_day ? (imagePath = 'day') : (imagePath = 'night')
        imageIcon = conditions.find((obj) => obj.code == hour.condition.code).icon

        // Create and return element
        const element = createElement('div', { classList: 'hourly-card' })
        element.append(
            createElement('span', {
                classList: 'fs-m fw-500',
                textContent: getFormattedHour(hour.time),
            }),
            createElement('img', { src: `./content/icons/${imagePath}/${imageIcon}.svg` }),
            createElement('span', { classList: 'fs-m fw-500', textContent: `${hour.temp}\u00B0` })
        )

        return element
    }

    static #appendDay(date, day) {
        // Get image source based on days' conditions
        const condition = conditions.find((obj) => obj.code == day.condition.code)
        const imageIcon = condition.icon
        const imageAlt = condition.day

        // Create and return element
        const element = createElement('div', { classList: 'day-card' })

        const dateContainer = createElement('div', { classList: 'date-container' })
        dateContainer.append(
            createElement('span', {
                classList: 'fs-s fw-500',
                textContent: format(date, 'EEEE'),
            }),
            createElement('span', {
                classList: 'fs-s fw-300',
                textContent: format(date, 'dd/MM'),
            })
        )

        const tempContainer = createElement('div', { classList: 'temp-container' })
        tempContainer.append(
            createElement('span', {
                classList: 'fs-l fw-500',
                style: 'grid-area: temp;',
                textContent: `${Math.round(day.avgtemp)}\u00B0`,
            }),
            createElement('span', {
                classList: 'fs-s fw-400',
                style: 'grid-area: high;',
                textContent: `${Math.round(day.maxtemp)}\u00B0`,
            }),
            createElement('span', {
                classList: 'fs-s fw-400',
                style: 'grid-area: low;',
                textContent: `${Math.round(day.mintemp)}\u00B0`,
            })
        )

        const iconContainer = createElement('div', { classList: 'icon-container' })
        iconContainer.append(
            createElement('img', { src: `./content/icons/day/${imageIcon}.svg` }),
            createElement('span', { classList: 'fs-s fw-400', textContent: imageAlt })
        )

        const detailsSubContainer = createElement('div', { classList: 'fw500' })
        detailsSubContainer.append(
            createElement('p', { classList: 'fs-s', textContent: 'Chance of rain' }),
            createElement('p', { classList: 'fs-m', textContent: `${day.chance_of_rain}%` })
        )

        const detailsContainer = createElement('div', { classList: 'current-card' })
        detailsContainer.append(
            createElement('img', { src: './content/icons/other/extreme-rain.svg' }),
            detailsSubContainer
        )

        element.append(dateContainer, tempContainer, iconContainer, detailsContainer)

        return element
    }

    static #displaySection(section) {
        document.querySelector('#grid-container').className = ''
        document
            .querySelectorAll('section')
            .forEach((section) => section.classList.remove('active'))

        if (section === 'homepage') {
            document.querySelector('#grid-container').classList.add('homepage--active')
            document.querySelector('section.homepage').classList.add('active')
        }
        if (section === 'loading') {
            document.querySelector('#grid-container').classList.add('loading--active')
            document.querySelector('section.loading').classList.add('active')
        }
        if (section === 'error') {
            document.querySelector('#grid-container').classList.add('error--active')
            document.querySelector('section.error').classList.add('active')
        }
        if (section === 'dashboard') {
            document.querySelector('#grid-container').classList.add('dashboard--active')
            document.querySelector('section.dashboard').classList.add('active')
        }
    }

    static #getActiveSection() {
        const sections = document.querySelectorAll('section')
        let activeSection

        sections.forEach((section) => {
            if (section.classList.contains('active')) {
                activeSection = section.classList[0]
            }
        })
        return activeSection
    }

    static #renderHome() {
        this.#clear()
        this.#displaySection('homepage')
    }

    static #renderLoading() {
        this.#clear()
        this.#displaySection('loading')
    }

    static #renderError(error) {
        this.#clear()
        this.#populateError(error)
        this.#displaySection('error')
    }

    static #renderDashboard(result) {
        this.#clear()
        this.#setLocation(result.location)
        this.#setLocalTime(result.location)
        this.#populateLocationInfo(result.location)
        this.#populateForecast(result.current, result.forecast)
        this.#populateHourly(result.forecast)
        this.#populateDaily(result.forecast)
        Favourites.updateButton(this.#location)
        this.#displaySection('dashboard')
    }

    static async handleSearch(query) {
        this.#lastQuery = query
        this.#renderLoading()
        const result = await API.forecast(this.#lastQuery) // API call
        if (result.error) return this.#renderError(result.error)
        else return this.#renderDashboard(result)
    }
}
