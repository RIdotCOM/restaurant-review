'use strcit'

import m from 'mithril'

import ReviewsComponent from './desktop_reivews_component'
import WritingComponent from './writing_component.js'

import style from '../../css/content-component.scss'

const ContentComponent = {
  controller() {
    // return {
    //   writingActive
    // }
  },
  view(ctrl, { restaurant, writingActive, review, indexDBReviews }) {
    return m(`.${style['content-component']}`,
      {
        style: {
          // overflow-x: ctrl.writingActive() : 
        }
      },
      [ 
        m(`.${style['reviews-component-container']}`,
          {
            class: !writingActive() ? `${style['visible']}` : ''
          },
          [
            m(ReviewsComponent, {
              reviews: restaurant.reviews,
              indexDBReviews
            })
          ]
        ),
        m(`.${style['writing-component-container']}`,
          {
            class: writingActive() ? `${style['visible']}` : ''
          },
          [
            m(WritingComponent,
              {
                review,
                writingActive
              }
            )
          ]
        )
      ]
    )  
  }
}

export default ContentComponent