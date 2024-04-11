// API

export default class API {
    constructor() {
        if (this instanceof API) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static async forecast(query) {
        const locationData = []

        try {
            const response = await fetch(
                this.URL + '/forecast.json' + `?key=${this.API_KEY}` + `&q=${query}` + `&days=14`
            )
            if (response.ok) {
                const data = await response.json()
                locationData.push({ location: data.location })
                locationData.push({ current: data.current })
                locationData.push({ forecast: data.forecast })
            } else throw new Error()
        } catch (error) {
            console.log('Error: ', error)

            // TODO: Error handling
        }

        return locationData
    }

    static async nearestMatch(query) {
        try {
            const response = await fetch(
                this.URL + '/search.json' + `?key=${this.API_KEY}` + `&q=${query}`
            )
            if (response.ok) {
                const data = await response.json()
                return data
            } else throw new Error()
        } catch (error) {
            console.log('Error: ', error)

            // TODO: Error handling
        }
    }

    static googleSearch(query) {
        window.open('http://google.com/search?q=' + query)
    }
}
