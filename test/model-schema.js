'use strict'

describe('Model Schema', () =>
{
	const Model = require('../lib/Model')

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

	it('cannot set undefined properties on model with a strict schema', () =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
				}
			}
		}

		const instance = new ExtendedModel()

		expect(() =>
		{
			instance.foo = 'foo'
		})
			.toThrowError('Cannot set undefined properties on a model with a strict schema: foo')
	})

	it('can set undefined properties on model with a non-strict schema', () =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					$strict: false
				}
			}
		}

		const instance = new ExtendedModel()

		expect(() =>
		{
			instance.foo = 'foo'
		})
			.not.toThrowError()

		expect(instance.foo).toBe('foo')
	})

	it('should validate all properties on a model without a schema', (done) =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return null
			}
		}

		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()

		instance.foo = 'foo'

		return instance.validate()
			.then(() => done())
			.catch(() => done.fail('Instance should validate'))
	})

	it('should validate all properties on a model without a strict schema', (done) =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					$strict: false
				}
			}
		}

		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()

		instance.foo = 'foo'

		return instance.validate()
			.then(() => done())
			.catch(() => done.fail('Instance should validate'))
	})

	it('should not validate properties on a model with a strict schema', (done) =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
				}
			}
		}

		const instance = new ExtendedModel()

		return instance.validateProperty('foo', 'foo')
			.then(() => done.fail('Instance should not validate'))
			.catch((error) =>
			{
				expect(error).toBe('Key should be defined in schema: foo')

				done()
			})
	})

	it('should validate valid properties on a model with a schema', (done) =>
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

		instance.foo = 'foo'

		return instance.validate()
			.then(() => done())
			.catch(() => done.fail('Instance should validate'))
	})

	it('should validate properties on a model with a schema', (done) =>
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

		instance.foo = 1

		return instance.validate()
			.then(() => done.fail('Instance should validate'))
			.catch(() =>
			{
				expect(instance.$errors.length).toBe(1)
				expect(instance.$errors[0]).toBe('Cannot set \'foo\' on ExtendedModel with value \'1\', \'foo\' should be a string')
			})
			.then(() =>
			{
				instance.foo = 'foo'

				return instance.validate()
			})
			.then(() =>
			{
				done()
			})
	})

	it('should validate properties on a model with a specified type', (done) =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					foo: {
						type: 'string'
					}
				}
			}
		}

		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()

		instance.foo = 1

		return instance.validate()
			.then(() => done.fail('Instance should validate'))
			.catch(() =>
			{
				expect(instance.$errors.length).toBe(1)
				expect(instance.$errors[0]).toBe('Cannot set \'foo\' on ExtendedModel with value \'1\', \'foo\' should be a string')
			})
			.then(() =>
			{
				instance.foo = 'foo'

				return instance.validate()
			})
			.then(() =>
			{
				done()
			})
	})

	it('should validate properties on a model with a specified validator as value', (done) =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					foo: (value) => typeof value === 'string',
				}
			}
		}

		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()

		instance.foo = 1

		return instance.validate()
			.then(() => done.fail('Instance should validate'))
			.catch(() =>
			{
				expect(instance.$errors.length).toBe(1)
				expect(instance.$errors[0]).toBe('Cannot set \'foo\' on ExtendedModel with value \'1\', validator returned: \'false\'')
			})
			.then(() =>
			{
				instance.foo = 'foo'

				return instance.validate()
			})
			.then(() =>
			{
				done()
			})
	})

	it('should validate properties on a model with a specified validator as object property', (done) =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					foo: {
						validator: (value) => typeof value === 'string'
					}
				}
			}
		}

		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()

		instance.foo = 1

		return instance.validate()
			.then(() => done.fail('Instance should validate'))
			.catch(() =>
			{
				expect(instance.$errors.length).toBe(1)
				expect(instance.$errors[0]).toBe('Cannot set \'foo\' on ExtendedModel with value \'1\', validator returned: \'false\'')
			})
			.then(() =>
			{
				instance.foo = 'foo'

				return instance.validate()
			})
			.then(() =>
			{
				done()
			})
	})

	it('should validate a property on model with a specified validator and type', (done) =>
	{
		class ExtendedModel extends Model
		{
			static get schema()
			{
				return {
					foo: {
						type: 'string',
						validator: (value) => value === 'foo'
					}
				}
			}
		}

		const instance = new ExtendedModel()

		expect(instance.foo).toBeUndefined()

		instance.foo = 1

		return instance.validate()
			.then(() => done.fail('Instance should validate'))
			.catch(() =>
			{
				expect(instance.$errors.length).toBe(1)
				expect(instance.$errors[0]).toBe('Cannot set \'foo\' on ExtendedModel with value \'1\', \'foo\' should be a string')
			})
			.then(() =>
			{
				instance.foo = 'foo'

				return instance.validate()
			})
			.then(() =>
			{
				done()
			})
	})
})
