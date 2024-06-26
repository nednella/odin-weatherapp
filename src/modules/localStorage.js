export default class Storage {
    constructor() {
        if (this instanceof Storage) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static #clear() {
        return localStorage.clear()
    }

    static setTempUnit(unit) {
        return localStorage.setItem('temp', unit)
    }

    static getTempUnit() {
        let unit = localStorage.getItem('temp')
        if (!unit) unit = 'C' // Default unit
        return unit
    }

    static setWindUnit(unit) {
        return localStorage.setItem('wind', unit)
    }

    static getWindUnit() {
        let unit = localStorage.getItem('wind')
        if (!unit) unit = 'mph' // Default unit
        return unit
    }

    static setFavourites(arr) {
        return localStorage.setItem('favourites', JSON.stringify(arr))
    }

    static getFavourites() {
        return JSON.parse(localStorage.getItem('favourites'))
    }
}
