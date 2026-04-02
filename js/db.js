class FoodDB {
  constructor(dbName = 'foodForXiaoLi', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  _ensureInitialized() {
    if (!this.db) {
      throw new Error('数据库未初始化,请先调用 init() 方法');
    }
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('数据库打开失败'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建菜品表
        if (!db.objectStoreNames.contains('dishes')) {
          const dishStore = db.createObjectStore('dishes', { keyPath: 'id' });
          dishStore.createIndex('category', 'category', { unique: false });
          dishStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 创建分类表
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('order', 'order', { unique: false });
        }

        // 创建订单表
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 初始化默认分类
        this.initDefaultCategories(event.target.transaction);
      };
    });
  }

  async initDefaultCategories(transaction) {
    const categories = [
      { id: 'all', name: '全部', order: 0 },
      { id: 'main', name: '主食', order: 1 },
      { id: 'soup', name: '汤品', order: 2 },
      { id: 'dessert', name: '甜点', order: 3 }
    ];

    const store = transaction.objectStore('categories');
    for (const cat of categories) {
      try {
        store.put(cat);
      } catch (error) {
        console.error('初始化默认分类失败:', error);
      }
    }
  }

  // 菜品操作
  async addDish(dish) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readwrite');
      const store = transaction.objectStore('dishes');
      const request = store.add(dish);

      request.onsuccess = () => resolve(dish.id);
      request.onerror = () => reject(new Error('添加菜品失败'));
    });
  }

  async updateDish(dish) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readwrite');
      const store = transaction.objectStore('dishes');
      const request = store.put(dish);

      request.onsuccess = () => resolve(dish.id);
      request.onerror = () => reject(new Error('更新菜品失败'));
    });
  }

  async deleteDish(id) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readwrite');
      const store = transaction.objectStore('dishes');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除菜品失败'));
    });
  }

  async getDishes(category = null) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readonly');
      const store = transaction.objectStore('dishes');
      const request = category && category !== 'all'
        ? store.index('category').getAll(category)
        : store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('获取菜品失败'));
    });
  }

  async getDish(id) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readonly');
      const store = transaction.objectStore('dishes');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('获取菜品失败'));
    });
  }

  // 分类操作
  async getCategories() {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();

      request.onsuccess = () => {
        const categories = request.result.sort((a, b) => a.order - b.order);
        resolve(categories);
      };
      request.onerror = () => reject(new Error('获取分类失败'));
    });
  }

  async addCategory(category) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);

      request.onsuccess = () => resolve(category.id);
      request.onerror = () => reject(new Error('添加分类失败'));
    });
  }

  async updateCategory(category) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);

      request.onsuccess = () => resolve(category.id);
      request.onerror = () => reject(new Error('更新分类失败'));
    });
  }

  async deleteCategory(id) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除分类失败'));
    });
  }

  // 订单操作
  async addOrder(order) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const request = store.add(order);

      request.onsuccess = () => resolve(order.id);
      request.onerror = () => reject(new Error('添加订单失败'));
    });
  }

  async getOrders() {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['orders'], 'readonly');
      const store = transaction.objectStore('orders');
      const request = store.getAll();

      request.onsuccess = () => {
        const orders = request.result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(orders);
      };
      request.onerror = () => reject(new Error('获取订单失败'));
    });
  }

  async getOrder(id) {
    this._ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['orders'], 'readonly');
      const store = transaction.objectStore('orders');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('获取订单失败'));
    });
  }
}

// 导出单例实例
const db = new FoodDB();
