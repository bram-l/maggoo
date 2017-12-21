'use strict'

describe('Extended Model', () =>
{
	const Model = require('../lib/Model')

	it('should return its class name as type', () =>
	{
		class ExtendedModel extends Model {}

		const extended = new ExtendedModel({ foo: 1 })

		expect(extended.$type).toBe('ExtendedModel')

		expect(extended.$data).toEqual({ foo: 1 })
	})

	it('extends the model', () =>
	{
		class ExtendedModel extends Model {}

		const extended = new ExtendedModel()

		expect(extended.foo).toBeUndefined()

		extended.foo = 1

		expect(extended.foo).toBe(1)

		expect(extended.$data).toEqual({ foo: 1 })
	})

	it('sets property through setter should ignore the schema', () =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {}
			}

			set foo(value)
			{
				this.$data.foo = `${ value }-foo`
			}

			get foo()
			{
				return this.$data.foo
			}
		}

		const extended = new ExtendedModel()

		expect(extended.foo).toBeUndefined()

		extended.foo = 'foo'

		expect(extended.foo).toBe('foo-foo')

		expect(extended.$data).toEqual({ foo: 'foo-foo' })
	})

	it('sets property with setter through setProperty method should ignore the schema', () =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {}
			}

			set foo(value)
			{
				this.$data.foo = `${ value }-foo`
			}

			get foo()
			{
				return this.$data.foo
			}
		}

		const extended = new ExtendedModel()

		expect(extended.foo).toBeUndefined()

		extended.setProperty('foo', 'foo')

		expect(extended.foo).toBe('foo-foo')
	})

	it('can get undefined property on model with strict schema', () =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					foo: 'string'
				}
			}
		}

		const instance = new ExtendedModel()

		expect(instance.getProperty('foo')).toBeUndefined()
	})

	it('can get undefined properties through proxy on model with strict schema', () =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					foo: 'string'
				}
			}
		}

		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()
	})

	it('internally gets properties through proxy', () =>
	{
		class ExtendedModel extends Model
		{
			get bar()
			{
				return `bar-${ this.foo }`
			}
		}

		const extended = new ExtendedModel({ foo: 'foo' })

		expect(extended.bar).toBe('bar-foo')
	})

	it('should hide private properties through proxy', () =>
	{
		/* eslint no-underscore-dangle: ["error", { "allow": ["_bar"] }] */

		const _bar = Symbol('bar')

		class ExtendedModel extends Model
		{
			get [_bar]()
			{
				return `bar-${ this.foo }`
			}
		}

		const extended = new ExtendedModel({ foo: 'foo' })

		expect(_bar in extended).toBe(false)

		expect(extended[_bar]).toBe('bar-foo')
	})
})
