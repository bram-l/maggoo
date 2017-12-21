'use strict'

describe('Model', () =>
{
	const Model = require('../lib/Model')

	it('should return its class name as type', () =>
	{
		const instance = new Model()

		expect(instance.$type).toBe('Model')
	})

	it('can set an id', () =>
	{
		const instance = new Model()

		instance.id = 1

		expect(instance.id).toBe(1)
	})

	it('can set an property', () =>
	{
		const instance = new Model()

		instance.setProperty('id', 1)

		expect(instance.id).toBe(1)
	})

	it('can set multiple properties', () =>
	{
		const instance = new Model()

		instance.set({ id: 1, foo: 'bar' })

		expect(instance.id).toBe(1)
		expect(instance.foo).toBe('bar')
	})

	it('will set the data passed to the constructor', () =>
	{
		const instance = new Model({ id: 1 })

		expect(instance.getProperty('id')).toBe(1)
	})

	it('allows direct access to the data as property', () =>
	{
		const instance = new Model({ id: 1 })

		expect(instance.id).toBe(1)
	})

	it('allows properties to be set through the proxy', () =>
	{
		const instance = new Model()

		instance.id = 1

		expect(instance.id).toBe(1)
	})

	it('can get undefined property on model', () =>
	{
		const instance = new Model()

		expect(instance.getProperty('foo')).toBeUndefined()
	})

	it('can get undefined properties through proxy on model', () =>
	{
		const instance = new Model()

		expect(instance.foo).toBeUndefined()
	})

	it('can get all properties', () =>
	{
		const instance = new Model({ id: 1 })

		expect(instance.getProperties()).toEqual({ id: 1 })
	})

	it('will return true if the model has a property', () =>
	{
		const instance = new Model({ id: 1 })

		expect('id' in instance).toBe(true)
		expect('id' in instance.$data).toBe(true)
	})

	it('can mark a property as changed', () =>
	{
		const instance = new Model({ id: 1, foo: 'foo' })

		expect(instance.foo).toBe('foo')

		instance.foo = 'bar'

		expect('foo' in instance.$changed).toBe(true)

		instance.foo = 'foo'

		expect('foo' in instance.$changed).toBe(false)
	})

	it('can delete a property', () =>
	{
		const instance = new Model({ id: 1, foo: 'bar' })

		expect(instance.foo).toBe('bar')

		delete instance.foo

		expect(instance.foo).toBeUndefined()

		expect('foo' in instance.$changed).toBe(true)

		expect(instance.$changed.foo).toBeUndefined()
	})

	it('can not delete undefined properties', () =>
	{
		const instance = new Model({ id: 1 })

		expect(() =>
		{
			delete instance.foo
		})
			.toThrowError(TypeError)
	})

	it('can not delete class properties', () =>
	{
		const instance = new Model({ id: 1 })

		expect(() =>
		{
			delete instance.$data
		})
			.toThrowError(TypeError)
	})

	it('will be marked as dirty after value has changed', () =>
	{
		const instance = new Model({ id: 1 })

		expect(instance.$dirty).toBe(false)

		instance.foo = 'bar'

		expect(instance.$dirty).toBe(true)

		delete instance.foo

		expect(instance.$dirty).toBe(false)
	})

	it('can generate a JSON string of the data', () =>
	{
		const instance = new Model({ id: 1 })

		instance.foo = 'bar'

		expect(JSON.stringify(instance)).toBe('{"id":1,"foo":"bar"}')
	})

	it('should not set meta properties on data', () =>
	{
		const instance = new Model({ id: 1 })

		instance.$foo = 'bar'

		expect(instance.$data.$foo).toBeUndefined()
		expect(instance.$foo).toBe('bar')
	})

	it('should revert to previous values', () =>
	{
		const instance = new Model({ id: 1 })

		instance.id = 'bar'

		expect(instance.id).toBe('bar')
		expect(instance.$previous.id).toBe(1)
		expect(instance.$changed.id).toBe('bar')

		instance.revert()

		expect(instance.id).toBe(1)
		expect(instance.$previous.id).toBe(1)
		expect('id' in instance.$changed).toBe(false)

		instance.id = 'bar'

		expect(instance.id).toBe('bar')
		expect(instance.$previous.id).toBe(1)
		expect(instance.$changed.id).toBe('bar')
	})
})
