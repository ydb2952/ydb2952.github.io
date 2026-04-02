// 全局状态
let cart;
try {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (e) {
  console.error('购物车数据解析失败:', e);
  cart = [];
}
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
    const errorMsg = error?.message || error?.toString() || '未知错误';
    showToast(`初始化失败: ${errorMsg}，请稍后重试`);
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
async function clearCart() {
  if (cart.length === 0) return;
  const confirmed = await confirmDialog('确定要清空购物袋吗？');
  if (confirmed) {
    cart = [];
    updateCartBadge();
    renderCartItems();
    renderDishes();
  }
}

// 结算
async function checkout() {
  if (cart.length === 0) {
    showToast('请先选择菜品');
    return;
  }

  const note = document.getElementById('orderNote').value.trim();
  const total = cart.reduce((sum, item) => {
    const dish = dishes.find(d => d.id === item.dishId);
    return sum + (dish ? dish.price * item.quantity : 0);
  }, 0);

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
  });

  // 设置按钮
  document.getElementById('settingsBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('adminMenu');
    const isHidden = menu.style.display !== 'block';
    menu.style.display = isHidden ? 'block' : 'none';
    document.getElementById('menuOverlay').classList.toggle('show', isHidden);
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
    document.getElementById('orderHistory').classList.remove('order-history');
    loadOrderHistory();
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('orderHistory').classList.add('order-history');
  });
}

// 启动应用
init();
