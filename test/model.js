/* eslint no-underscore-dangle: [2, { "allow": ["_bar"] }] */

'use strict'

describe('Model', () =>
{
	it('should return its class name as type', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model()

		expect(instance.$type).toBe('Model')
	})

	it('can set an id', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model()

		instance.id = 1

		expect(instance.id).toBe(1)
	})

	it('can set an property', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model()

		instance.setProperty('id', 1)

		expect(instance.id).toBe(1)
	})

	it('can set multiple properties', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model()

		instance.set({ id: 1, foo: 'bar' })

		expect(instance.id).toBe(1)
		expect(instance.foo).toBe('bar')
	})

	it('will set the data passed to the constructor', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		expect(instance.getProperty('id')).toBe(1)
	})

	it('allows direct access to the data as property', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		expect(instance.id).toBe(1)
	})

	it('allows properties to be set through the proxy', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model()

		instance.id = 1

		expect(instance.id).toBe(1)
	})

	it('can get undefined property on model', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model()

		expect(instance.getProperty('foo')).toBeUndefined()
	})

	it('can get undefined properties through proxy on model', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model()

		expect(instance.foo).toBeUndefined()
	})

	it('can get all properties', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		expect(instance.getProperties()).toEqual({ id: 1 })
	})

	it('will return true if the model has a property', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		expect('id' in instance).toBe(true)
		expect('id' in instance.$data).toBe(true)
	})

	it('can mark a property as changed', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1, foo: 'foo' })

		expect(instance.foo).toBe('foo')

		instance.foo = 'bar'

		expect('foo' in instance.$changed).toBe(true)

		instance.foo = 'foo'

		expect('foo' in instance.$changed).toBe(false)
	})

	it('can delete a property', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1, foo: 'bar' })

		expect(instance.foo).toBe('bar')

		delete instance.foo

		expect(instance.foo).toBeUndefined()

		expect('foo' in instance.$changed).toBe(true)

		expect(instance.$changed.foo).toBeUndefined()
	})

	it('can not delete undefined properties', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		expect(() =>
		{
			delete instance.foo
		}).toThrowError(TypeError)
	})

	it('can not delete class properties', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		expect(() =>
		{
			delete instance.$data
		}).toThrowError(TypeError)
	})

	it('will be marked as dirty after value has changed', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		expect(instance.$dirty).toBe(false)

		instance.foo = 'bar'

		expect(instance.$dirty).toBe(true)

		delete instance.foo

		expect(instance.$dirty).toBe(false)
	})

	it('can generate a JSON string of the data', () =>
	{
		const Model = require('../lib/Model')
		const instance = new Model({ id: 1 })

		instance.foo = 'bar'

		expect(JSON.stringify(instance)).toBe('{"id":1,"foo":"bar"}')
	})
})

describe('ExtendedModel', () =>
{
	const Model = require('../lib/Model')

	const _bar = Symbol()

	class ExtendedModel extends Model {

		constructor(data)
		{
			super(data)
		}

		static get definition()
		{
			return {
				foo: null
			}
		}

		set bar(value)
		{
			this[_bar] = `${ value }-bar`
		}

		get bar()
		{
			return this[_bar]
		}

		get qux()
		{
			return `qux-${ this.foo }`
		}
	}

	it('should return its class name as type', () =>
	{
		const extended = new ExtendedModel({ foo: 1 })

		expect(extended.$type).toBe('ExtendedModel')

		expect(extended.$data).toEqual({ foo: 1 })
	})

	it('extends the model', () =>
	{
		const extended = new ExtendedModel()

		expect(extended.foo).toBeUndefined()

		extended.foo = 1

		expect(extended.foo).toBe(1)

		expect(extended.$data).toEqual({ foo: 1 })
	})

	it('sets property through setter', () =>
	{
		const extended = new ExtendedModel({ foo: 1 })

		expect(extended.bar).toBeUndefined()

		extended.bar = 'bar'

		expect(extended.bar).toBe('bar-bar')

		expect(extended.$data).toEqual({ foo: 1 })
	})


	it('will return false if the model has a property but it is private', () =>
	{
		const extended = new ExtendedModel({ foo: 1 })

		extended.bar = 'bar'

		expect('_bar' in extended).toBe(false)
	})

	it('sets property through setProperty method', () =>
	{
		const extended = new ExtendedModel()

		expect(extended.bar).toBeUndefined()

		extended.setProperty('bar', 'bar')

		expect(extended.bar).toBe('bar-bar')
	})

	it('can get undefined property on model with strict definition', () =>
	{
		const instance = new ExtendedModel()

		expect(instance.getProperty('foo')).toBeUndefined()
	})

	it('can get undefined properties through proxy on model with strict definition', () =>
	{
		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()
	})

	it('cannot set undefined properties on model with strict definition', () =>
	{
		const instance = new ExtendedModel()

		expect(() => { instance.setProperty('baz', 1) }).toThrowError('Cannot set property on model: baz')
	})

	it('cannot set undefined properties through proxy on model with strict definition', () =>
	{
		const instance = new ExtendedModel()

		expect(() => { instance.baz = 1 }).toThrowError('Cannot set property on model: baz')
	})

	it('internally gets properties through proxy', () =>
	{
		const extended = new ExtendedModel({ foo: 'foo' })

		expect(extended.qux).toBe('qux-foo')
	})
})
