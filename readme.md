# Maggoo

[![Build Status](https://travis-ci.org/bram-l/maggoo.svg?branch=master)](https://travis-ci.org/bram-l/maggoo)
[![Coverage Status](https://coveralls.io/repos/github/bram-l/maggoo/badge.svg?branch=master)](https://coveralls.io/github/bram-l/maggoo?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/bram-l/maggoo.svg)](https://greenkeeper.io/)

### Generic data modeling using proxified ES6 classes.

- No transpilation, no dependencies.
- Define models by extending classes.
- Basic (promise-based) schema validation with support for validator functions like [validator.js](https://github.com/chriso/validator.js).


## Requirements
- Node.js >= 6.0.0


## Installation

```sh
npm install maggoo --save
```


## Usage

### Model

Flexible by default...
```js
const { Model } = require('maggoo')

const polly = new Model()

// set a property
polly.id = 1

// or
polly.set('id', 1)

// get
console.log(polly.id)
// > 1

// or
console.log(polly.get('id'))
// > 1

// or
console.log(polly.$data.id)
// > 1

```

...or strict by schema definition
```js
const { Model } = require('maggoo')

class Polly extends Model {

    static get schema()
    {
        return {
            name: 'string'
        }
    }

}

const polly = new Polly()

// Set a defined property with a valid value
polly.name = 'foo'

// Set an undefined property with an invalid value
polly.foo = 'bar'
// > Throws: TypeError
```

...and with a validation support
```js
const { Model } = require('maggoo')

class Polly extends Model {

    static get schema()
    {
        return {
            name: 'string',
            age: (value) => typeof value === 'number'
        }
    }

}

const polly = new Polly()

// Set a defined property with an invalid value
polly.name = 1
polly.age = 'foo'

polly.validate()
    .catch(() =>
    {
        console.log(polly.$errors)
    })

// > [ 'Cannot set 'name' on Polly with value '1', 'name' should be a string',
//     'Cannot set 'age' on Polly with value 'bar', validator returned: 'false' ]

```

### Collection

Behaves like an Array...
```js
const { Model, Collection } = require('maggoo')

class Polly extends Model {

    sayHello()
    {
        console.log(`Hello my name is ${ this.name }`)

        // Just for demonstrating how a Collection hanldes promises
        return Promise.resolve()
    }

}

const foo = new Polly({ name: 'Foo' })
const bar = new Polly({ name: 'Bar' })

const pollies = Polly.collection([foo, bar])

console.log(pollies.length)
// > 2

for (const polly in pollies)
{
    console.log(polly.name)
}
// > 'Foo'
// > 'Bar'
```

...proxies function calls
```js
pollies.get('name')
// > ['Foo', 'Bar']
```

...and waits for promises
```js
pollies.sayHello().then(() => console.log('Hello world'))
// > Hello my name is Foo
// > Hello my name is Bar
// > Hello world
```