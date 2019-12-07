import $ from 'jquery'
import _ from 'lodash'

const MathUtils = {
	map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
	lerp: (a, b, n) => (1 - n) * a + n * b
}
const body = $('body')

let docScroll
const getPageYScroll = () => docScroll = $(window).scrollTop()
window.addEventListener('scroll', getPageYScroll)

class SmoothScroll {
	constructor() {
		this.DOM = {
			main: $('main'),
			scr_div: $('main > div[data-scroll]'),
			sec: $('main > div[data-scroll] > section')
		}

		this.renderedStyles = {
			previous: 0,
			current: 0,
			ease: 0.1,
			scroll_value: () => docScroll
		}

		this.sec_hgs = []
		this.inWindow = []
		this.sec_count = 0
		this.smooth_scroll = true

		this.up_sec_Hgs_n_count()
		this.up_dom_styl()
		this.up_init_sec_pos()
		this.up_whn_resize()
		requestAnimationFrame(() => this.render())
	}

	render() {

		this.up_inwin()
		this.renderedStyles.current = this.renderedStyles.scroll_value()
		this.renderedStyles.previous = _.round(MathUtils.lerp(this.renderedStyles.previous, this.renderedStyles.current, this.renderedStyles.ease), 3)
		this.layout()

		requestAnimationFrame(() => this.render())
	}

	//update the inwindow sections for current prev value with getsecpos
	layout() {
		this.inWindow.forEach((value, index, array) => {
			this.DOM.sec.eq(value).css('transform', `matrix(1, 0, 0, 1, 0, ${this.get_sec_pos(value)})`)
		})
	}

	//update in windows for current prev value
	up_inwin() {
		this.inWindow = []
		for (let index = 0; index < this.sec_count; index++) {
			if (this.get_sec_pos(index) <= 0) {//if "top" is "top of window"
				if (this.get_sec_pos(index) + this.sec_hgs[index] + 100 >= 0) {//if bottom is below wintop
					this.DOM.sec.eq(index).css('visibility', 'visible')
					this.inWindow.push(index)
				} else {
					this.DOM.sec.eq(index).css('visibility', 'hidden')
				}
			} else if ($(window).height() + 100 >= this.get_sec_pos(index)) {//if top above bottom of window
				this.DOM.sec.eq(index).css('visibility', 'visible')
				this.inWindow.push(index)
			} else {
				this.DOM.sec.eq(index).css('visibility', 'hidden')
			}
		}
	}

	//initiate section position and current and previous value
	up_init_sec_pos() {
		this.renderedStyles.current = this.renderedStyles.previous = this.renderedStyles.scroll_value()
		for (let i = 0; i < this.sec_count; i++) {
			this.DOM.sec.eq(i).css('transform', `translate3d(0,${this.get_sec_pos(i)}px,0)`)
		}
	}

	// set the style value
	up_dom_styl() {
		this.DOM.main.css({
			'left': '0',
			'top': '0',
			'height': '100%',
			'width': '100%',
			'overflow': 'hidden',
			'position': 'fixed'
		})
		this.DOM.sec.css({
			'left': '0',
			'top': '0',
			'width': '100%',
			'overflow': 'hidden',
			'position': 'fixed'
		})

		body.css('height', `${this.top_to_sec_Hg(this.sec_count - 1)}px`)
	}


	// updade the section hight value when resize
	up_whn_resize() {
		window.addEventListener('resize', () => {
			this.up_sec_Hgs_n_count()
			this.up_dom_styl()
		})
	}

	//update section hight and count
	up_sec_Hgs_n_count() {
		this.sec_hgs = []
		this.sec_count = this.DOM.sec.length
		for (let i = 0; this.sec_count > i; i++) {
			this.sec_hgs.push(this.DOM.sec.eq(i).height())
		}
	}

	//get section position(position suppose ot be in current prev value) to given section index
	get_sec_pos(i) {
		if (i === 0) {
			return -this.renderedStyles.previous
		} else {
			return this.top_to_sec_Hg(i - 1) - this.renderedStyles.previous
		}
	}

	//hight from 0 to x sections
	top_to_sec_Hg(x) {
		let sum = 0
		for (let i = 0; i <= x; i++) {
			sum = sum + this.sec_hgs[i]
		}
		return sum
	}

}


getPageYScroll()
if ($(window).width() >= 800) {
	new SmoothScroll()
}
