/* eslint no-underscore-dangle: ["error", { "allow": ["_data", "_Collection"] }] */

'use strict'

const Collection = require('./Collection')

const _data = Symbol('data')
const _Collection = Symbol('Collection')

class Model
{
	/**
	 * Defines the schema for the Model
	 *
	 * @static
	 * @returns {object} Properties defined key-value pair
	 *
	 * @example
	 * {
	 *   foo: 'string'
	 * }
	 *
	 * @example
	 * {
	 *   foo: (value) => typeof value === 'string'
	 * }
	 */
	static get schema()
	{
		return null
	}

	/**
	 * Collection class factory method
	 *
	 * @static
	 * @returns {Function} A Collection class bound to this model
	 */
	static get Collection()
	{
		if (this[_Collection])
		{
			return this[_Collection]
		}

		const self = this

		this[_Collection] = class extends Collection
		{
			constructor(items)
			{
				super(self, items)
			}
		}

		return this[_Collection]
	}

	/**
	 * Collection factory method
	 *
	 * @static
	 * @param {Model[]} [items] An array with models
	 * @returns {Collection} A new Collection instance
	 */
	static collection(items)
	{
		return new this.Collection(items)
	}

	get $data()
	{
		return this[_data]
	}

	get $type()
	{
		return this.constructor.name
	}

	get $dirty()
	{
		return !!Object.keys(this.$changed).length
	}

	constructor(data)
	{
		this[_data] = {}

		if (data)
		{
			this.setProperties(data)
		}

		this.reset()
	}

	get(key)
	{
		return this.getProperty(key)
	}

	getProperty(key)
	{
		return this[_data][key]
	}

	getProperties()
	{
		return this.$data
	}

	toJSON()
	{
		return this.getProperties()
	}

	/**
	 * Creates a regular Javascript object. An array of properties can be specified to filter specific values.
	 * To filter nested properties an object can be used as an array item.
	 * Use '*' to include all properties.
	 *
	 * @example
	 * model.toObject(['foo', { bar: '*' }])
	 *
	 * @param {array} [keys] A list of properties to include
	 *
	 * @returns {object} Data object
	 */
	toObject(keys = null)
	{
		if (!keys)
		{
			return this.$data
		}

		const data = {}

		if (typeof keys === 'string')
		{
			keys = [keys]
		}

		for (const key of keys)
		{
			if (typeof key === 'object')
			{
				for (const nested of Object.keys(key))
				{
					let value = null

					if (typeof key[nested] === 'function')
					{
						value = key[nested](this)
					}
					else
					{
						value = this[nested]
					}

					if (typeof key[nested] === 'string')
					{
						key[nested] = [key[nested]]
					}

					if (Array.isArray(key[nested]))
					{
						if (value.toObject)
						{
							value = value.toObject(key[nested])
						}
						else if (Array.isArray(value))
						{
							value = value.map((current) =>
								key[nested].reduce((obj, prop) =>
								{
									obj[prop] = current[prop]
									return obj
								}, {})
							)
						}
						else
						{
							value = key[nested].reduce((obj, prop) =>
							{
								obj[prop] = value[prop]
								return obj
							}, {})
						}
					}

					data[nested] = value
				}
			}
			else if (key === '*')
			{
				Object.assign(data, this.$data)
			}
			else
			{
				let value = this.get(key)

				if (typeof value === 'undefined')
				{
					value = null
				}
				else if (value && value.toObject)
				{
					value = value.toObject()
				}

				data[key] = value
			}
		}

		return data
	}

	set(key, value)
	{
		if (!value && typeof key != 'string')
		{
			this.setProperties(key)
		}
		else
		{
			this.setProperty(key, value)
		}
	}

	setProperty(key, value)
	{
		if (key in this)
		{
			this[key] = value
			return
		}

		const schema = this.constructor.schema

		if (schema && !(key in schema) && schema.$strict !== false)
		{
			throw new TypeError(`Cannot set undefined properties on a model with a strict schema: ${ key }`)
		}

		this.setChanged(key, value)

		this[_data][key] = value
	}

	setProperties(obj)
	{
		for (const key of Object.keys(obj))
		{
			const value = obj[key]

			this.setProperty(key, value)
		}
	}

	has(key)
	{
		return this.hasProperty(key)
	}

	hasProperty(key)
	{
		return key in this[_data]
	}

	deleteProperty(key)
	{
		if (!(key in this[_data]))
		{
			return false
		}

		delete this[_data][key]

		if (key in this.$previous)
		{
			this.setChanged(key, this[_data][key])
		}
		else
		{
			delete this.$changed[key]
		}

		return true
	}

	setChanged(key, value)
	{
		if (this.$previous && this.$previous[key] !== value)
		{
			this.$changed[key] = value
		}
		else if (this.$previous)
		{
			delete this.$changed[key]
		}
	}

	validate()
	{
		const keys = Object.keys(this.$data)

		this.$errors = []

		const promises = keys.map((key) =>
			this.validateProperty(key, this.$data[key])
				.catch((error) =>
				{
					this.$errors.push(error)
				})
		)

		return Promise.all(promises)
			.then(() =>
			{
				if (this.$errors.length)
				{
					return Promise.reject()
				}

				return Promise.resolve()
			})
	}

	validateProperty(key, value)
	{
		return new Promise((resolve, reject) =>
		{
			const schema = this.constructor.schema

			if (!schema)
			{
				return resolve()
			}

			if (!(key in schema))
			{
				if (schema.$strict === false)
				{
					return resolve()
				}

				return reject(`Key should be defined in schema: ${ key }`)
			}

			const definition = schema[key]

			let type = null
			let validator = null

			switch (typeof definition)
			{
				case 'string':
					type = definition
					break

				case 'function':
					validator = definition
					break

				case 'object':
					type = definition.type
					validator = definition.validator
					break

				default:
					return reject(`Invalid schema definition for '${ key }'`)
			}

			if (type)
			{
				if (typeof value !== type)
				{
					return reject(`Cannot set '${ key }' on ${ this.$type } with value '${ value }', '${ key }' should be a ${ type }`)
				}
			}

			if (validator)
			{
				const result = validator(value)

				if (result !== true)
				{
					return reject(`Cannot set '${ key }' on ${ this.$type } with value '${ value }', validator returned: '${ result }'`)
				}
			}

			return resolve()
		})
	}

	reset()
	{
		this.$previous = Object.assign({}, this[_data])
		this.$changed =  Object.create(null)
	}

	revert()
	{
		this[_data] = Object.assign({}, this.$previous)
		this.$changed =  Object.create(null)
	}
}

function isMeta(key)
{
	return key[0] === '$'
}

function isPrivate(key)
{
	return typeof key === 'symbol' || key[0] === '_'
}

const proxify = {
	construct()
	{
		const instance = Reflect.construct(...arguments)

		const proxied = new Proxy(instance, {

			get(target, key)
			{
				if (Reflect.has(target, key) || isMeta(key) || isPrivate(key))
				{
					return Reflect.get(target, key, proxied)
				}

				return target.get(key)
			},

			set(target, key, value)
			{
				if (Reflect.has(target, key) && typeof target[key] !== 'function' || isMeta(key) || isPrivate(key))
				{
					return Reflect.set(target, key, value, proxied)
				}

				target.set(key, value)

				return true
			},

			has(target, key)
			{
				if (isPrivate(key))
				{
					return false
				}

				if (Reflect.has(target, key))
				{
					return true
				}

				return target.has(key)
			},

			deleteProperty(target, key)
			{
				if (Reflect.has(target, key) || isMeta(key) || isPrivate(key))
				{
					return false
				}

				return target.deleteProperty(key)
			}
		})

		return proxied
	}
}

module.exports = new Proxy(Model, proxify)
