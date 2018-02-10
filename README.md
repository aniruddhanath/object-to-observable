# object-to-observable
Converts JavaScript object into observable and provides API to manipulate the state

## Usage

```js
// import library
State = require('State');

// initial step in converting
let state = new State({ name: "Nath", hobby: { instrument: 'guitar' } });

// get the current state
state.getState();

// add listener on `state` for namespace `hobby`
let unsub = state.on('hobby', (old_value, new_value) => 
  console.log(`hobby changed from ${JSON.stringify(old_value)} to ${JSON.stringify(new_value)}`)
);

// append more properties
state.create('hobby.sport', 'swimming');

// get the hobby property using `prop`
state.prop('hobby');

// update using lock
state
  .lock()
  .prop('name', 'John')
  .prop('profession', 'Developer')
  .unlock();

// remove listener
unsub();
```
