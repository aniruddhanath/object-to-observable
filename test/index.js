var should = require('chai').should(),
  State = require('../index');

describe('#create', () => {
  it('current state matches', () => {
    let data = { range: { start: 1, end: 5 }, visible: true },
      state = State.create(data),
      cs = state.getState();
    cs.range.start.should.equal(data.range.start);
    cs.range.end.should.equal(data.range.end);
    cs.visible.should.equal(data.visible);
    (Object.keys(cs).length).should.equal(Object.keys(data).length);
  });
});

describe('#on', () => {
  it('typeof unsub is function', () => {
    let data = { range: { start: 1, end: 5 }, visible: true },
      state = State.create(data);
    let unsub = state.on('range', () => {
      // nothing here
    });
    (typeof unsub).should.equal('function');
    unsub();
  });

  it('detect any change in values', () => {
    let data = { range: { start: 1, end: 5 }, visible: true },
      state = State.create(data);
    let unsub = state.on('range', (old_value, new_value) => {
      (old_value.start).should.equal(1);
      (new_value.start).should.equal(2);
    });
    state.create('range.start', 2);
  });
});

describe('#prop', () => {
  it('values updated via prop', () => {
    let data = { range: { start: 1, end: 5 }, visible: true },
      state = State.create(data);
    let v = state.prop('visible', false);
    (v).should.equal(false);
  });

  it('values added via prop', () => {
    let data = { range: { start: 1, end: 5 }, visible: true },
      state = State.create(data),
      rt = state.prop('range.type', { absolute: true }),
      cs = state.getState();
    (rt.absolute).should.equal(true);
    (cs.range.start).should.equal(1);
    (cs.range.end).should.equal(5);
    (cs.visible).should.equal(true);
    (cs.range.type.absolute).should.equal(true);
  });
});

describe('#lock', () => {
  it('values updated using lock-unlock', () => {
    let data = { range: { start: 1, end: 5 }, visible: true },
      state = State.create(data);

    state
      .lock()
      .prop('range.start', 13) 
      .prop('range.end', 14) 
      .unlock();

    let cs = state.getState();
    (cs.range.start).should.equal(13);
    (cs.range.end).should.equal(14);
  });
});
