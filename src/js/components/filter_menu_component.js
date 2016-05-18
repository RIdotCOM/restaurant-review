'use strict'

//libraries
import m from 'mithril'
import _ from 'lodash'

//stles
import style from '../../css/filter.scss'

//polythene icons
import starIcon from 'mmsvg/google/msvg/toggle/star'
import plusIcon from 'mmsvg/google/msvg/content/add'
import dollarIcon from 'mmsvg/google/msvg/editor/attach-money'


const ratingClickHandler = function(index) {
  const ctrl = this
  ctrl.filter.add('rating', index)
}

const priceClickHandler = function(index) {
  const ctrl = this
  ctrl.filter.add('price', index)
}

const categoryClickHandler = function(category) {
  const ctrl = this
  ctrl.filter.add('category', category)
}

const renderOptions = function(menuType) {
  const ctrl = this

  let icon
  let clickHandler
  let cls
  if (menuType === 'rating') {
    icon = starIcon
    clickHandler = ratingClickHandler
    cls = style['star-icon']
  } else {
    icon = dollarIcon
    clickHandler = priceClickHandler
    cls = style['price-icon']
  }
  const rows = new Array(4)

  return m(`ul.${style['menu-rows']}`, [
    _.map(rows, (row, index) => {
      const numberOfIcons = index + 1
      const iconsArr = new Array(numberOfIcons)
      return m(`li.${style['menu-row']}`, { onclick: clickHandler.bind(ctrl, index) }, [
        m(`ul`, [
          _.map(iconsArr, (_, i) => {
            if (i === 3)
              return m(`li.${style['plus-icon']}`, { key: i }, m('span', plusIcon))
            return m(`li.${cls}`, { key: i }, m('span', icon))
          })
      ])])
    })
  ])
} 

const renderTypeMenu = function(categories) {
  const ctrl = this

  return m(`ul.${style['food-menu']}`, [
    _.map(categories(), (category, index) => {
      // const numberOfIcons = index + 1
      // const iconsArr = new Array(numberOfIcons)
      return m(`li.${style['menu-row']}`, m('span', { class: category.active() ? `${style['active']}` : '', onclick: categoryClickHandler.bind(ctrl, category.name()) }, category.name()))
    })
  ])

  // return _.map(, (category) => {
  //   //code
  // })
}

const renderFilterMenu = function(args) {
  const ctrl = this
  const parentCtrl = args

  return m(`.${style['filter-menu']}`, [
    (ctrl.clickedFilterSection() === 'rating') ? renderOptions.call(ctrl, 'rating') : '',
    (ctrl.clickedFilterSection() === 'type') ? renderTypeMenu.call(ctrl, ctrl.categories) : '',
    (ctrl.clickedFilterSection() === 'price') ? renderOptions.call(ctrl, 'price') : ''
      
    ])
}

const fltr = function() {
  const ctrl = this

  const unfilteredRestaurants = m.prop(_.cloneDeep(ctrl.restaurants()))

  const filter = {
    status: m.prop(0),
    active: m.prop({
      price: m.prop(0),
      rating: m.prop(0),
      category: m.prop([])
    }),
  }

  const filterPrice = function(rests) {
    return _.filter(rests(), (restaurant) => {
            const price = filter.active().price()
            if (price < 3) {
              return restaurant.priceTier() === price
            } else {
              return restaurant.priceTier() > 3
            }
          })
  }

  const filterRating = function(rests) {
    return _.filter(rests(), (restaurant) => {
            const rating = Math.floor(restaurant.rating)
            const activeRating = filter.active().rating()
            if (rating < 3) {
              if( activeRating <= rating && activeRating + 1 < rating ) {
                return 1
              }
            } else {
              return rating > 3
            }
          })
  }

  const filterCategory = function(rests, category) {

    return _.filter(rests(), (restaurant) => {
            const index = _.indexOf(restaurant.categories, category)
            console.log('restaurants categories')
            console.log(restaurant.categories)
            console.log('INDEX OF CATEGORY IN RESTARANTS CATEGORY ARRAY')
            console.log(index)
            if(index !== -1) {
              return 1
            }
          })

  }

  const applyFilter = function() {
      
    const rests = m.prop(_.cloneDeep(unfilteredRestaurants()))
    console.log(rests())

    if (filter.active().price()) {
      rests(filterPrice(rests))
    }

    if (filter.active().rating()) {
      rests(filterRating(rests))
    }

    if (filter.active().category().length) {
      _.forEach(filter.active().category(), (category) => {
        console.log(category)
        rests(filterCategory(rests, category))
      })
    }

    ctrl.restaurants(rests())
    m.redraw()
  }

  filter.reset = function() {
    ctrl.restaurants(_.cloneDeep(unfilteredRestaurants()))
  }

  return {
    add(type, value) {
      console.log( type, value )
      switch(type) {
        case 'price':
          if(filter.active().price()) {
            if(filter.active().price() !== value) {
              filter.active().price(value)
              applyFilter()
            } else {
              // applyFullFilter
            }
          } else {
            filter.active().price(value)
            // apply price filter give .. ctrl.restaurants()
            filterPrice(ctrl.restaurants)
            m.redraw()
          }
          break
        case 'rating':
          if(filter.active().rating()) {
            if(filter.active().rating() !== value) {
              filter.active().rating(value)
              applyFilter()
            } else {
              // applyFullFilter
            }
          } else {
            filter.active().rating(value)
            // apply rating filter give .. ctrl.restaurants()
            filterRating(ctrl.restaurants)
            m.redraw()
          }
          break
        case 'category':
          console.log(filter.active().category().length)
          if (filter.active().category().length) {
            const index = _.indexOf(filter.active().category(), value)
            console.log('INDEX OF CATEGORY IN ACTIVE FILTER CATEGORY')
            console.log(index)
            if (index === -1) {
              // apply category filter
              filter.active().category().push(value)
              ctrl.restaurants(filterCategory(ctrl.restaurants, value))
              m.redraw()
            } else {
              _.pullAt(filter.active().category(), index)
              // applyFullFilter
              applyFilter()
            }

          } else {
            filter.active().category().push(value)
            // apply category filter, pass ctrl.restaurnts()]
            // filterCategory(ctrl.restaurants, value)
            // console.log(filterCategory(ctrl.restaurants, value))
            ctrl.restaurants(filterCategory(ctrl.restaurants, value))
            m.redraw()
          }
          break
        default:
          break
      }
    }
  }
}

const FilterMenu = {

  controller(args) {
    const Ctrl = {
      restaurants: args.restaurants,
      categories: args.categories,
      clickedFilterSection: m.prop('type')
    }
    Ctrl.filter = fltr.call(Ctrl)
    return Ctrl
  },
  view(ctrl, args) {
    return renderFilterMenu.call(ctrl, args)
  }

}

export default FilterMenu