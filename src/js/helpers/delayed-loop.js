'use strict'

import m from 'mithril'
import _ from 'lodash'

export default function(data, index, status) {
  const array = data
  const before = _.slice(array, 0, index)
  const beforeLenght = before.length
  const after = _.slice(array, index)
  const afterLenght = after.length

  var bi = beforeLenght - 1

  function beforeLoop () {
     setTimeout(function () {
        before[bi].elementInfo.visible(status)  
        m.redraw()
        bi--
        if (bi >= 0 ) {
          beforeLoop()
        }
     }, 75)
  }

  beforeLoop()  

  var ai = 1

  function afterLoop () {
     setTimeout(function () {
        after[ai].elementInfo.visible(status)
        m.redraw()
        ai++
        if (ai < afterLenght) {
           afterLoop()
        }
     }, 75)
  }

  afterLoop()
}