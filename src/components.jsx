import React, { useState } from 'react'
import { connect } from 'react-redux'

import { API_BASE, fetchAddresses, fetchEvents, fetchSelectedEventDetails } from './thunks'
import { eventGuid, canSelectEvents, undeletedAddresses } from './selectors'
import { actions } from './redux-store'
import Modal from 'react-modal'
import mapStateToProps from 'react-redux/lib/connect/mapStateToProps';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '2px solid gray'
  }
}


//--> User select form
const submitHandler = (dispatch, userId) => (e) => {
  e.preventDefault()

  dispatch({
    type: actions.CHANGE_SELECTED_USER_ID,
    payload: userId
  })
}

const changeHandler = (dispatch) => (e) => {
  const val = e.target.value

  dispatch({
    type: actions.CHANGE_SELECTED_USER_ID,
    payload: val
  })
  dispatch(fetchAddresses(val))
}

let UserSelectForm = ({ dispatch, userIds, selectedUserId }) => {

  return <form action={`${API_BASE}/users/${selectedUserId}/addresses`} method="GET" onSubmit={submitHandler(dispatch, selectedUserId)}>
    <select onChange={changeHandler(dispatch)} value={selectedUserId || ''}>
      <option>Select User ID</option>
      {userIds.map((id) => {
        return <option key={id} value={id}>{id}</option>
      })}
    </select>
  </form>
}
UserSelectForm = connect(state => state)(UserSelectForm)



//--> Events list
const handleEventToggle = (dispatch, guid) => (e) => {
  dispatch({
    type: actions.TOGGLE_EVENT_SELECTION,
    payload: guid
  })
}
let Event = ({ dispatch, event, guid, isSelected, isEnabled }) => {
  return <li>
    <input id={guid} type="checkbox" checked={isSelected} disabled={!isEnabled} onChange={handleEventToggle(dispatch, guid)} />
    <label htmlFor={guid}>
      {event.type} | {event.created_at}
    </label>
  </li>
}
Event = connect((state, ownProps) => {
  const isSelected = !!state.selectedEvents[ownProps.guid]
  return {
    isSelected : isSelected,
    isEnabled : isSelected || canSelectEvents(state.selectedEvents)
  }
})(Event)

let ComparedEvents = ({dispatch, displayObject, selectedEventDetails}) => {
  return <div>
    <table>
      <thead>
      <tr>
        <th colSpan="2">Event 1</th>
        <th colSpan="2">Event 2</th>
      </tr>
      </thead>
      <tbody>
      {/*{displayObject.map( row => {*/}
      {/*  return <tr>*/}
      {/*    <td>{row[ 0 ]}</td>*/}
      {/*    <td>{row[ 1 ]}</td>*/}
      {/*    <td>{row[ 2 ]}</td>*/}
      {/*    <td>{row[ 3 ]}</td>*/}
      {/*  </tr>*/}
      {/*} )}*/}
      </tbody>
    </table>
    <button onClick={()=>closeModal(dispatch)}>close</button>
  </div>
}
ComparedEvents = connect((state, ownProps) => {
  const displayObject = {} //[state.selectedEventDetails[0].entries(), state.selectedEventDetails[1].entries()]
  console.log('[ComparedEvents]',state.selectedEventsDetails)

  return {
    displayObject : displayObject
  }
})(ComparedEvents)


const handleCompareClick = (dispatch) => (e) => {
  e.preventDefault()
  /*
   * Your code here (and probably elsewhere)
   *
   *
   * We've provided a thunk function to fetch
   * event data.
   * Find it in thunks.js, lines 81-107,
   * and referenced in the comment below on line 78.
   */



  dispatch(fetchSelectedEventDetails()).then(events => {
    dispatch({
      type: actions.OPEN_MODAL,
      payload: events
    })



    /*
    1. sort objects by keys
    2. create display object
    3. compare keys and values while rendering
     */

    console.log('[fetchSelectedEventDetails]', events)
  })
}

const closeModal = (dispatch) => (e) => {
  e.preventDefault()

  dispatch({
    type: actions.CLOSE_MODAL,
    payload: ''
  })
}



let EventList = ({dispatch, canCompare, events}) => {
  return <>
    <button onClick={handleCompareClick(dispatch)} disabled={!canCompare}>Compare</button>
    <ul>
      {events.map((event) => {
        return <Event event={event} key={eventGuid(event)} guid={eventGuid(event)} />
      })}
    </ul>
  </>
}
EventList = connect(state => {
  return { canCompare : Object.keys(state.selectedEvents).length > 1 }
})(EventList)



//--> Addresses list
const handleAddressClick = (dispatch, id) => (e) => {
  e.preventDefault()

  dispatch({
    type: actions.REQUEST_ADDRESS_DETAILS,
    payload: id
  })
  dispatch(fetchEvents(id))
}


let Address = ({ dispatch, addressJson, isSelected }) => {
  return <li onClick={handleAddressClick(dispatch, addressJson.id)} className={isSelected ? 'selected' : ''}>
    <pre>{JSON.stringify(addressJson, undefined, 2)}</pre>
  </li>
}
Address = connect((state, ownProps) => {
  return { isSelected : state.selectedAddressId === ownProps.addressJson.id }
})(Address)



//--> App wrapper
let App = ({ addresses, events, userIds, selectedUserId, selectedAddressId, selectedEventDetails, error, modalOpen} ) => {

  return <>
    {error ? <p className="error">{error}</p> : ''}
    {userIds && userIds.length ?
      <UserSelectForm userIds={userIds} selectedUserId={selectedUserId} />
    : ''}
    <div className="addresses">
      <h2>Address Information</h2>
      {addresses && addresses.length
        ? <ul>
            {addresses.map((address) => {
              return <Address key={address.id} addressJson={address} />
            })}
          </ul>
        : <p>{selectedUserId ? 'No addresses found.' : 'Choose a user ID from the dropdown above.'}</p>
      }
    </div>
    <div className="events">
      <h2>Events</h2>
      { events && events.length
        ? <EventList events={events} />
        : <p>{selectedAddressId ? 'No events found.' : 'Select an address to see events'}</p>
      }
    </div>
    <Modal
        isOpen={modalOpen}
        style={modalStyles}
        contentLabel="Event Comparison"
    >

     <ComparedEvents selectedEventDetails={selectedEventDetails}/>
    </Modal>
  </>
}
App = connect(state => {
  return {
    addresses : undeletedAddresses(state.addresses),
    ...state
  }
})(App)


export { App }
