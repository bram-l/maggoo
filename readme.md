# Maggoo
Generic data modeling using proxified ES6 classes

## Requirements
- Node.js >= ~6.0

## Installation

```sh
npm install maggoo --save
```

## Usage

### Model

Exensible by default...
```js
const { Model } = require('maggoo')

const polly = new Model()

// set a property
polly.id = 1

// or
polly.set('id', 1)

// get
console.log(polly.id)

// or
console.log(polly.get('id'))
// > 1

// or
console.log(polly.$data.id)
// > 1

```

...or strict by definition
```js
const { Model } = require('maggoo')

class Polly extends Model {

    static get definition()
    {
        return {
            name: null
        }
    }

}

const polly = new Polly()

// Set a defined property
polly.name = 'foo'

// Set an undefined property
polly.id = 1
// > Throws: TypeError
```

### Collection

Behaves like an Array...
```js
const { Model, Collection } = require('maggoo')

class Polly extends Model {

    static get definition()
    {
        return {
            name: null
        }
    }

    hello()
    {
        console.log(`Hello my name is ${ this.name }`)

        return Promise.resolve()
    }

}

const foo = new Polly({ name: 'Foo' })
const bar = new Polly({ name: 'Bar' })

const pollies = new Collection(Polly, [foo, bar])

console.log(pollies.length)
// > 2

for (const polly in pollies)
{
    console.log(polly.name)
}
// > 'Foo'
// > 'Bar'
```

...and proxies function calls
```js
pollies.get('name')
// > ['Foo', 'Bar']

pollies.hello().then(() => console.log('Hello world'))
// > Hello my name is Foo
// > Hello my name is Bar
// > Hello world
```