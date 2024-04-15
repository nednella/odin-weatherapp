import { format, getHours } from 'date-fns'

// Utility functions
export const createElement = (type, properties = {}) =>
    Object.assign(document.createElement(type), properties)

export const parseLocalTime = (date) => {
    date = format(date, 'EEEE, d MMMM yyyy, h:mm aa')
    return date
}

export const getHour = (date) => {
    return getHours(date)
}

export const getFormattedHour = (date) => {
    return format(date, 'h aa')
}
