import Storage from './localStorage.js'

export default class API {
    constructor() {
        if (this instanceof API) {
            throw Error('Error: static class, cannot be instantiated.')
        }
    }

    static #temp_unit
    static #wind_unit

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

    static async forecast(query) {
        try {
            const response = await fetch(
                this.URL + '/forecast.json' + `?key=${this.API_KEY}` + `&q=${query}` + `&days=8`
            )
            if (response.ok) {
                const data = await response.json()
                return this.#processResults(data)
            } else {
                const error = await response.json()
                throw error
            }
        } catch (error) {
            return this.#processResults(error)
        }
    }

    static #getSettings() {
        this.#temp_unit = Storage.getTempUnit()
        this.#wind_unit = Storage.getWindUnit()
    }

    static #processResults(data) {
        if (data.error) return data // Dont process if error
        this.#getSettings() // Check for updated settings

        const processedData = {
            current: {
                condition: {
                    code: data.current.condition.code,
                    text: data.current.condition.text,
                },
                humidity: data.current.humidity,
                is_day: data.current.is_day,
                uv: data.current.uv,
                temp: this.#temp_unit === 'C' ? data.current.temp_c : data.current.temp_f,
                feel: this.#temp_unit === 'C' ? data.current.feelslike_c : data.current.feelslike_f,
                wind: this.#wind_unit === 'mph' ? data.current.wind_mph : data.current.wind_kph,
                gust: this.#wind_unit === 'mph' ? data.current.gust_mph : data.current.gust_kph,
                visibility:
                    this.#wind_unit === 'mph' ? data.current.vis_miles : data.current.vis_km,
            },
            forecast: {
                days: (function () {
                    const days = data.forecast.forecastday
                    let processedDays = []

                    // Loop over days
                    days.forEach((day) => {
                        // Loop over hours
                        const hours = day.hour
                        let processedHours = []

                        hours.forEach((hour) => {
                            let processedHour = {
                                condition: {
                                    code: hour.condition.code,
                                    text: hour.condition.text,
                                },
                                time: hour.time,
                                is_day: hour.is_day,
                                temp: API.#temp_unit === 'C' ? hour.temp_c : hour.temp_f,
                            }

                            processedHours.push(processedHour)
                        })

                        // Take relevant data for each forecasted day
                        let processedDay = {
                            astro: day.astro,
                            date: day.date,
                            hours: processedHours,
                            day: {
                                condition: {
                                    code: day.day.condition.code,
                                    text: day.day.condition.text,
                                },
                                avghumidity: day.day.avghumidity,
                                chance_of_rain: day.day.daily_chance_of_rain,
                                avgtemp:
                                    API.#temp_unit === 'C' ? day.day.avgtemp_c : day.day.avgtemp_f,
                                maxtemp:
                                    API.#temp_unit === 'C' ? day.day.maxtemp_c : day.day.maxtemp_f,
                                mintemp:
                                    API.#temp_unit === 'C' ? day.day.mintemp_c : day.day.mintemp_f,
                            },
                        }

                        processedDays.push(processedDay)
                    })

                    return processedDays
                })(),
            },
            location: {
                country: data.location.country,
                name: data.location.name,
                region: data.location.region,
                timezone: data.location.tz_id,
            },
        }

        return processedData
    }
}
