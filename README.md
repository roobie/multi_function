# multi_function
An implementation that enables defining functions that apply dynamic multiple dispatch

`"Better than a switch" - BR`


# Examples

Dispatching on type

```
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
```


Dispatching on value

```

const mm = MultiFunction()
        .params() 
        // the last parameter is a ref to the multifunc
        .fn((self) => self(null))

        .params(null)
        .fn(() => 'null');

t.equal(mm(), 'null');
t.equal(mm(null), 'null');
```


Dynamic binding

```
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
```
