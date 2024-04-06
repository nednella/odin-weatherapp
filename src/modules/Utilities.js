const element = (tag, props = {}) =>
    Object.assign(document.createElement(tag), props)

export default element
