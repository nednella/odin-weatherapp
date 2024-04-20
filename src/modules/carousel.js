import { createElement } from './Utilities.js'

export default class Carousel {
    // Init private class constructor variables
    #carousel
    #content
    #contentItemCount
    #contentActivePage
    #contentPages

    constructor() {
        this.#carousel = this.#createCarousel()
        this.#content = this.#carousel.querySelector('.carousel__content')
    }

    #createCarousel() {
        // Create content wrapper & container
        const carouselWrapper = createElement('div', { classList: 'carousel__wrapper' })
        const carouselContent = createElement('div', { classList: 'carousel__content' })
        carouselWrapper.append(carouselContent)

        // Create buttons
        const carouselButtons = [
            createElement('button', {
                classList: 'carousel__button carousel__button-left material-symbols-rounded',
                textContent: 'chevron_left',
            }),
            createElement('button', {
                classList: 'carousel__button carousel__button-right material-symbols-rounded',
                textContent: 'chevron_right',
            }),
        ]

        // Create progress bar
        const carouselProgress = createElement('div', { classList: 'carousel__progress-bar' })

        // Create carousel container and append children
        const carouselContainer = createElement('div', { classList: 'carousel__container' })
        carouselContainer.append(
            carouselButtons[0],
            carouselButtons[1],
            carouselWrapper,
            carouselProgress
        )

        // Listen for button clicking
        carouselButtons.forEach((button) =>
            button.addEventListener('click', () => this.#scrollCarousel(button))
        )

        // Listen for content being added to the content container
        const observer = new MutationObserver((mutationList) => {
            for (let mutation of mutationList) {
                if (mutation.type === 'childList') {
                    this.#updateCounters()
                    this.#initProgressBar(carouselContainer)
                }
            }
        })
        observer.observe(carouselContent, { childList: true })

        // Listen for page resizing
        window.addEventListener('resize', () => {
            this.#updateCounters()
            this.#updateProgressBar()
        })

        return carouselContainer
    }

    getCarousel() {
        return this.#carousel
    }

    #updateCounters() {
        const contentItemsPerPage = parseInt(
            getComputedStyle(this.#carousel).getPropertyValue('--carousel-items')
        )
        const contentActivePage = parseInt(
            getComputedStyle(this.#carousel).getPropertyValue('--carousel-index')
        )

        this.#contentItemCount = this.#content.childElementCount
        this.#contentActivePage = contentActivePage
        this.#contentPages = Math.ceil(this.#contentItemCount / contentItemsPerPage)
    }

    #initProgressBar(carousel) {
        const content = carousel.querySelector('.carousel__content')
        const progressBar = carousel.querySelector('.carousel__progress-bar')

        progressBar.innerHTML = ''
        for (let i = 0; i < this.#contentPages; i++) {
            i == 0
                ? progressBar.append(
                      createElement('span', { classList: 'carousel__progress-element active' })
                  )
                : progressBar.append(
                      createElement('span', { classList: 'carousel__progress-element' })
                  )
        }
    }

    #scrollCarousel(button) {
        const direction = button.classList.contains('carousel__button-left') ? -1 : 1
        const newPage = this.#contentActivePage + direction

        if (newPage >= this.#contentPages || newPage < 0) return // Prevent scrolling out of bounds
        else {
            this.#contentActivePage = newPage
            this.#carousel.style.setProperty('--carousel-index', this.#contentActivePage)
            this.#updateProgressBar()
        }
    }

    #updateProgressBar() {
        const progressBar = this.#carousel.querySelector('.carousel__progress-bar')

        progressBar.innerHTML = ''
        for (let i = 0; i < this.#contentPages; i++) {
            i == this.#contentActivePage
                ? progressBar.append(
                      createElement('span', { classList: 'carousel__progress-element active' })
                  )
                : progressBar.append(
                      createElement('span', { classList: 'carousel__progress-element' })
                  )
        }
    }
}
