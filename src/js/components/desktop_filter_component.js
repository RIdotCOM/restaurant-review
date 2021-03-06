'use strict'

import m from 'mithril'
import _ from 'lodash'

import 'polythene/common/object.assign';

//helpers
import fltr from '../helpers/filter.js'

//services
import Aria from '../services/aria.js'

//style
import style from '../../css/desktop-filter.scss'

//polythene
import menu from 'polythene/menu/menu'
import list from 'polythene/list/list'
// import listTile from 'polythene/list-tile/list-tile'
import btn from '../polythene/button.js'
import iconBtn from 'polythene/icon-button/icon-button'

//custom polythene elements
import listTile from '../polythene/list-tile.js'

import gIconBack from 'mmsvg/google/msvg/hardware/keyboard-backspace';

import FilterMenuComponent from './filter_menu_component.js'

//TODO
// have an overlay that will close this modal by seeting permanent to false
// upon being clicked

//this components sets up a window listener for esc and deregister specific one using named handler

//conditionally display conent of the menu

const handleMiniButtonClick = function(type) {
  const ctrl = this

  if (type === 'clear') {

    console.log('CLICKE CLEAR BUTTON')
    console.log(ctrl)
    ctrl.filter.reset()
    ctrl.open(!ctrl.open())
    ctrl.clickedFilterSection('')
    return
  }

  console.log(type)

  if (type === ctrl.clickedFilterSection()) {
    ctrl.clickedFilterSection('')
  } else {
    ctrl.clickedFilterSection(type)
  }
}


// 'data-aria-id': `${ariaParent} ${ariaChild}`,
// tabIndex: Aria.tabIndexDir[ariaParent] ? Aria.tabIndexDir[ariaParent][ariaChild] : -1,
// // onkeyup: Aria.handleAriaKeyPress.bind(ctrl, ariaParent, ariaChild),
// config: filterButtonConfig.bind(ctrl,
//   {
//     ariaParent,
//     ariaChild
//   }
// )

// 'data-aria-id': `${ariaParent} ${ariaChild}`,
// tabIndex: Aria.tabIndexDir[ariaParent] ? Aria.tabIndexDir[ariaParent][ariaChild] : -1,
// // onkeyup: Aria.handleAriaKeyPress.bind(ctrl, ariaParent, ariaChild),
// config: filterButtonConfig.bind(ctrl,
//   {
//     ariaParent,
//     ariaChild
//   }
// ),

// const filterMenuConfig = function(parent, child, el, init) {
//   if(!init) {
//     el.setAttribute('data-aria-id', `${parent} ${child}`)
//   }
// }

const tileConfig = function(ariaObject, el, init) {
  if (!init) {
    Aria.register(ariaObject)
  }
}

const tiles = ['Rating', 'Category', 'Price', 'Clear']

const fm = function(parent) {
  const ctrl = this
  return m.component(list, {
    tiles: [
      _.map(tiles, (tileType) => {
        //code
        return m.component(listTile,
          Object.assign(
            {
              key: tileType,
              config: tileConfig.bind(null,
                {
                  ariaParent: parent,
                  ariaChild: tileType.toLowerCase()
                }
              )
            },
            {
              customAttrs: {
                'data-aria-id': `${parent} ${tileType.toLowerCase()}`,
                tabIndex: Aria.tabIndexDir[parent] ? Aria.tabIndexDir[parent][tileType.toLowerCase()] : -1,
                title: `${tileType} filter, ${Aria.announcements.selectAnnouncement}`,
                role: 'menuitem'
              }
            },
            {
              title: tileType,
              ink: true,
              events: {
                onclick: handleMiniButtonClick.bind(ctrl, tileType.toLowerCase()),
                onkeyup: (e) => {
                  // e.stopPropagation()
                  if(e.keyCode === 13) {
                    handleMiniButtonClick.call(ctrl, tileType.toLowerCase())

                    if (tileType.toLowerCase() === 'clear') {
                      e.stopPropagation()
                      Aria.back(parent, tileType.toLowerCase())
                    }
                  } else if ( e.keyCode === 27 ) {
                    ctrl.clickedFilterSection('')
                    ctrl.open(false)
                    Aria.back(parent, tileType.toLowerCase())
                  }
                }
              }
            }
          )
        )
      })
    ]
  })
}

const filterButtonConfig = function(ariaObject, el, init) {
  if(!init) {
    Aria.register(ariaObject)
  }
}

const DesktopFilter = {
  controller( { restaurants, unfilteredRestaurants, categories } ) {
    const Ctrl = {
      open: m.prop(false),
      clickedFilterSection: m.prop(''),
      restaurants,
      unfilteredRestaurants,
      categories
    }
    Ctrl.filter = fltr.call(Ctrl)

    return Ctrl
  },
  view(ctrl, { restaurants, unfilteredRestaurants, categories, ariaParent, ariaChild }) {
    return m(`.${style['container']}`,
      {
        // tabIndex: -1,
        // autofocus: true
        'data-aria-id': `${ariaParent} ${ariaChild}`,
        tabIndex: Aria.tabIndexDir[ariaParent] ? Aria.tabIndexDir[ariaParent][ariaChild] : -1,
        // onkeyup: Aria.handleAriaKeyPress.bind(ctrl, ariaParent, ariaChild),
        config: filterButtonConfig.bind(ctrl,
          {
            ariaParent,
            ariaChild
          }
        ),
        onkeyup: (e) => {
          if(e.keyCode === 13) {
            ctrl.open(true)
          }
        },
        'role': 'menu',
        'title': `Filter ${Aria.announcements.selectAnnouncement}`,
        'aria-label': `Filter ${Aria.announcements.selectAnnouncement}`,
        'aria-haspopup': true
      },
      [
        m(`.${style['overlay']}`,
          {
            class: ctrl.open() ? `${style['open']}` : `${style['closed']}`,
            onclick: () => {
              ctrl.open(false)
              ctrl.clickedFilterSection('')
            }
          }
        ),
        m.component(btn, {
          label: 'Filter',
          id: 'button',
          raised: false,
          events: {
            onclick: () => (ctrl.open(true))
          },
          customAttrs: {
            tabIndex: -1
          }
        }),
        m.component(menu, {
          target: 'button', // to align with the link
          offset: -100, // horizontally align with link
          id: 'filter-menu-container',
          show: ctrl.open(), // should the menu be open or closed?
          didHide: () => (ctrl.open(false)), // called after closing
          permanent: ctrl.open(),
          size: 4,
          origin: 'top-left',
          // class: ctrl.open() ? `${style['filter-menu-open']}` : `${style['filter-menu-closed']}`,
          class: !ctrl.open() ? `${style['closed']}` : '',
          content: ctrl.clickedFilterSection() ?
            m(list, {
              tiles: [
                m(listTile, {
                  ink: true,
                  id: `${style['overflow-visible']}`,
                  content: [
                    m(`.${style['back-tile']}`,
                      [
                        m(`.${style['icon-container']}`,
                          m.component(iconBtn, {
                            icon: {
                              msvg: gIconBack
                            },
                            events: {
                              onclick: () => ctrl.clickedFilterSection('')
                            }
                          })
                        ),
                        m(`.${style['text-container']}`,
                          [
                            m(`.${style['flex']}`),
                            m('span', 'Back'),
                            m(`.${style['flex']}`)
                          ]
                        )
                        
                      ]
                    )
                  ]
                }),
                m(listTile, {
                  id: 'filter-component-container',
                  content: m(FilterMenuComponent,
                    {
                      clickedFilterSection: ctrl.clickedFilterSection,
                      restaurants,
                      categories,
                      unfilteredRestaurants,
                      filter: ctrl.filter,
                      open: ctrl.open
                    }
                  )
                })
              ]
            }) :
            fm.call(ctrl, ariaChild)
        })
      ]
    )
  }
}

export default DesktopFilter