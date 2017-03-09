'use strict'

const _data = Symbol()

class Model {

	static get definition()
	{
		return null
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

	getProperties()
	{
		return this.$data
	}

	toJSON()
	{
		return this.getProperties()
	}

	get(key)
	{
		return this.getProperty(key)
	}

	getProperty(key)
	{
		return this[_data][key]
	}

	setProperties(obj)
	{
		for (const key of Object.keys(obj))
		{
			const value = obj[key]

			this.setProperty(key, value)
		}
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

		if (this.constructor.definition !== null && !(key in this.constructor.definition))
		{
			throw new Error(`Cannot set property on model: ${ key }`)
		}

		this.setChanged(key, value)

		this[_data][key] = value
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

	reset()
	{
		this.$previous = Object.assign({}, this[_data])
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
