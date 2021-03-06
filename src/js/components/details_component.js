'use strict'

import m from 'mithril'
import _ from 'lodash'
import moment from 'moment'
import Velocity from 'velocity-animate'

//helpers
import DB from '../services/db.js'
import dimensionsHelper from '../helpers/screen-dimensions.js'
import animationHelper from '../helpers/animation-helper.js'

import runDelayedLoop from '../../js/helpers/delayed-loop.js'

//COMPONENTS
import Writing from './writing_component.js'

//styles
import style from '../../css/details.scss'

//POLYTHENED
import fab from 'polythene/fab/fab'
import editIcon from 'mmsvg/google/msvg/editor/mode-edit'
import doneIcon from 'mmsvg/google/msvg/action/done'
import clearIcon from 'mmsvg/google/msvg/content/clear'

//icons
import downArrowIcon from '../../icons/rr_down_arrow.js'
import fullStar from '../../icons/rr_review_full_star.js'
import emptyStar from '../../icons/rr_review_empty_star.js'
import closeIcon from 'mmsvg/google/msvg/content/clear'


// dimensiosn are applied dynamically in css rather than on initiation
// the rest of the styles is set with CSS file
const setStyle = function() {
  // if (!d)
  //   return

  const dimensions = dimensionsHelper.getDimensions('list-container')

  // const position = 'absolute'
  // const background = 'white'
  // const zIndex = 1
  // const height = `${dimensions.card.height() + 16}px`
  const height = `calc(100% - ${dimensions.height()}px)`
  const width = `100%`
  const top = `${dimensions.height() - 8}px`

  // TODO - DELETE

  return {
    height,
    width,
    top,
  }
}


// export as helper!
const renderStars = (rating) => {

  const stars = new Array(rating).fill(true)

  while( stars.length < 5) {
    stars.push(false)
  }

  return stars
} 

const toggleHoursSection = function(hoursOpen) {
  hoursOpen(!hoursOpen())
}

const detailsConfig = function(el, inited, context) {
  if (!inited) {
    Velocity(
      el,
      {
        opacity: 1
      },
      {
        duration: '300ms'
        // delay: '600ms'
      }
    ),
    context.onunload = function() {
      // velocity end 
    }
  }
}

const headerConfig = function(el, inited) {
  if (!inited) {
    Velocity(
      el,
      {
        opacity: 1
      },
      {
        duration: '300ms',
        // delay: '600ms'
        complete() {
          const divs = document.getElementsByClassName('single-review');
          Velocity(
            divs[0],
            {
              opacity: 1
            },
            {
              duration: '300ms',
              // stagger: '300ms',
              delay: '3s'
            }
          )
        }
      }
    )
  }
}

const reviewItemConfig = function(el, inited) {
  if(!inited) {
    const children = el.children
    const childrenLenght = children.length

    var i = 0

    function loop () {
       setTimeout(function () {
          Velocity(
            children[i],
            {
              opacity: 1
            },
            {
              duration: '300ms',
            }
          )
          i++
          if (i < childrenLenght) {
            loop()
          }
       }, 25)
    }

    loop()
  }
}

const closeButtonHandler = function() {

  // this is args passed from parent component
  const ctrl = this

  ctrl.detailsOpen(false)

  const el = ctrl.element()

  const { height, width } =  animationHelper.getSize()
  
  Velocity(
    el.firstChild,
    {
      margin: '8px 8px 0px 8px',
      height: `${height()}px`,
      width: `${width()}px`
    },
    { duration: 300,
      delay: 0,
      easing: [0.4, 0.0, 0.2, 1]
    });
  Velocity(
    el,
    { 'translateY': 0, translateX: 0 },
    { duration: 300,
      delay: 100,
      easing: [0.4, 0.0, 0.2, 1],
      complete() {
        ctrl.isCardExpanded(false)
        runDelayedLoop(ctrl.restaurants(), ctrl.currentElementIndex(), true)
      }
    }
  )
}

const handleWritingFabClick = function(type) {
  const ctrl = this

  // if edit -> do something
  if (type === 'edit') {
    ctrl.writingSectionActive(true)
  } else {
    // post reveiw to indexDB
    DB.saveReview(ctrl.review().props).then(_ => {
      ctrl.closeWritingSection()
    }).catch(err => {

      console.log('YO BRO, NO GOOD!')
      console.log(err)

    })
  }
  

  // if done => do something else

  
  

}

// BUTTONS
const writingMainActionButton = function(type) {
  const ctrl = this

  const icon = (type === 'edit') ? editIcon : doneIcon
  
  return m.component(fab, {
    icon: {
      msvg: icon
    },
    class: [style['writing-action-button'], style[type]].join(' '),
    events: {
      onclick: handleWritingFabClick.bind(ctrl, type)
    }
  })
}


// THIS CAN PROBABLY BE INCLUDED INTHE CANTECACTIONBUTTON DECLARATION BELLOW
const handleClearClick = function() {
  const ctrl = this

  ctrl.closeWritingSection()
}

// TODO finish this button
const cancelActionButton = function() {
  const ctrl = this
  return m.component(fab, {
    icon: {
      msvg: clearIcon
    },
    mini: true,
    class: style['cancel-action-button-mini'],
    events: {
      onclick: handleClearClick.bind(ctrl)
    }
  })
}


//export as helper!
const renderReview = (review, indexDB) => {
  return m(`li.${style['review-item']}.single-review`, { key: review.time, style: { opacity: indexDB ? 1 : 0 } }, [
                    m(`.${style['line-one']}`, [
                      m('h4', review.author_name),
                      m(`h4`, moment(review.time * 1000).format('DD/MM/YYYY')) 
                    ]),
                    m(`.${style['line-two']}`, [
                      m(`.${style['clear']}`),
                      m(`ul.${style['user-stars']}`, _.map(renderStars(review.rating), (star, i) => {
                        switch(star) {
                          case true:
                            return m(`li.${style['star']}`, { key: i }, fullStar)
                          case false:
                            return m(`li.${style['star']}`, { key: i }, emptyStar)
                        }
                      })),
                      m(`p`, review.text) 
                    ])
                  ])
}


//extract as helper
const closeWritingSection = function() {
  const ctrl = this

  if(ctrl.review().valid()) {
    const review = JSON.stringify(ctrl.review().props())
    const arr = ctrl.indexDBReviews()
    arr.push(JSON.parse(review))
    ctrl.indexDBReviews(arr)
  }
  
  ctrl.review().valid(false)
  ctrl.review().props().author_name('')
  ctrl.review().props().text('')
  ctrl.review().props().time('')
  ctrl.review().props().rating('')

  ctrl.writingSectionActive(false)

  m.redraw()  
}

const cancelButtonConfig = (el, inited) => {
  if(!inited) {
    el.style.transition = 'opacity .3s ease-in-out'
    setTimeout(() => {
      el.style.opacity = 1
    }, 500)
  }
}

export default {
  controller(args) {
    const indexDBReviews = m.prop([])
    DB.getReviews()
      .then((reviews) => {
        _.forEach(reviews, (r) => {
          const review = JSON.parse(r.payload)
          if(review.place_id === args.restaurant().place_id) {
            const newArr = indexDBReviews()
            newArr.push(review)
            indexDBReviews(newArr)
          }
        })
        // indexDBReviews()
        m.redraw()
      })

    const Ctrl = {
      hoursOpen: m.prop(false),
      detailsOpen: args.detailsOpen,
      writingSectionActive: m.prop(false),
      review: m.prop({
        props: m.prop({
          author_name: m.prop(''),
          text: m.prop(''),
          time: m.prop(''),
          rating: m.prop(''),
          place_id: args.restaurant().place_id
        }),
        valid: m.prop(false)
      }),
      indexDBReviews,
      restaurant: args.restaurant
    }
    Ctrl.closeWritingSection = closeWritingSection.bind(Ctrl)
    return Ctrl
  },
  view(ctrl, args) {
    return m(`.${style['photo']}`, [
        m(`.${style['details']}`, { style: setStyle() }, [
          // m(`.${style['ptoto']}`, { style: getPhotoStyle.call(null, args.dimensions) }),

          // HEADER
          m(`.${style['header']}`, { style: { opacity: 0 }, class: ctrl.hoursOpen() ? 'open' : '', config: headerConfig }, [
            m(`.${style['line-one']}`, [
              m('h3', 'Reviews'),
              m(`.${style['header-opening-hours']}`, { onclick: toggleHoursSection.bind(null, ctrl.hoursOpen) } ,[
                m('h3', 'Opening Hours'),
                m(`.${style['down-arrow']}`, { class: ctrl.hoursOpen() ? 'open' : '' }, downArrowIcon)
              ])
            ]),
            m(`.${style['opening-hours-section']}`, { class: ctrl.hoursOpen() ? 'visible' : '' } ,[
              m(`ul.${style['opening-hours']}`, [
                _.map(args.restaurant().opening_hours, (line) => {
                  return m(`li.${style['time']}`, line)
                })
              ]),
              m(`.${style['clear']}`)
            ])
          ]),


          ctrl.writingSectionActive() ? m.component(Writing, {
            review: ctrl.review,
            writingActive: ctrl.writingSectionActive
          }) :
            
            //REVIEWS
            m(`.${style['reviews']}`, [
              m(`ul.${style['reviews-container']}`, { config: reviewItemConfig } ,[
                _.map(args.restaurant().reviews, (review) => {
                  return renderReview(review)
                }),
                _.map(ctrl.indexDBReviews(), (review) => {
                  return renderReview(review, true)
                })
              ])
            ]),

          m(`.${style['close-button']}`, { onclick: closeButtonHandler.bind(args) }),
          m(`.${style['close-icon']}`, closeIcon),


          //FAB
          ctrl.detailsOpen() ? m(`.${style['writing-fab']}`, [
            ctrl.review().valid() ? writingMainActionButton.call(ctrl, 'done') : writingMainActionButton.call(ctrl, 'edit'),
            // cancel fab is displaying with little delay, 
            // set in config
            ctrl.writingSectionActive() ? m('', { config: cancelButtonConfig, style: { opacity: 0 } }, cancelActionButton.call(ctrl)) : ''
          ]) : ''
        ])
      ])
  }
}