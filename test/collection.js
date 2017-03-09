'use strict'

describe('Collection', () =>
{
	const Model = require('../lib/Model')
	const Collection = require('../lib/Collection')

	class Foo extends Model {
		get foo()
		{
			return 'foo'
		}

		bar()
		{
			return Promise.resolve()
		}
	}

	it('should behave like an array', () =>
	{
		const items = new Collection()

		items.push('foo')

		expect(items.length).toBe(1)
		// expect(items.$items.length).toBe(1)

		for (const item of items)
		{
			expect(item).toBe('foo')
		}

		expect(items.includes('foo')).toBe(true)

		items.splice(0, 1)

		expect(items.length).toBe(0)
		// expect(items.$items.length).toBe(0)

		expect(items instanceof Array).toBe(true)
		expect(items instanceof Collection).toBe(true)
		expect(Array.isArray(items)).toBe(true)
	})

	it('accepts array-like objects', () =>
	{
		const set = new Set()

		set.add('foo')
		set.add('bar')

		const items = new Collection(Model, set)

		items.push('baz')

		expect(items.length).toBe(3)
		// expect(items.$items.length).toBe(3)

		expect(items[0]).toBe('foo')
		expect(items[1]).toBe('bar')
		expect(items[2]).toBe('baz')
	})

	it('should call functions on all items', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		const items = new Collection(Foo, [foo, bar])

		const names = items.get('name')

		expect(names[0]).toBe('foo')
		expect(names[1]).toBe('bar')
	})

	it('should call functions on subclasses', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		class Foos extends Collection {
			foo()
			{
				return 'foo'
			}
		}

		const items = new Foos(Foo, [foo, bar])

		expect(items.foo()).toBe('foo')

		const names = items.getProperty('name')

		expect(names.length).toBe(2)
		expect(names[0]).toBe('foo')
		expect(names[1]).toBe('bar')
	})

	it('should wrap promises', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		const items = new Collection(Foo, [foo, bar])

		expect('then' in items.bar()).toBe(true)
	})
})
