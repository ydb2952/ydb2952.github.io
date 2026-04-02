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

  const dishManagement = document.getElementById('dishManagement');
  const categoryManagement = document.getElementById('categoryManagement');
  const orderManagement = document.getElementById('orderManagement');

  dishManagement.style.display = 'none';
  categoryManagement.style.display = 'none';
  orderManagement.style.display = 'none';

  if (tab === 'dishes') {
    dishManagement.style.display = 'block';
    renderAdminDishes();
  } else if (tab === 'categories') {
    categoryManagement.style.display = 'block';
    renderCategories();
  } else if (tab === 'orders') {
    orderManagement.style.display = 'block';
    initOrderFilters().then(() => renderOrders());
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
    const imageUrl = dish.image ? await blobToDataURL(dish.image) : '';

    return `
      <div class="dish-card" data-id="${dish.id}">
        ${imageUrl ? `<img src="${imageUrl}" alt="${dish.name}" class="dish-image">` : '<div class="dish-image"></div>'}
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

// 渲染订单列表
async function renderOrders() {
  const orders = await db.getOrders();
  const list = document.getElementById('orderList');
  const filterYear = document.getElementById('filterYear').value;
  const filterMonth = document.getElementById('filterMonth').value;
  const filterDay = document.getElementById('filterDay').value;

  // 根据筛选条件过滤订单
  const filteredOrders = orders.filter(order => {
    const date = new Date(order.createdAt);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (filterYear && year !== filterYear) return false;
    if (filterMonth && month !== filterMonth) return false;
    if (filterDay && day !== filterDay) return false;
    return true;
  });

  if (filteredOrders.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">暂无订单记录</p>';
    return;
  }

  list.innerHTML = filteredOrders.map(order => {
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

// 初始化订单筛选器
function initOrderFilters() {
  return db.getOrders().then(orders => {
    const yearSelect = document.getElementById('filterYear');
    const monthSelect = document.getElementById('filterMonth');
    const daySelect = document.getElementById('filterDay');

    // 获取所有订单的年份、月份、日期
    const years = new Set();
    const months = new Set();
    const days = new Set();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      years.add(String(date.getFullYear()));
      months.add(String(date.getMonth() + 1).padStart(2, '0'));
      days.add(String(date.getDate()).padStart(2, '0'));
    });

    // 填充年份
    yearSelect.innerHTML = '<option value="">全部年份</option>';
    [...years].sort().reverse().forEach(year => {
      yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });

    // 填充月份
    monthSelect.innerHTML = '<option value="">全部月份</option>';
    ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].forEach(month => {
      if (months.has(month)) {
        monthSelect.innerHTML += `<option value="${month}">${month}月</option>`;
      }
    });

    // 填充日期
    daySelect.innerHTML = '<option value="">全部日期</option>';
    ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'].forEach(day => {
      if (days.has(day)) {
        daySelect.innerHTML += `<option value="${day}">${day}日</option>`;
      }
    });
  });
}

// 更新月份和日期筛选器
function updateMonthDayFilters() {
  const yearSelect = document.getElementById('filterYear');
  const monthSelect = document.getElementById('filterMonth');
  const selectedYear = yearSelect.value;
  const selectedMonth = monthSelect.value;

  // 如果选择了年份，只显示该年有的月份；如果没选年份，显示所有有订单的月份
  // 这里简化处理：直接重新初始化所有筛选器
  initOrderFilters();
  yearSelect.value = selectedYear;
  monthSelect.value = selectedMonth;
}

// 打开菜品表单
async function openDishModal(dish = null) {
  const modal = document.getElementById('dishModal');
  const overlay = document.getElementById('dishModalOverlay');
  const title = document.getElementById('dishModalTitle');
  const deleteBtn = document.getElementById('deleteDishBtn');

  // 先清空所有状态和输入框
  editingDish = null;
  selectedImage = null;
  document.getElementById('dishId').value = '';
  document.getElementById('dishName').value = '';
  document.getElementById('dishPrice').value = '';
  document.getElementById('dishImage').value = '';
  deleteBtn.classList.add('delete-dish-btn');
  document.getElementById('imagePreview').innerHTML = '<span>点击上传图片</span>';

  // 填充分类选项
  const categorySelect = document.getElementById('dishCategory');
  categorySelect.innerHTML = categories.filter(c => c.id !== 'all').map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');

  // 编辑模式：填充表单数据
  if (dish && typeof dish === 'object' && dish.id) {
    editingDish = dish;
    selectedImage = dish.image; // 现在是 URL 字符串
    title.textContent = '编辑菜品';
    document.getElementById('dishId').value = dish.id;
    document.getElementById('dishName').value = dish.name || '';
    document.getElementById('dishPrice').value = dish.price || '';
    document.getElementById('dishCategory').value = dish.category || '';
    deleteBtn.classList.remove('delete-dish-btn');

    // 显示图片预览
    if (dish.image) {
      const imageUrl = await blobToDataURL(dish.image);
      const preview = document.getElementById('imagePreview');
      preview.innerHTML = `<img src="${imageUrl}" style="max-width: 100%; max-height: 100%;">`;
    } else {
      document.getElementById('imagePreview').innerHTML = '<span>点击上传图片</span>';
    }
  } else {
    // 添加模式：标题和按钮
    title.textContent = '添加菜品';
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
    deleteBtn.classList.remove('delete-dish-btn');
  } else {
    title.textContent = '添加分类';
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    deleteBtn.classList.add('delete-dish-btn');
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
async function editCategory(id) {
  const category = await db.getCategory(id);
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

  // 分类管理
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
  document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
  document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);

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

  // 遮罩点击关闭
  document.getElementById('dishModalOverlay').addEventListener('click', closeDishModal);
  document.getElementById('categoryModalOverlay').addEventListener('click', closeCategoryModal);

  // 订单筛选
  document.getElementById('filterYear').addEventListener('change', () => {
    updateMonthDayFilters();
    renderOrders();
  });
  document.getElementById('filterMonth').addEventListener('change', renderOrders);
  document.getElementById('filterDay').addEventListener('change', renderOrders);
}

// 导出全局函数供 HTML 调用
window.openDishModal = openDishModal;
window.closeDishModal = closeDishModal;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.editDish = editDish;
window.deleteDish = deleteDish;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// 启动
if (window.firebaseReady) {
  init();
} else {
  window.onFirebaseReady = init;
}

