const assert = require('assert');

describe('Demostración temporal del bloqueo de despliegue', function () {
  it('falla de forma controlada para impedir el despliegue', function () {
    assert.strictEqual(true, false);
  });
});

