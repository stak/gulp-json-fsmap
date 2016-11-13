const assert = require('assert');
const File = require('gulp-util').File;
const fsmap = require('../');
const PLUGIN_NAME = 'gulp-json-fsmap';

describe('gulp-json-fsmap', () => {
  // shorthands
  function buffer(v) {
    return new Buffer(JSON.stringify(v));
  }
  function json(v) {
    return JSON.stringify(v);
  }
  function assertFile(file, orig) {
    assert(Boolean(file));
    assert(Boolean(file.contents));
    assert(file.cwd === orig.cwd);
    assert(file.base === orig.base);
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

  // container for mapped files
  const m = new Map();
  beforeEach(() => {
    m.clear();
  });

  describe('typeCheck', () => {
    it('works correctly on Object', (done) => {
      const fakeFile = new File({
        path: 'dir/object.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer({
          a: 1,
          b: 10,
          c: -20,
          d: 999,
          e: 0,
        }),
      });
      const tmpl = {
        a: 'A',
        b: 'B',
        c: 'C',
        d: 'D',
        e: 'E',
      };

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 5);
        assert(m.get('dir/A.json') === json(1));
        assert(m.get('dir/B.json') === json(10));
        assert(m.get('dir/C.json') === json(-20));
        assert(m.get('dir/D.json') === json(999));
        assert(m.get('dir/E.json') === json(0));

        done();
      }).end(fakeFile);
    });

    it('works correctly on Array', (done) => {
      const fakeFile = new File({
        path: 'dir/array.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(['foo', 'bar', 'baz']),
      });
      const tmpl = ['i0', 'i1', 'i2'];

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 3);
        assert(m.get('dir/i0.json') === json('foo'));
        assert(m.get('dir/i1.json') === json('bar'));
        assert(m.get('dir/i2.json') === json('baz'));

        done();
      }).end(fakeFile);
    });

    it('works correctly on String', (done) => {
      const fakeFile = new File({
        path: 'dir/string.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer('this is string'),
      });
      const tmpl = 'str';

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 1);
        assert(m.get('dir/str.json') === json('this is string'));

        done();
      }).end(fakeFile);
    });

    it('works correctly on Number', (done) => {
      const fakeFile = new File({
        path: 'dir/number.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(1234),
      });
      const tmpl = 'num';

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 1);
        assert(m.get('dir/num.json') === json(1234));

        done();
      }).end(fakeFile);
    });

    it('works correctly on Boolean', (done) => {
      const fakeFile = new File({
        path: 'dir/boolean.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(true),
      });
      const tmpl = 'true';

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 1);
        assert(m.get('dir/true.json') === json(true));

        done();
      }).end(fakeFile);
    });

    it('works correctly on null', (done) => {
      const fakeFile = new File({
        path: 'dir/null.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(null),
      });
      const tmpl = 'null';

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 1);
        assert(m.get('dir/null.json') === json(null));

        done();
      }).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (number, [])', (done) => {
      const fakeFile = new File({
        path: 'dir/number.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(1234),
      });
      const tmpl = ['tmpl', 'expect', 'array'];

      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (string, [])', (done) => {
      const fakeFile = new File({
        path: 'dir/string.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer('this is string'),
      });
      const tmpl = ['tmpl', 'expect', 'array'];

      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (boolean, [])', (done) => {
      const fakeFile = new File({
        path: 'dir/boolean.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(true),
      });
      const tmpl = ['tmpl', 'expect', 'array'];

      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (null, [])', (done) => {
      const fakeFile = new File({
        path: 'dir/null.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(null),
      });
      const tmpl = ['tmpl', 'expect', 'array'];

      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch ({}, [])', (done) => {
      const fakeFile = new File({
        path: 'dir/object.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer({
          a: 'a',
          0: '0',
          1: '1',
          2: '2',
        }),
      });
      const tmpl = ['tmpl', 'expect', 'array'];

      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (number, {})', (done) => {
      const fakeFile = new File({
        path: 'dir/number.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(1234),
      });
      const tmpl = {tmpl: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (string, {})', (done) => {
      const fakeFile = new File({
        path: 'dir/string.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer('this is string'),
      });
      const tmpl = {0: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (boolean, {})', (done) => {
      const fakeFile = new File({
        path: 'dir/boolean.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(true),
      });
      const tmpl = {tmpl: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throws PluginError when find template type mismatch (null, {})', (done) => {
      const fakeFile = new File({
        path: 'dir/null.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer(null),
      });
      const tmpl = {tmpl: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });

    it('throw PluginError when find template type mismatch ([], {})', (done) => {
      const fakeFile = new File({
        path: 'dir/array.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer([1, 2, 3]),
      });
      const tmpl = {0: 'expect_object'};
      expectPluginError(fsmap(tmpl), done).end(fakeFile);
    });
  });

  describe('rest key syntax', () => {
    it('captures all keys which is not specified explicitly', (done) => {
      const fakeFile = new File({
        path: 'dir/object.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer({
          a: 1,
          b: 10,
          c: -20,
          d: 999,
          e: 0,
        }),
      });
      const tmpl = {
        a: 'A',
        e: 'E',
        _: 'REST',
      };

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 3);
        assert(m.get('dir/A.json') === json(1));
        assert(m.get('dir/E.json') === json(0));
        assert(m.get('dir/REST.json') === json({
          b: 10,
          c: -20,
          d: 999,
        }));

        done();
      }).end(fakeFile);
    });

    it('captures empty object if all keys are specified explicitly', (done) => {
      const fakeFile = new File({
        path: 'dir/object.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer({
          a: 1,
          b: 10,
        }),
      });
      const tmpl = {
        a: 'A',
        b: 'B',
        _: 'REST',
      };

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 3);
        assert(m.get('dir/A.json') === json(1));
        assert(m.get('dir/B.json') === json(10));
        assert(m.get('dir/REST.json') === json({}));

        done();
      }).end(fakeFile);
    });

    it('works with empty object', (done) => {
      const fakeFile = new File({
        path: 'dir/empty.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer({}),
      });
      const tmpl = {_: 'REST'};

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 1);
        assert(m.get('dir/REST.json') === json({}));

        done();
      }).end(fakeFile);
    });
  });

  describe('array spread syntax', () => {
    it('captures the rest of Array elements', (done) => {
      const fakeFile = new File({
        path: 'dir/array.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer([1, 2, 3, 4]),
      });
      const tmpl = ['i0', 'i1', '...REST'];

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 3);
        assert(m.get('dir/i0.json') === json(1));
        assert(m.get('dir/i1.json') === json(2));
        assert(m.get('dir/REST.json') === json([3, 4]));

        done();
      }).end(fakeFile);
    });

    it('captures empty Array if there is no element', (done) => {
      const fakeFile = new File({
        path: 'dir/array.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer([1, 2]),
      });
      const tmpl = ['i0', 'i1', '...REST'];

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 3);
        assert(m.get('dir/i0.json') === json(1));
        assert(m.get('dir/i1.json') === json(2));
        assert(m.get('dir/REST.json') === json([]));

        done();
      }).end(fakeFile);
    });

    it('works with empty Array', (done) => {
      const fakeFile = new File({
        path: 'dir/emptyArray.json',
        cwd: 'dir/',
        base: 'dir/',
        contents: buffer([]),
      });
      const tmpl = ['...REST'];

      fsmap(tmpl).on('data', (newFile) => {
        assertFile(newFile, fakeFile);
        m.set(newFile.path, newFile.contents.toString());
      }).on('end', () => {
        assert(m.size === 1);
        assert(m.get('dir/REST.json') === json([]));

        done();
      }).end(fakeFile);
    });
  });
});
