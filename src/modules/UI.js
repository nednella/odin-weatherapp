import API from './API.js'
import searchBar from './searchBar.js'
import { createElement, parseLocalTime, getHour, getFormattedHour } from './Utilities.js'
import { conditions } from './conditions.js'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export default class UI {
    constructor() {
        if (this instanceof UI) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    // TODO: Fix inifinite scroll https://medium.com/@mintpw/how-to-create-infinite-horizontal-scroll-and-hover-pause-with-pure-css-b052caa683bd
    // TODO: Add custom netflix-style hourly display
    // TODO: Add error handling to API calls
    // TODO: Add a data check before displaying dashboard in case of errors
    // TODO: Add an error section that displays if there is a problem

    static #localTime

    static initApp() {
        UI.renderDashboard()
    }

    static #initEventListeners() {
        return
    }

    static #initCarousel() {
        const slideButtons = document.querySelectorAll('.slide-button')
        const carousel = document.querySelector('.hourly-carousel')
        const root = document.querySelector('body')
        const rootProperties = getComputedStyle(root)

        function scrollCarousel(button) {
            const totalItems = carousel.childElementCount
            const itemsPerPage = parseInt(rootProperties.getPropertyValue('--carousel-items'))
            const totalPages = Math.ceil(totalItems / itemsPerPage) - 1

            const direction = button.id === 'slide-prev' ? -1 : 1
            const index = parseInt(rootProperties.getPropertyValue('--carousel-index'))
            const newIndex = index + direction

            if (newIndex > totalPages || newIndex < 0) return
            else return root.style.setProperty('--carousel-index', newIndex)
        }

        slideButtons.forEach((button) => {
            button.addEventListener('click', () => scrollCarousel(button))
        })
    }

    static #clear() {
        document.querySelectorAll('.api-element').forEach((element) => (element.textContent = ''))
    }

    static #populateHome() {
        document.querySelector('section.homepage').append(new searchBar('70%').getSearchBar())
    }

    static #populateHeader() {
        const header = document.querySelector('header')
        if (header.textContent) return

        header.append(
            createElement('div', { classList: 'logo', textContent: 'Logo' }),
            createElement('div', { classList: 'unit-toggle' }),
            new searchBar('270px').getSearchBar()
        )
        header
            .querySelector('.unit-toggle')
            .append(
                createElement('span', { classList: 'active', textContent: '\u00B0C' }),
                createElement('span', { classList: '', textContent: '|' }),
                createElement('span', { classList: '', textContent: '\u00B0F' })
            )
    }

    static #setLocalTime(location) {
        this.#localTime = formatInTimeZone(new Date(), location.tz_id, 'yyyy-MM-dd HH:mm')
    }

    static #populateLocationInfo(location) {
        const name = document.getElementById('location-name')
        const region = document.getElementById('location-region')
        const country = document.getElementById('location-country')
        const time = document.getElementById('location-time')

        name.textContent = location.name
        region.textContent = location.region
        country.textContent = location.country
        time.textContent = parseLocalTime(this.#localTime)

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

        const currentCondition = conditions.find((obj) => obj.code == current.condition.code)
        const imageIcon = currentCondition.icon
        const imageAlt = currentCondition[imagePath]

        icon.src = `./content/icons/${imagePath}/${imageIcon}.svg`
        alt.textContent = imageAlt
        temp.textContent = `${current.temp_c}\u00B0`
        realFeel.textContent = `Feels Like ${current.feelslike_c}\u00B0`

        // Populate forecasted conditions for today
        const today = forecast.forecastday[0]

        high.textContent = `${today.day.maxtemp_c}\u00B0`
        low.textContent = `${today.day.mintemp_c}\u00B0`
        sunrise.textContent = today.astro.sunrise
        sunset.textContent = today.astro.sunset
        wind.textContent = `${current.wind_mph} mph`
        gust.textContent = `${current.gust_mph} mph`
        uv.textContent = current.uv
        visibility.textContent = `${current.vis_miles} miles`
        chanceOfRain.textContent = `${today.day.daily_chance_of_rain}%`
        humidity.textContent = `${today.day.avghumidity}%`
    }

    static #populateHourly(forecast) {
        const container = document.querySelector('.hourly-carousel')
        container.innerHTML = ''

        const today = forecast.forecastday[0]
        const tomorrow = forecast.forecastday[1]

        let todayHours = today.hour,
            tomorrowHours = tomorrow.hour,
            currentHour = getHour(this.#localTime),
            nextHour = currentHour + 1,
            hourCount = 0

        // Display the next 24 hours of forecast
        while (hourCount < 24) {
            // Debugging
            // console.log('Next hour: ', nextHour)

            // Check if end of day is reached
            if (nextHour === 24) {
                nextHour = 0
                todayHours = tomorrowHours
            }

            // Get forecasted hour to display
            const hourToDisplay = todayHours[nextHour]

            // Display hour forecast
            container.appendChild(this.#appendHour(hourToDisplay))

            // Update hour counters
            nextHour++
            hourCount++
        }
    }

    static #appendHour(hour) {
        // Debugging
        // console.log(hour)

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
            createElement('span', { classList: 'fs-m fw-500', textContent: `${hour.temp_c}\u00B0` })
        )

        return element
    }

    static #populateDaily(forecast) {
        const container = document.querySelector('.forecast-weekly > .details-container')
        container.innerHTML = ''

        const days = forecast.forecastday
        days.splice(0, 1) // Remove current day from array

        // Debugging
        // console.log(days)

        days.forEach((day) => {
            container.appendChild(this.#appendDay(new Date(day.date), day.day))
        })
    }

    static #appendDay(date, day) {
        // Debugging
        // console.log(date, day)

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
                textContent: `${Math.round(day.avgtemp_c)}\u00B0`,
            }),
            createElement('span', {
                classList: 'fs-s fw-400',
                style: 'grid-area: high;',
                textContent: `${Math.round(day.maxtemp_c)}\u00B0`,
            }),
            createElement('span', {
                classList: 'fs-s fw-400',
                style: 'grid-area: low;',
                textContent: `${Math.round(day.mintemp_c)}\u00B0`,
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
            createElement('p', { classList: 'fs-m', textContent: `${day.daily_chance_of_rain}%` })
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

        if (section == 'homepage') {
            document.querySelector('#grid-container').classList.add('homepage--active')
            document.querySelector('section.homepage').classList.add('active')
        }
        if (section == 'dashboard') {
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
        this.#populateHeader()

        // UI.#displaySection('loading')
        // Wrap below in a timeout of 1 second

        API.forecast('New York').then((data) => {
            // Debugging
            console.log(data)

            const location = data[0].location
            const current = data[1].current
            const forecast = data[2].forecast

            this.#setLocalTime(location)
            this.#populateLocationInfo(location)
            this.#populateForecast(current, forecast)
            this.#populateHourly(forecast)
            this.#populateDaily(forecast)
            this.#initCarousel()
        })

        UI.#displaySection('dashboard')
    }
}
