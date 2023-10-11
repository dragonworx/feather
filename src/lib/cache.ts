export class Cache<K, V> {
	private _map: Map<K, V> = new Map();

	public get(key: K): V | undefined {
		return this._map.get(key);
	}

	public has(key: K): boolean {
		return this._map.has(key);
	}

	public set(key: K, value: V): this {
		this._map.set(key, value);
		return this;
	}

	public clear(key?: K): this {
		if (key) {
			this._map.delete(key);
		} else {
			this._map.clear();
		}
		return this;
	}
}
