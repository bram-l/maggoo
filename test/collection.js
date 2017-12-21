'use strict'

describe('Collection', () =>
{
	const Model = require('../lib/Model')
	const Collection = require('../lib/Collection')

	class Foo extends Model
	{
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

		for (const item of items)
		{
			expect(item).toBe('foo')
		}

		expect(items.includes('foo')).toBe(true)

		items.splice(0, 1)

		expect(items.length).toBe(0)

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

		class Foos extends Collection
		{
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

	it('should return undefined for undefined properties', () =>
	{
		const foo = new Foo({ name: 'foo' })

		const items = new Collection(Foo, [foo])

		expect(items.foo).toBeUndefined()
	})

	it('should be extended using the Collection method', () =>
	{
		expect(Foo.Collection.prototype instanceof Collection).toBe(true)
	})

	it('should be cached using the Collection method', () =>
	{
		expect(Foo.Collection).toBe(Foo.Collection)
	})

	it('should be created using the collection factory method', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		const foos = Foo.collection([foo, bar])

		expect(foos instanceof Collection).toBe(true)
		expect(foos.$Model).toBe(Foo)
		expect(foos.length).toBe(2)
	})

	it('should support filtering', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		const foos = Foo.collection([foo, bar])

		const filtered = foos.filter((item) => item.name === 'foo')

		expect(filtered.length).toBe(1)
		expect(filtered[0].name).toBe('foo')
		expect(filtered instanceof Collection).toBe(true)
	})

	it('should support sorting', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		const foos = Foo.collection([foo, bar])

		// sort by name
		foos.sort((a, b) =>
		{
			const nameA = a.name.toUpperCase()
			const nameB = b.name.toUpperCase()

			if (nameA < nameB)
			{
				return -1
			}
			if (nameA > nameB)
			{
				return 1
			}

			return 0
		})

		expect(foos.length).toBe(2)
		expect(foos[0].name).toBe('bar')
		expect(foos[1].name).toBe('foo')
		expect(foos instanceof Collection).toBe(true)
	})

	it('should support slicing', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		const foos = Foo.collection([foo, bar])

		const sliced = foos.slice(1)

		expect(sliced.get('name')).toEqual(['bar'])
	})

	it('should support deleting items splicing', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })

		const foos = Foo.collection([foo, bar])

		const spliced = foos.splice(0, 1)

		expect(foos.get('name')).toEqual(['bar'])
		expect(spliced.get('name')).toEqual(['foo'])
	})

	it('should support adding items using splicing', () =>
	{
		const foo = new Foo({ name: 'foo' })
		const bar = new Foo({ name: 'bar' })
		const baz = new Foo({ name: 'baz' })

		const foos = Foo.collection([foo, baz])

		foos.splice(1, 0, bar)

		expect(foos.get('name')).toEqual(['foo', 'bar', 'baz'])
	})
})
