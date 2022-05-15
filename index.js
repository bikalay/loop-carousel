class LoopCarousel {

    /**
     * @param {string} selector
     * @param {{}} options
     */
    constructor(selector, options) {
        this.carousel = document.querySelector(selector);
        this.options = options
        this.autoplay = true;
    }

    _addMouseScroll() {
        const ele = this.carousel;
        ele.style.cursor = 'grab';

        let pos = {top: 0, left: 0, x: 0, y: 0};

        const mouseDownHandler = (e) => {
            this.autoplay = false;
            ele.style.cursor = 'grabbing';
            ele.style.userSelect = 'none';

            pos = {
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler =  (e) => {
            // How far the mouse has been moved
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;

            // Scroll the element
            ele.scrollTop = pos.top - dy;
            ele.scrollLeft = pos.left - dx;
        };

        const mouseUpHandler =  () => {
            ele.style.cursor = 'grab';
            ele.style.removeProperty('user-select');

            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            this.autoplay = true;
            window.requestAnimationFrame((timestamp) => this._autoPlayStart(timestamp));
        };

        // Attach the handler
        ele.addEventListener('mousedown', mouseDownHandler);
        ele.addEventListener('touchmove', () => {
           this.autoplay = false;
        });
    }

    _addLoopLogic() {
        const ele = this.carousel;
        const wrapper = ele.querySelector('.loop-carousel-wrapper');
        this.items = Array.from(wrapper.childNodes).filter(node => node.tagName);
        this.itemsCount = this.items.length;
        let firstItem = this.items[0];
        const itemSize = firstItem.getBoundingClientRect();
        const elFullWidth = itemSize.width + parseInt(window.getComputedStyle(firstItem).marginRight, 10);
        wrapper.style.width = elFullWidth * this.itemsCount * 2 + 'px';
        this.items.forEach((item, index) => {
            //wrapper.appendChild(item.cloneNode(true));
            wrapper.insertBefore(item.cloneNode(true), firstItem);
        })
        wrapper.clientWidth;
        ele.scrollLeft = elFullWidth * this.itemsCount;
        let timerId = null;
        ele.addEventListener('scroll', (event) => {
            const scroll = ele.scrollLeft;
            const scrolledItems = Math.floor((scroll - (elFullWidth * this.itemsCount)) / elFullWidth);
            if(timerId && Math.abs(scrolledItems) < 10) {
                clearTimeout(timerId)
            }
            timerId = setTimeout(() => {
                const scroll = ele.scrollLeft;
                const scrolledItems = Math.floor((scroll - (elFullWidth * this.itemsCount)) / elFullWidth);
                const items = Array.from(wrapper.childNodes).filter(node => node.tagName);
                if (scrolledItems > 0) {
                    for (let i = 0; i < scrolledItems; i++) {
                        wrapper.appendChild(items[i]);
                    }
                    ele.scrollLeft = scroll - scrolledItems * elFullWidth;
                } else if(scrolledItems < 0) {
                    const firstElement = items[0];
                    for (let i = items.length - 1 + scrolledItems; i < items.length; i++) {
                        wrapper.insertBefore(items[i], firstElement);
                    }
                    ele.scrollLeft = scroll - ((scrolledItems - 1) * elFullWidth);
                }
                if(!this.autoplay) {
                    this.autoplay = true;
                    window.requestAnimationFrame((timestamp) => {this._autoPlayStart(timestamp)})
                }
            }, 500)
        }, false);
    }

    _autoPlayStart(timestemp) {
        const ele = this.carousel;
        ele.scrollLeft += 1;
        if(this.autoplay) {
            window.requestAnimationFrame((timestemp) => {
                this._autoPlayStart(timestemp)
            })
        }
    }

    mount() {
        this._addMouseScroll();
        this._addLoopLogic();
        window.requestAnimationFrame((timestemp) => {this._autoPlayStart(timestemp)})
    }
}


window.LoopCarousel = LoopCarousel;
