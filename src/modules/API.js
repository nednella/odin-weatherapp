import UI from './UI'

export default class API {
    constructor() {
        if (this instanceof API) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static async forecast(query) {
        try {
            const response = await fetch(
                this.URL + '/forecast.json' + `?key=${this.API_KEY}` + `&q=${query}` + `&days=8`
            )
            if (response.ok) {
                const data = await response.json()
                return data
            } else {
                const error = await response.json()
                throw error.error
            }
        } catch (error) {
            UI.renderError(error)
        }
    }

    static async nearestMatch(query) {
        try {
            const response = await fetch(
                this.URL + '/search.json' + `?key=${this.API_KEY}` + `&q=${query}`
            )
            if (response.ok) {
                const data = await response.json()
                return data
            } else {
                const error = await response.json()
                throw error.error
            }
        } catch (error) {
            console.error('nearestMatch API error: ', error)
        }
    }

    static googleSearch(query) {
        window.open('http://google.com/search?q=' + query)
    }
}
