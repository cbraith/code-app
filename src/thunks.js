import { actions } from './redux-store'
import HttpStatus from 'http-status-codes'

// was set to port 5000 but address server runs at 27606
const API_BASE = 'http://localhost:27606'

const fetchUserIds = () => dispatch => {
  return fetch(`${API_BASE}/user_ids`)
    .then(
      response => {
        if (response.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
          return dispatch({
            type: actions.FETCH_USERS_ERROR
          })
        } else if (
          response.status >= HttpStatus.BAD_REQUEST &&
          response.status < HttpStatus.INTERNAL_SERVER_ERROR
        ) {
          return dispatch({
            type: actions.FETCH_USERS_ISSUE
          })
        }

        return response.json()
      },
      err => {
        throw err
      }
    )
    .then(
      data => {
        return dispatch({
          type: actions.FETCH_USERS_SUCCESS,
          payload: data
        })
      },
      err => {
        return dispatch({
          type: actions.FETCH_USERS_ERROR
        })
      }
    )
}

const fetchAddresses = userId => dispatch => {
  return fetch(`${API_BASE}/users/${userId}/addresses`)
    .then(
      response => {
        if (!response.ok) {
          return dispatch({
            type: actions.FETCH_ADDRESS_ERROR
          })
        }

        return response.json()
      },
      err => {
        throw err
      }
    )
    .then(
      data => {
        return dispatch({
          type: actions.FETCH_ADDRESS_SUCCESS,
          payload: data
        })
      },
      err => {
        return dispatch({
          type: actions.FETCH_ADDRESS_ERROR
        })
      }
    )
}

const fetchEvents = addressId => dispatch => {
  return fetch(`${API_BASE}/addresses/${addressId}/events`)
    .then(
      response => {
        if (!response.ok) {
          return dispatch({
            type: actions.FETCH_EVENTS_ERROR
          })
        }

        return response.json()
      },
      err => {
        throw err
      }
    )
    .then(
      data => {
        return dispatch({
          type: actions.FETCH_EVENTS_SUCCESS,
          payload: data
        })
      },
      err => {
        return dispatch({
          type: actions.FETCH_EVENTS_ERROR
        })
      }
    )
}

const fetchSelectedEventDetails = () => (dispatch, getState) => {
  const { selectedEvents, events } = getState()

  return Promise.all(
    events
      .filter(event => {
        return !!selectedEvents[event.created_at + '-' + event.id]
      })
      .map(event => {
        return fetch(API_BASE + event.url).then(
          response => {
            if (!response.ok) {
              throw new Error('Failed request')
            }
            return response.json()
          },
          err => {
            throw err
          }
        )
      })
  )
    .then(values => {
      return dispatch({
        type: actions.EVENT_DETAILS_SUCCESS,
        payload: values
      })
    })
    .catch(err => {
      return dispatch({
        type: actions.EVENT_DETAILS_ERROR,
        payload: err
      })
    })
}

export {
  API_BASE,
  fetchUserIds,
  fetchAddresses,
  fetchEvents,
  fetchSelectedEventDetails
}
