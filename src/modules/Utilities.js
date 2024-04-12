import { format } from 'date-fns'

// Utility functions
export const createElement = (type, properties = {}) =>
    Object.assign(document.createElement(type), properties)

export const parseDate = (date) => {
    let parts = date.split(/[/,]/)
    date = format(
        `${parts[2]}-${parts[1]}-${parts[0]}${parts[3]}`,
        "EEEE, d MMMM yyyy '| Local Time: 'hh:mm aa"
    )
    return date
}
