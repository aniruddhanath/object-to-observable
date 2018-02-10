# object-to-observable
Converts JavaScript object into observable and provides API to manipulate the state

## Usage

Import library
```js
State = require('State');
```

Initial step in converting
```js
let state = new State({ name: "Nath", hobby: { instrument: 'guitar' } });
```

Get the current state
```js
state.getState();
```

Add listener on `state` for namespace `hobby`
```js
let unsub = state.on('hobby', (old_value, new_value) => 
  console.log(`hobby changed from ${JSON.stringify(old_value)} to ${JSON.stringify(new_value)}`)
);
```

Append more properties
```js
state.create('hobby.sport', 'swimming');
```

Get the hobby property using `prop`
```js
state.prop('hobby');
```

Update using lock
```js
state
  .lock()
  .prop('name', 'John')
  .prop('profession', 'Developer')
  .unlock();
```

Remove listener
```js
unsub();
```