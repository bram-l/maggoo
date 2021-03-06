'use strict'

class Collection extends Array
{
	constructor(Model, items = [])
	{
		if (typeof items === 'number')
		{
			items = new Array(items)
		}

		super(...items)

		this.$Model = Model
	}

	wrap(fn, collection)
	{
		collection = collection || this

		return function()
		{
			const arr = []
			let promise = false

			for (const item of collection)
			{
				const result = Reflect.apply(item[fn], item, arguments)

				promise = promise || result instanceof Promise

				arr.push(result)
			}

			return promise ? Promise.all(arr) : arr
		}
	}
}

const proxify = {
	construct()
	{
		const instance = Reflect.construct(...arguments)

		const proxy = new Proxy(instance, {
			// eslint-disable-next-line consistent-return
			get(target, key, receiver)
			{
				if (Reflect.has(target, key))
				{
					return Reflect.get(...arguments)
				}

				if (target.$Model && typeof target.$Model.prototype[key] === 'function')
				{
					return target.wrap.call(receiver, key)
				}
			}
		})

		return proxy
	}
}

module.exports = new Proxy(Collection, proxify)
