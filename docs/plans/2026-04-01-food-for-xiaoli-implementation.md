# 小🍐 专属点餐台 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个纯前端的家庭点餐系统，使用 HTML/CSS/JS 和 IndexedDB，适配安卓手机端。

**Architecture:** 单页应用（SPA）架构，点餐端与管理端共享 IndexedDB 数据库，使用 localStorage 临时存储购物车状态。

**Tech Stack:** 原生 JavaScript (ES6+)、CSS3 (Flexbox/Grid)、IndexedDB、Canvas API

---

## 项目结构初始化

### Task 1: 创建项目目录结构

**Files:**
- Create: `css/style.css`
- Create: `js/db.js`
- Create: `js/app.js`
- Create: `js/admin.js`
- Create: `js/utils.js`
- Create: `index.html`
- Create: `admin.html`
- Create: `images/.gitkeep`

**Step 1: 创建所有目录和空文件**

```bash
cd D:/home/foodForXiaoLi
mkdir -p css js images
touch css/style.css js/db.js js/app.js js/admin.js js/utils.js index.html admin.html images/.gitkeep
```

**Step 2: 验证文件创建成功**

```bash
ls -la css/ js/ images/
```

---

## 基础样式与布局

### Task 2: 编写全局样式

**Files:**
- Modify: `css/style.css`

**Step 1: 写入基础样式**

```css
/* 重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #ff6b35;
  --secondary-color: #ff9f1c;
  --text-color: #333;
  --bg-color: #f5f5f5;
  --white: #ffffff;
  --gray: #999;
  --light-gray: #e0e0e0;
  --danger: #e74c3c;
  --success: #2ecc71;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
  padding-bottom: 80px; /* 为底部导航留空间 */
}

/* 顶部栏 */
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 1.2rem;
  font-weight: 600;
}

.header-icons {
  display: flex;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--white);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
}

/* 分类导航 */
.category-nav {
  background: var(--white);
  padding: 12px 16px;
  overflow-x: auto;
  white-space: nowrap;
  position: sticky;
  top: 60px;
  z-index: 99;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.category-btn {
  display: inline-block;
  padding: 8px 16px;
  margin-right: 8px;
  border: 1px solid var(--light-gray);
  border-radius: 20px;
  background: var(--white);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn.active {
  background: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
}

/* 菜品网格 */
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
}

.dish-card {
  background: var(--white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.dish-card:active {
  transform: scale(0.98);
}

.dish-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  background: var(--light-gray);
}

.dish-info {
  padding: 12px;
}

.dish-name {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.dish-price {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1rem;
}

.dish-price::before {
  content: '¥';
}

.add-btn {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  min-height: 44px;
}

.add-btn:active {
  background: var(--secondary-color);
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  display: flex;
  justify-content: space-around;
  padding: 8px 16px;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.nav-item {
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray);
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item span {
  display: block;
  font-size: 1.5rem;
}

.nav-item label {
  font-size: 0.75rem;
}

/* 购物袋徽章 */
.cart-badge {
  position: fixed;
  bottom: 60px;
  right: 16px;
  background: var(--primary-color);
  color: var(--white);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  cursor: pointer;
  z-index: 200;
}

.cart-badge .count {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--danger);
  color: var(--white);
  font-size: 0.75rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 购物袋弹窗 */
.cart-modal {
  position: fixed;
  bottom: -100%;
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  overflow-y: auto;
  transition: bottom 0.3s;
  z-index: 300;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.2);
}

.cart-modal.open {
  bottom: 0;
}

.cart-header {
  padding: 16px;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-items {
  padding: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--light-gray);
}

.cart-item-info {
  flex: 1;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--light-gray);
  background: var(--white);
  cursor: pointer;
}

.cart-footer {
  padding: 16px;
  border-top: 1px solid var(--light-gray);
}

.cart-total {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: right;
}

.cart-actions {
  display: flex;
  gap: 8px;
}

.cart-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 44px;
}

.checkout-btn {
  background: var(--primary-color);
  color: var(--white);
}

.clear-btn {
  background: var(--light-gray);
  color: var(--text-color);
}

/* 订单备注 */
.note-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-gray);
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

/* 订单记录 */
.order-list {
  padding: 16px;
}

.order-item {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.order-date {
  color: var(--gray);
  font-size: 0.85rem;
}

.order-total {
  color: var(--primary-color);
  font-weight: 600;
}

.order-items {
  color: var(--gray);
  font-size: 0.9rem;
}

.order-note {
  margin-top: 8px;
  color: var(--secondary-color);
  font-size: 0.85rem;
}

/* 弹窗遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 250;
  display: none;
}

.modal-overlay.show {
  display: block;
}

/* Toast 提示 */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: var(--white);
  padding: 16px 24px;
  border-radius: 8px;
  z-index: 400;
  display: none;
}

.toast.show {
  display: block;
}

/* 管理界面样式 */
.admin-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: var(--white);
  padding: 16px;
  text-align: center;
}

.admin-menu {
  padding: 16px;
}

.admin-menu-item {
  display: block;
  width: 100%;
  padding: 16px;
  margin-bottom: 8px;
  background: var(--white);
  border: none;
  border-radius: 12px;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.admin-menu-item::after {
  content: '>';
  float: right;
  color: var(--gray);
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input, .form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-gray);
  border-radius: 8px;
  font-size: 1rem;
}

.form-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.delete-btn {
  background: var(--danger);
}

/* 图片上传预览 */
.image-preview {
  width: 100%;
  height: 200px;
  background: var(--light-gray);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
}

.image-preview span {
  color: var(--gray);
}

/* 响应式 */
@media (min-width: 768px) {
  .dish-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 24px;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
  }
}
```

---

## 工具函数

### Task 3: 编写工具函数

**Files:**
- Modify: `js/utils.js`

**Step 1: 写入工具函数**

```javascript
// 生成 UUID
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 图片压缩
async function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 计算缩放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片压缩失败'));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

// Blob 转 DataURL
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Blob转换失败'));
    reader.readAsDataURL(blob);
  });
}

// 格式化日期
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 显示 Toast 提示
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast') || createToast();
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function createToast() {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  document.body.appendChild(toast);
  return toast;
}

// 确认对话框
function confirmDialog(message) {
  return new Promise((resolve) => {
    if (confirm(message)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}
```

---

## IndexedDB 封装

### Task 4: 编写数据库封装

**Files:**
- Modify: `js/db.js`

**Step 1: 写入数据库封装**

```javascript
class FoodDB {
  constructor(dbName = 'foodForXiaoLi', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
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
      store.put(cat);
    }
  }

  // 菜品操作
  async addDish(dish) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readwrite');
      const store = transaction.objectStore('dishes');
      const request = store.add(dish);

      request.onsuccess = () => resolve(dish.id);
      request.onerror = () => reject(new Error('添加菜品失败'));
    });
  }

  async updateDish(dish) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readwrite');
      const store = transaction.objectStore('dishes');
      const request = store.put(dish);

      request.onsuccess = () => resolve(dish.id);
      request.onerror = () => reject(new Error('更新菜品失败'));
    });
  }

  async deleteDish(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dishes'], 'readwrite');
      const store = transaction.objectStore('dishes');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除菜品失败'));
    });
  }

  async getDishes(category = null) {
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
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);

      request.onsuccess = () => resolve(category.id);
      request.onerror = () => reject(new Error('添加分类失败'));
    });
  }

  async updateCategory(category) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);

      request.onsuccess = () => resolve(category.id);
      request.onerror = () => reject(new Error('更新分类失败'));
    });
  }

  async deleteCategory(id) {
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
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const request = store.add(order);

      request.onsuccess = () => resolve(order.id);
      request.onerror = () => reject(new Error('添加订单失败'));
    });
  }

  async getOrders() {
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
```

---

## 点餐端 HTML

### Task 5: 编写点餐端 HTML

**Files:**
- Modify: `index.html`

**Step 1: 写入点餐端 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>小🍐 专属点餐台</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- 顶部栏 -->
  <header class="header">
    <h1>小🍐 专属点餐台</h1>
    <div class="header-icons">
      <button class="icon-btn" id="settingsBtn">⚙️</button>
      <button class="icon-btn" id="historyBtn">📋</button>
    </div>
  </header>

  <!-- 分类导航 -->
  <nav class="category-nav" id="categoryNav">
    <!-- 动态生成分类按钮 -->
  </nav>

  <!-- 菜品列表 -->
  <main class="dish-grid" id="dishGrid">
    <!-- 动态生成菜品卡片 -->
  </main>

  <!-- 购物袋按钮 -->
  <div class="cart-badge" id="cartBadge">
    🛒
    <span class="count" id="cartCount" style="display: none;">0</span>
  </div>

  <!-- 购物袋弹窗 -->
  <div class="cart-modal" id="cartModal">
    <div class="cart-header">
      <h2>购物袋</h2>
      <button class="icon-btn" id="closeCartBtn">✕</button>
    </div>
    <div class="cart-items" id="cartItems">
      <!-- 动态生成购物车项目 -->
    </div>
    <div class="cart-footer">
      <input type="text" class="note-input" id="orderNote" placeholder="备注：少辣、免葱等">
      <div class="cart-total">
        总计: <span id="cartTotal">¥0</span>
      </div>
      <div class="cart-actions">
        <button class="clear-btn" id="clearCartBtn">清空</button>
        <button class="checkout-btn" id="checkoutBtn">去结算</button>
      </div>
    </div>
  </div>

  <!-- 订单记录界面 -->
  <div id="orderHistory" style="display: none;">
    <header class="header">
      <h1>订单记录</h1>
      <button class="icon-btn" id="backBtn">←</button>
    </header>
    <main class="order-list" id="orderList">
      <!-- 动态生成订单列表 -->
    </main>
  </div>

  <!-- 管理菜单 -->
  <div class="modal-overlay" id="menuOverlay"></div>
  <div class="admin-menu" id="adminMenu" style="display: none; position: fixed; top: 60px; right: 16px; background: white; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 300; min-width: 160px;">
    <button class="admin-menu-item" id="manageDishesBtn">🍽️ 菜品管理</button>
    <button class="admin-menu-item" id="manageCategoriesBtn">📂 分类管理</button>
    <button class="admin-menu-item" id="manageOrdersBtn">📋 订单记录</button>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script src="js/utils.js"></script>
  <script src="js/db.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

---

## 管理端 HTML

### Task 6: 编写管理端 HTML

**Files:**
- Modify: `admin.html`

**Step 1: 写入管理端 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>管理后台 - 小🍐 专属点餐台</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="admin-header">
    <h1>管理后台</h1>
    <button class="icon-btn" onclick="window.location.href='index.html'">← 返回</button>
  </header>

  <!-- 菜品管理 -->
  <main id="dishManagement" style="padding: 16px;">
    <h2 style="margin-bottom: 16px;">菜品管理</h2>
    <button class="form-btn" id="addDishBtn" style="margin-bottom: 16px;">+ 添加菜品</button>
    <div class="dish-grid" id="adminDishGrid">
      <!-- 动态生成菜品卡片 -->
    </div>
  </main>

  <!-- 分类管理 -->
  <main id="categoryManagement" style="padding: 16px; display: none;">
    <h2 style="margin-bottom: 16px;">分类管理</h2>
    <button class="form-btn" id="addCategoryBtn" style="margin-bottom: 16px;">+ 添加分类</button>
    <div id="categoryList">
      <!-- 动态生成分类列表 -->
    </div>
  </main>

  <!-- 添加/编辑菜品表单弹窗 -->
  <div class="modal-overlay" id="dishModalOverlay"></div>
  <div class="cart-modal" id="dishModal" style="max-height: 90vh;">
    <div class="cart-header">
      <h2 id="dishModalTitle">添加菜品</h2>
      <button class="icon-btn" id="closeDishModal">✕</button>
    </div>
    <div style="padding: 16px;">
      <input type="hidden" id="dishId">
      <div class="form-group">
        <label class="form-label">菜名</label>
        <input type="text" class="form-input" id="dishName" placeholder="请输入菜名">
      </div>
      <div class="form-group">
        <label class="form-label">价格</label>
        <input type="number" class="form-input" id="dishPrice" placeholder="请输入价格" step="0.5">
      </div>
      <div class="form-group">
        <label class="form-label">分类</label>
        <select class="form-select" id="dishCategory">
          <!-- 动态生成分类选项 -->
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">菜品图片</label>
        <div class="image-preview" id="imagePreview">
          <span>点击上传图片</span>
        </div>
        <input type="file" id="dishImage" accept="image/*" style="display: none;">
        <button class="form-btn" id="selectImageBtn" style="background: var(--secondary-color);">选择图片</button>
      </div>
      <button class="form-btn" id="saveDishBtn">保存</button>
      <button class="form-btn delete-btn" id="deleteDishBtn" style="display: none; margin-top: 8px;">删除菜品</button>
    </div>
  </div>

  <!-- 添加/编辑分类表单弹窗 -->
  <div class="modal-overlay" id="categoryModalOverlay"></div>
  <div class="cart-modal" id="categoryModal" style="max-height: 60vh;">
    <div class="cart-header">
      <h2 id="categoryModalTitle">添加分类</h2>
      <button class="icon-btn" id="closeCategoryModal">✕</button>
    </div>
    <div style="padding: 16px;">
      <input type="hidden" id="categoryId">
      <div class="form-group">
        <label class="form-label">分类名称</label>
        <input type="text" class="form-input" id="categoryName" placeholder="请输入分类名称">
      </div>
      <button class="form-btn" id="saveCategoryBtn">保存</button>
      <button class="form-btn delete-btn" id="deleteCategoryBtn" style="display: none; margin-top: 8px;">删除分类</button>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script src="js/utils.js"></script>
  <script src="js/db.js"></script>
  <script src="js/admin.js"></script>
</body>
</html>
```

---

## 点餐端逻辑

### Task 7: 编写点餐端逻辑

**Files:**
- Modify: `js/app.js`

**Step 1: 写入点餐端逻辑**

```javascript
// 全局状态
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let categories = [];
let dishes = [];

// 初始化
async function init() {
  try {
    await db.init();
    await loadCategories();
    await loadDishes();
    renderCategories();
    renderDishes();
    updateCartBadge();
    bindEvents();
  } catch (error) {
    console.error('初始化失败:', error);
    showToast('初始化失败，请刷新页面重试');
  }
}

// 加载分类
async function loadCategories() {
  categories = await db.getCategories();
}

// 加载菜品
async function loadDishes() {
  dishes = await db.getDishes(currentCategory);
}

// 渲染分类
function renderCategories() {
  const nav = document.getElementById('categoryNav');
  nav.innerHTML = categories.map(cat => `
    <button class="category-btn ${cat.id === currentCategory ? 'active' : ''}" data-id="${cat.id}">
      ${cat.name}
    </button>
  `).join('');
}

// 渲染菜品
async function renderDishes() {
  const grid = document.getElementById('dishGrid');

  if (dishes.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 40px;">暂无菜品</p>';
    return;
  }

  const dishesHtml = await Promise.all(dishes.map(async dish => {
    const imageUrl = await blobToDataURL(dish.image);
    const cartItem = cart.find(item => item.dishId === dish.id);
    const qty = cartItem ? cartItem.quantity : 0;

    return `
      <div class="dish-card" data-id="${dish.id}">
        <img src="${imageUrl}" alt="${dish.name}" class="dish-image">
        <div class="dish-info">
          <h3 class="dish-name">${dish.name}</h3>
          <p class="dish-price">${dish.price.toFixed(2)}</p>
          <button class="add-btn" data-id="${dish.id}">
            ${qty > 0 ? `已选 ${qty}` : '加入购物袋'}
          </button>
        </div>
      </div>
    `;
  }));

  grid.innerHTML = dishesHtml.join('');
}

// 更新购物袋徽章
function updateCartBadge() {
  const countEl = document.getElementById('cartCount');
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQty > 0) {
    countEl.textContent = totalQty;
    countEl.style.display = 'flex';
  } else {
    countEl.style.display = 'none';
  }

  localStorage.setItem('cart', JSON.stringify(cart));
}

// 打开购物袋
function openCart() {
  const modal = document.getElementById('cartModal');
  const overlay = document.getElementById('menuOverlay');
  modal.classList.add('open');
  overlay.classList.add('show');
  renderCartItems();
}

// 关闭购物袋
function closeCart() {
  const modal = document.getElementById('cartModal');
  const overlay = document.getElementById('menuOverlay');
  modal.classList.remove('open');
  overlay.classList.remove('show');
}

// 渲染购物车项目
async function renderCartItems() {
  const container = document.getElementById('cartItems');

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">购物袋是空的</p>';
    document.getElementById('cartTotal').textContent = '¥0';
    return;
  }

  const itemsHtml = await Promise.all(cart.map(async item => {
    const dish = dishes.find(d => d.id === item.dishId);
    if (!dish) return '';

    return `
      <div class="cart-item" data-id="${item.dishId}">
        <div class="cart-item-info">
          <strong>${dish.name}</strong>
          <br>
          <small>¥${dish.price.toFixed(2)}</small>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn minus" data-id="${item.dishId}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus" data-id="${item.dishId}">+</button>
        </div>
      </div>
    `;
  }));

  container.innerHTML = itemsHtml.join('');

  // 计算总价
  const total = cart.reduce((sum, item) => {
    const dish = dishes.find(d => d.id === item.dishId);
    return sum + (dish ? dish.price * item.quantity : 0);
  }, 0);

  document.getElementById('cartTotal').textContent = `¥${total.toFixed(2)}`;
}

// 添加到购物车
function addToCart(dishId) {
  const existingItem = cart.find(item => item.dishId === dishId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    const dish = dishes.find(d => d.id === dishId);
    if (dish) {
      cart.push({
        dishId,
        dishName: dish.name,
        quantity: 1,
        price: dish.price
      });
    }
  }

  updateCartBadge();
  renderDishes();
  showToast('已加入购物袋');
}

// 更新购物车数量
function updateCartQuantity(dishId, delta) {
  const item = cart.find(i => i.dishId === dishId);

  if (item) {
    item.quantity += delta;

    if (item.quantity <= 0) {
      cart = cart.filter(i => i.dishId !== dishId);
    }
  }

  updateCartBadge();
  renderCartItems();
  renderDishes();
}

// 清空购物车
function clearCart() {
  cart = [];
  updateCartBadge();
  renderCartItems();
  renderDishes();
}

// 结算
async function checkout() {
  if (cart.length === 0) {
    showToast('请先选择菜品');
    return;
  }

  const note = document.getElementById('orderNote').value.trim();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    id: generateId(),
    items: [...cart],
    totalAmount: total,
    note,
    createdAt: Date.now()
  };

  try {
    await db.addOrder(order);
    showToast('下单成功！');
    clearCart();
    document.getElementById('orderNote').value = '';
    closeCart();
  } catch (error) {
    console.error('下单失败:', error);
    showToast('下单失败，请重试');
  }
}

// 加载订单记录
async function loadOrderHistory() {
  const orders = await db.getOrders();
  const list = document.getElementById('orderList');

  if (orders.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">暂无订单记录</p>';
    return;
  }

  list.innerHTML = orders.map(order => {
    const itemsSummary = order.items.map(item => `${item.dishName} x${item.quantity}`).join(', ');
    return `
      <div class="order-item">
        <div class="order-header">
          <span class="order-date">${formatDate(order.createdAt)}</span>
          <span class="order-total">¥${order.totalAmount.toFixed(2)}</span>
        </div>
        <div class="order-items">${itemsSummary}</div>
        ${order.note ? `<div class="order-note">备注: ${order.note}</div>` : ''}
      </div>
    `;
  }).join('');
}

// 绑定事件
function bindEvents() {
  // 分类切换
  document.getElementById('categoryNav').addEventListener('click', async (e) => {
    if (e.target.classList.contains('category-btn')) {
      currentCategory = e.target.dataset.id;
      renderCategories();
      await loadDishes();
      renderDishes();
    }
  });

  // 添加到购物车
  document.getElementById('dishGrid').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      addToCart(e.target.dataset.id);
    }
  });

  // 购物袋
  document.getElementById('cartBadge').addEventListener('click', openCart);
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);

  // 购物车操作
  document.getElementById('cartItems').addEventListener('click', (e) => {
    if (e.target.classList.contains('plus')) {
      updateCartQuantity(e.target.dataset.id, 1);
    } else if (e.target.classList.contains('minus')) {
      updateCartQuantity(e.target.dataset.id, -1);
    }
  });

  document.getElementById('clearCartBtn').addEventListener('click', clearCart);
  document.getElementById('checkoutBtn').addEventListener('click', checkout);

  // 点击遮罩关闭
  document.getElementById('menuOverlay').addEventListener('click', () => {
    closeCart();
    document.getElementById('adminMenu').style.display = 'none';
    document.getElementById('menuOverlay').classList.remove('show');
  });

  // 设置按钮
  document.getElementById('settingsBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('adminMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('menuOverlay').classList.toggle('show');
  });

  // 管理菜单项
  document.getElementById('manageDishesBtn').addEventListener('click', () => {
    window.location.href = 'admin.html?tab=dishes';
  });

  document.getElementById('manageCategoriesBtn').addEventListener('click', () => {
    window.location.href = 'admin.html?tab=categories';
  });

  document.getElementById('manageOrdersBtn').addEventListener('click', () => {
    window.location.href = 'admin.html?tab=orders';
  });

  // 历史记录
  document.getElementById('historyBtn').addEventListener('click', () => {
    document.getElementById('orderHistory').style.display = 'block';
    loadOrderHistory();
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('orderHistory').style.display = 'none';
  });
}

// 启动应用
init();
```

---

## 管理端逻辑

### Task 8: 编写管理端逻辑

**Files:**
- Modify: `js/admin.js`

**Step 1: 写入管理端逻辑**

```javascript
// 全局状态
let currentTab = 'dishes';
let dishes = [];
let categories = [];
let editingDish = null;
let editingCategory = null;
let selectedImage = null;

// 初始化
async function init() {
  try {
    await db.init();
    await loadData();

    // 获取当前标签页
    const urlParams = new URLSearchParams(window.location.search);
    currentTab = urlParams.get('tab') || 'dishes';

    switchTab(currentTab);
    bindEvents();
  } catch (error) {
    console.error('初始化失败:', error);
    showToast('初始化失败，请刷新页面重试');
  }
}

// 加载数据
async function loadData() {
  dishes = await db.getDishes();
  categories = await db.getCategories();
}

// 切换标签页
function switchTab(tab) {
  currentTab = tab;

  document.getElementById('dishManagement').style.display = tab === 'dishes' ? 'block' : 'none';
  document.getElementById('categoryManagement').style.display = tab === 'categories' ? 'block' : 'none';

  if (tab === 'dishes') {
    renderAdminDishes();
  } else if (tab === 'categories') {
    renderCategories();
  }
}

// 渲染管理端菜品列表
async function renderAdminDishes() {
  const grid = document.getElementById('adminDishGrid');

  if (dishes.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 40px;">暂无菜品</p>';
    return;
  }

  const dishesHtml = await Promise.all(dishes.map(async dish => {
    const imageUrl = await blobToDataURL(dish.image);
    return `
      <div class="dish-card" data-id="${dish.id}">
        <img src="${imageUrl}" alt="${dish.name}" class="dish-image">
        <div class="dish-info">
          <h3 class="dish-name">${dish.name}</h3>
          <p class="dish-price">${dish.price.toFixed(2)}</p>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="form-btn" onclick="editDish('${dish.id}')" style="padding: 8px; background: var(--secondary-color);">编辑</button>
            <button class="form-btn delete-btn" onclick="deleteDish('${dish.id}')" style="padding: 8px;">删除</button>
          </div>
        </div>
      </div>
    `;
  }));

  grid.innerHTML = dishesHtml.join('');
}

// 渲染分类列表
function renderCategories() {
  const list = document.getElementById('categoryList');

  if (categories.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">暂无分类</p>';
    return;
  }

  list.innerHTML = categories.map(cat => `
    <div class="order-item" data-id="${cat.id}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 1rem;">${cat.name}</span>
        ${cat.id !== 'all' ? `
          <div>
            <button onclick="editCategory('${cat.id}')" style="background: var(--secondary-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px;">编辑</button>
            <button onclick="deleteCategory('${cat.id}')" style="background: var(--danger); color: white; border: none; padding: 6px 12px; border-radius: 4px;">删除</button>
          </div>
        ` : '<span style="color: var(--gray); font-size: 0.85rem;">默认分类</span>'}
      </div>
    </div>
  `).join('');
}

// 打开菜品表单
async function openDishModal(dish = null) {
  editingDish = dish;
  selectedImage = null;

  const modal = document.getElementById('dishModal');
  const overlay = document.getElementById('dishModalOverlay');
  const title = document.getElementById('dishModalTitle');
  const deleteBtn = document.getElementById('deleteDishBtn');

  // 填充分类选项
  const categorySelect = document.getElementById('dishCategory');
  categorySelect.innerHTML = categories.filter(c => c.id !== 'all').map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');

  if (dish) {
    title.textContent = '编辑菜品';
    document.getElementById('dishId').value = dish.id;
    document.getElementById('dishName').value = dish.name;
    document.getElementById('dishPrice').value = dish.price;
    document.getElementById('dishCategory').value = dish.category;
    deleteBtn.style.display = 'block';

    const imageUrl = await blobToDataURL(dish.image);
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${imageUrl}" style="max-width: 100%; max-height: 100%;">`;
    selectedImage = dish.image;
  } else {
    title.textContent = '添加菜品';
    document.getElementById('dishId').value = '';
    document.getElementById('dishName').value = '';
    document.getElementById('dishPrice').value = '';
    deleteBtn.style.display = 'none';
    document.getElementById('imagePreview').innerHTML = '<span>点击上传图片</span>';
  }

  modal.classList.add('open');
  overlay.classList.add('show');
}

// 关闭菜品表单
function closeDishModal() {
  document.getElementById('dishModal').classList.remove('open');
  document.getElementById('dishModalOverlay').classList.remove('show');
  editingDish = null;
  selectedImage = null;
}

// 保存菜品
async function saveDish() {
  const name = document.getElementById('dishName').value.trim();
  const price = parseFloat(document.getElementById('dishPrice').value);
  const category = document.getElementById('dishCategory').value;

  if (!name) {
    showToast('请输入菜名');
    return;
  }

  if (isNaN(price) || price <= 0) {
    showToast('请输入有效的价格');
    return;
  }

  if (!selectedImage) {
    showToast('请上传菜品图片');
    return;
  }

  try {
    if (editingDish) {
      await db.updateDish({
        ...editingDish,
        name,
        price,
        category,
        image: selectedImage
      });
      showToast('菜品更新成功');
    } else {
      const dish = {
        id: generateId(),
        name,
        price,
        category,
        image: selectedImage,
        createdAt: Date.now()
      };
      await db.addDish(dish);
      showToast('菜品添加成功');
    }

    await loadData();
    renderAdminDishes();
    closeDishModal();
  } catch (error) {
    console.error('保存菜品失败:', error);
    showToast('保存失败，请重试');
  }
}

// 编辑菜品
async function editDish(id) {
  const dish = await db.getDish(id);
  if (dish) {
    openDishModal(dish);
  }
}

// 删除菜品
async function deleteDish(id) {
  const confirmed = await confirmDialog('确定要删除这个菜品吗？');
  if (confirmed) {
    try {
      await db.deleteDish(id);
      showToast('菜品删除成功');
      await loadData();
      renderAdminDishes();
    } catch (error) {
      console.error('删除菜品失败:', error);
      showToast('删除失败，请重试');
    }
  }
}

// 打开分类表单
function openCategoryModal(category = null) {
  editingCategory = category;

  const modal = document.getElementById('categoryModal');
  const overlay = document.getElementById('categoryModalOverlay');
  const title = document.getElementById('categoryModalTitle');
  const deleteBtn = document.getElementById('deleteCategoryBtn');

  if (category) {
    title.textContent = '编辑分类';
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    deleteBtn.style.display = 'block';
  } else {
    title.textContent = '添加分类';
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    deleteBtn.style.display = 'none';
  }

  modal.classList.add('open');
  overlay.classList.add('show');
}

// 关闭分类表单
function closeCategoryModal() {
  document.getElementById('categoryModal').classList.remove('open');
  document.getElementById('categoryModalOverlay').classList.remove('show');
  editingCategory = null;
}

// 保存分类
async function saveCategory() {
  const name = document.getElementById('categoryName').value.trim();

  if (!name) {
    showToast('请输入分类名称');
    return;
  }

  try {
    if (editingCategory) {
      await db.updateCategory({
        ...editingCategory,
        name
      });
      showToast('分类更新成功');
    } else {
      const category = {
        id: generateId(),
        name,
        order: categories.length
      };
      await db.addCategory(category);
      showToast('分类添加成功');
    }

    await loadData();
    renderCategories();
    closeCategoryModal();
  } catch (error) {
    console.error('保存分类失败:', error);
    showToast('保存失败，请重试');
  }
}

// 编辑分类
function editCategory(id) {
  const category = categories.find(c => c.id === id);
  if (category) {
    openCategoryModal(category);
  }
}

// 删除分类
async function deleteCategory(id) {
  const confirmed = await confirmDialog('确定要删除这个分类吗？该分类下的菜品将被移至未分类状态。');
  if (confirmed) {
    try {
      await db.deleteCategory(id);
      showToast('分类删除成功');
      await loadData();
      renderCategories();
    } catch (error) {
      console.error('删除分类失败:', error);
      showToast('删除失败，请重试');
    }
  }
}

// 绑定事件
function bindEvents() {
  // 菜品管理
  document.getElementById('addDishBtn').addEventListener('click', () => openDishModal());
  document.getElementById('closeDishModal').addEventListener('click', closeDishModal);
  document.getElementById('saveDishBtn').addEventListener('click', saveDish);
  document.getElementById('deleteDishBtn').addEventListener('click', async () => {
    if (editingDish) {
      await deleteDish(editingDish.id);
    }
  });

  // 图片选择
  document.getElementById('selectImageBtn').addEventListener('click', () => {
    document.getElementById('dishImage').click();
  });

  document.getElementById('dishImage').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        const imageUrl = await blobToDataURL(compressed);
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${imageUrl}" style="max-width: 100%; max-height: 100%;">`;
        selectedImage = compressed;
      } catch (error) {
        console.error('图片处理失败:', error);
        showToast('图片处理失败，请重试');
      }
    }
  });

  // 分类管理
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
  document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
  document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
  document.getElementById('deleteCategoryBtn').addEventListener('click', async () => {
    if (editingCategory) {
      await deleteCategory(editingCategory.id);
    }
  });

  // 遮罩点击关闭
  document.getElementById('dishModalOverlay').addEventListener('click', closeDishModal);
  document.getElementById('categoryModalOverlay').addEventListener('click', closeCategoryModal);
}

// 导出全局函数供 HTML 调用
window.editDish = editDish;
window.deleteDish = deleteDish;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// 启动
init();
```
