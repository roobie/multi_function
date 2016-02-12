const test = require('tape');

const MultiFunction1 = require('./multi_function.js');
const MultiFunction2 = require('./multi_function.umd.js');

function Animal(n) { this.name = n; }
Animal.prototype.toString = function () {
  return this.name;
};

function Dog() { Animal.apply(this, arguments); }
Dog.prototype = Object.create(Animal.prototype);

function Cat() { Animal.apply(this, arguments); }
Cat.prototype = Object.create(Animal.prototype, {
  constructor: { value: Cat }
});

const animal = new Animal('Bert');
const dog = new Dog('MrDoge');
const cat = new Cat('Cheez');

function run(MultiFunction) {
  test('basic test', t => {
    t.plan(4);

    const mm = MultiFunction()
            .params()
            .fn((self) => self({}))

            .params(null)
            .fn(() => 'null')

            .params(String)
            .fn((json, self) => self(JSON.parse(json)))

            .params(Object)
            .fn(cfg => 1);

    t.equal(mm(), 1);
    t.equal(mm('{"a": 1}'), 1);
    t.equal(mm({}), 1);
    t.equal(mm(null), 'null');
  });

  test('more involved', t => {
    t.plan(6);

    const mm = MultiFunction()
            .params(Dog)
            .fn(d => d + ' is a dog')

            .params(Animal)
            .fn(a => a + ' is an animal')

            .params(String, Animal)
            .fn((s, a) => 2)

            .params(Dog, Cat, Animal)
            .fn((d, a1, a2) => {
              return 3;
            });

    t.equal(mm(animal), 'Bert is an animal');
    t.equal(mm(dog), 'MrDoge is a dog');
    t.equal(mm(cat), 'Cheez is an animal');
    t.equal(mm('test', animal), 2);

    t.equal(mm(dog, cat, animal), 3);

    t.throws(() => {
      mm(cat, animal, dog);
    }, /no match found/i, 'should throw');
  });

  test('Dynamic context.', t => {
    t.plan(3);

    const name = 'FancyPantz';
    const d = new Dog(name);

    // override the Animal's toString()
    d.toString = MultiFunction()
      .params()
      .fn(function () {
        return this.name;
      })
      .params('')
      .fn(function (_emptyString) {
        return this.toString('Hi');
      })
      .params(String)
      .fn(function (greeting) {
        return `${greeting}, ${this.name}`;
      });

    t.equal(d.toString(), name);
    t.equal(d.toString('Hello'), 'Hello, ' + name);
    t.equal(d.toString(''), 'Hi, ' + name);
  });
}

run(MultiFunction1);
run(MultiFunction2);
