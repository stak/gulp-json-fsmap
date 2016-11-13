const assert = require('assert');
const File = require('gulp-util').File;
const fsmap = require('../');
const PLUGIN_NAME = 'gulp-json-fsmap';

describe('gulp-json-fsmap', () => {
  // container for mapped files
  const m = new Map();
  beforeEach(() => {
    m.clear();
  });

  // shorthands
  function wrap(src) {
    return new File({
      path: 'dir/test.json',
      cwd: 'dir/',
      base: 'dir/',
      contents: new Buffer(JSON.stringify(src)),
    });
  }

  function collect(newFile) {
    assert(Boolean(newFile));
    assert(Boolean(newFile.contents));
    assert(newFile.cwd === 'dir/');
    assert(newFile.base === 'dir/');

    m.set(newFile.path, newFile.contents.toString());
  }

  function expect(expected, cb) {
    const keys = Object.keys(expected);

    return () => {
      assert(m.size === keys.length);
      keys.forEach((k) =>
        assert(m.get(`dir/${k}.json`) === JSON.stringify(expected[k])));

      cb();
    };
  }

  function expectPluginError(stream, done) {
    let reported = false;
    return stream.on('error', (err) => {
      if (err.plugin === PLUGIN_NAME) {
        done();
      }
    }).on('data', () => {
      if (!reported) {
        done(new Error('fail'));
        reported = true;
      }
    });
  }


  describe('typeCheck', () => {
    it('works correctly on Object', (done) => {
      const src = {
        a: 1,
        b: 10,
        c: -20,
        d: 999,
        e: 0,
      };
      const tmpl = {
        a: 'A',
        b: 'B',
        c: 'C',
        d: 'D',
        e: 'E',
      };
      const expected = {
        A: 1,
        B: 10,
        C: -20,
        D: 999,
        E: 0,
      };

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('works correctly on Array', (done) => {
      const src = ['foo', 'bar', 'baz'];
      const tmpl = ['i0', 'i1', 'i2'];
      const expected = {
        i0: 'foo',
        i1: 'bar',
        i2: 'baz',
      };

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('works correctly on String', (done) => {
      const src = 'this is string';
      const tmpl = 'result';
      const expected = {result: 'this is string'};

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('works correctly on Number', (done) => {
      const src = 1234;
      const tmpl = 'result';
      const expected = {result: 1234};

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('works correctly on Boolean', (done) => {
      const src = true;
      const tmpl = 'result';
      const expected = {result: true};

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('works correctly on null', (done) => {
      const src = null;
      const tmpl = 'result';
      const expected = {result: null};

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('throws PluginError when find template type mismatch (number, [])', (done) => {
      const tmpl = ['tmpl', 'expect', 'array'];
      expectPluginError(fsmap(tmpl), done).end(wrap(1234));
    });

    it('throws PluginError when find template type mismatch (string, [])', (done) => {
      const tmpl = ['tmpl', 'expect', 'array'];
      expectPluginError(fsmap(tmpl), done).end(wrap('str'));
    });

    it('throws PluginError when find template type mismatch (boolean, [])', (done) => {
      const tmpl = ['tmpl', 'expect', 'array'];
      let c = 0;
      const countDone = () => (++c === 2 && done());
      expectPluginError(fsmap(tmpl), countDone).end(wrap(true));
      expectPluginError(fsmap(tmpl), countDone).end(wrap(false));
    });

    it('throws PluginError when find template type mismatch (null, [])', (done) => {
      const tmpl = ['tmpl', 'expect', 'array'];
      expectPluginError(fsmap(tmpl), done).end(wrap(null));
    });

    it('throws PluginError when find template type mismatch ({}, [])', (done) => {
      const src = {
        a: 'a',
        0: '0',
        1: '1',
        2: '2',
      };
      const tmpl = ['template', 'expect', 'array'];
      expectPluginError(fsmap(tmpl), done).end(wrap(src));
    });

    it('throws PluginError when find template type mismatch (number, {})', (done) => {
      const tmpl = {0: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(wrap(1234));
    });

    it('throws PluginError when find template type mismatch (string, {})', (done) => {
      const tmpl = {0: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(wrap('str'));
    });

    it('throws PluginError when find template type mismatch (boolean, {})', (done) => {
      const tmpl = {0: 'expect_object'};
      let c = 0;
      const countDone = () => (++c === 2 && done());
      expectPluginError(fsmap(tmpl), countDone).end(wrap(true));
      expectPluginError(fsmap(tmpl), countDone).end(wrap(false));
    });

    it('throws PluginError when find template type mismatch (null, {})', (done) => {
      const tmpl = {0: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(wrap(null));
    });

    it('throw PluginError when find template type mismatch ([], {})', (done) => {
      const src = [1, 2, 3];
      const tmpl = {0: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(wrap(src));
    });
  });

  describe('rest key syntax', () => {
    it('captures all keys which is not specified explicitly', (done) => {
      const src = {
        a: 1,
        b: 10,
        c: -20,
        d: 999,
        e: 0,
      };
      const tmpl = {
        a: 'A',
        e: 'E',
        _: 'REST',
      };
      const expected = {
        A: 1,
        E: 0,
        REST: {
          b: 10,
          c: -20,
          d: 999,
        },
      };

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('captures empty object if all keys are specified explicitly', (done) => {
      const src = {
        a: 1,
        b: 10,
      };
      const tmpl = {
        a: 'A',
        b: 'B',
        _: 'REST',
      };
      const expected = {
        A: 1,
        B: 10,
        REST: {},
      };

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('works with empty object', (done) => {
      const src = {};
      const tmpl = {_: 'REST'};
      const expected = {REST: {}};

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });
  });

  describe('array spread syntax', () => {
    it('captures the rest of Array elements', (done) => {
      const src = [1, 2, 3, 4];
      const tmpl = ['i0', 'i1', '...REST'];
      const expected = {
        i0: 1,
        i1: 2,
        REST: [3, 4],
      };

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('captures empty Array if no more element', (done) => {
      const src = [1, 2];
      const tmpl = ['i0', 'i1', '...REST'];
      const expected = {
        i0: 1,
        i1: 2,
        REST: [],
      };

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });

    it('works with empty Array', (done) => {
      const src = [];
      const tmpl = ['...REST'];
      const expected = {REST: []};

      fsmap(tmpl).on('data', collect)
                 .on('end', expect(expected, done))
                 .end(wrap(src));
    });
  });
});
