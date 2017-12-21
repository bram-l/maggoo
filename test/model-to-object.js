'use strict'

describe('Model toObject', () =>
{
	const Model = require('../lib/Model')

	it('returns an empty object when no keys are passed', () =>
	{
		const instance = new Model()
		const object = instance.toObject()

		expect(object).toEqual({})
	})

	it('returns all data when an asterisk is passed', () =>
	{
		const instance = new Model({
			name: 'foo',
			value: 10
		})

		const object = instance.toObject('*')

		expect(object).toEqual({
			name: 'foo',
			value: 10
		})
	})

	it('returns an object with specified key', () =>
	{
		const instance = new Model({
			name: 'foo',
			value: 10
		})

		const object = instance.toObject('name')

		expect(object).toEqual({ name: 'foo' })
	})

	it('returns an object with specified keys', () =>
	{
		const instance = new Model({
			name: 'foo',
			value: 10
		})

		const object = instance.toObject(['name', 'value'])

		expect(object).toEqual({ name: 'foo', value: 10 })
	})

	it('returns a nested object with an asterisk as nested key', () =>
	{
		const foo = new Model({ name: 'foo' })
		const bar = new Model({ name: 'bar' })

		foo.bar = bar

		const object = foo.toObject(['name', { bar: '*' }])

		expect(object).toEqual({ name: 'foo', bar: { name: 'bar' } })
	})

	it('returns an array of nested object with a nested key', () =>
	{
		const foo = new Model({ name: 'foo' })
		const bar = new Model({ name: 'bar' })
		const baz = new Model({ name: 'baz' })

		foo.nested = Model.collection([bar, baz])

		const object = foo.toObject(['name', 'nested'])

		expect(object).toEqual({ name: 'foo', nested: [{ name: 'bar' }, { name: 'baz' }] })
	})

	it('returns an array of nested objects with an asterisk as nested key', () =>
	{
		const foo = new Model({ name: 'foo' })
		const bar = new Model({ name: 'bar' })
		const baz = new Model({ name: 'baz' })

		foo.nested = Model.collection([bar, baz])

		const object = foo.toObject(['name', { nested: '*' }])

		expect(object).toEqual({ name: 'foo', nested: [{ name: 'bar' }, { name: 'baz' }] })
	})

	it('returns a nested object with a specified nested key', () =>
	{
		const foo = new Model({
			name: 'foo',
			bar: {
				name: 'bar',
				value: 10
			}
		})

		const object = foo.toObject(['name', { bar: 'name' }])

		expect(object).toEqual({ name: 'foo', bar: { name: 'bar' } })
	})

	it('returns a nested object with specified keys', () =>
	{
		const foo = new Model({
			name: 'foo',
			bar: {
				name: 'bar',
				value: 10
			}
		})

		const object = foo.toObject(['name', { bar: ['name', 'value'] }])

		expect(object).toEqual({ name: 'foo', bar: { name: 'bar', value: 10 } })
	})

	it('returns a nested object without specified keys', () =>
	{
		const foo = new Model({
			name: 'foo',
			nested: [
				{ name: 'bar' },
				{ name: 'baz' }
			]
		})

		const object = foo.toObject(['name', 'nested'])

		expect(object).toEqual({ name: 'foo', nested: [{ name: 'bar' }, { name: 'baz' }] })
	})

	it('returns a nested object with specified keys', () =>
	{
		const foo = new Model({
			name: 'foo',
			nested: [
				{ name: 'bar', value: 10 },
				{ name: 'baz', value: 10 }
			]
		})

		const object = foo.toObject(['name', { nested: ['name', 'value'] }])

		expect(object).toEqual({ name: 'foo', nested: [{ name: 'bar', value: 10 }, { name: 'baz', value: 10 }] })
	})

	it('returns an object with callback function', () =>
	{
		const foo = new Model({
			name: 'foo'
		})

		const bar = new Model({
			name: 'bar',
			foo
		})

		const object = bar.toObject(['name', {
			foo: (item) =>
			{
				return item.foo.name
			}
		}])

		expect(object).toEqual({ name: 'bar', foo: 'foo' })
	})
})
