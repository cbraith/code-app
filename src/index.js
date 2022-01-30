import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from './redux-store'
import { fetchUserIds } from './thunks'
import { App } from './components.jsx'

import './index.css'

/**
 *
 * App initialization
 *
 */
const rootElement = document.getElementById('root')
const requestInterval = 10000

let fetchUserIdsId = setInterval(handleUserIdFetch, requestInterval)

store.dispatch(fetchUserIds())

function handleUserIdFetch() {
  let state = store.getState()

  if (state.shouldFetchUserIds && state.userRequestCount > 0) {
    console.log(
      `[fetchUserIds] Failed to load user ids. Attempts remaining: ${state.userRequestCount}`
    )
    store.dispatch(fetchUserIds())
  } else {
    clearInterval(fetchUserIdsId)
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
