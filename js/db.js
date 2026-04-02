// ========== 工具函数 ==========

// Blob 转 Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 获取 Firestore 实例
function getFS() {
  return window.db;
}

// ========== 菜品操作 ==========

async function addDish(dish) {
  try {
    let imageData = dish.image;
    if (dish.image instanceof Blob) {
      imageData = await blobToBase64(dish.image);
    }
    const dishData = {
      ...dish,
      image: imageData,
      createdAt: Date.now()
    };
    await getFS().collection('dishes').doc(dish.id).set(dishData);
    return dish.id;
  } catch (error) {
    console.error('添加菜品失败:', error);
    throw error;
  }
}

async function updateDish(dish) {
  try {
    let imageData = dish.image;
    if (dish.image instanceof Blob) {
      imageData = await blobToBase64(dish.image);
    }
    const dishData = {
      ...dish,
      image: imageData
    };
    await getFS().collection('dishes').doc(dish.id).set(dishData);
    return dish.id;
  } catch (error) {
    console.error('更新菜品失败:', error);
    throw error;
  }
}

async function deleteDish(id) {
  try {
    await getFS().collection('dishes').doc(id).delete();
  } catch (error) {
    console.error('删除菜品失败:', error);
    throw error;
  }
}

async function getDishes(category = null) {
  try {
    let query = getFS().collection('dishes');
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('获取菜品失败:', error);
    throw error;
  }
}

async function getDish(id) {
  try {
    const doc = await getFS().collection('dishes').doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('获取菜品失败:', error);
    throw error;
  }
}

// ========== 分类操作 ==========

async function getCategories() {
  try {
    const snapshot = await getFS().collection('categories').orderBy('order').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('获取分类失败:', error);
    throw error;
  }
}

async function addCategory(category) {
  try {
    await getFS().collection('categories').doc(category.id).set(category);
    return category.id;
  } catch (error) {
    console.error('添加分类失败:', error);
    throw error;
  }
}

async function updateCategory(category) {
  try {
    await getFS().collection('categories').doc(category.id).set(category);
    return category.id;
  } catch (error) {
    console.error('更新分类失败:', error);
    throw error;
  }
}

async function deleteCategory(id) {
  try {
    const dishesSnapshot = await getFS().collection('dishes').where('category', '==', id).get();
    const batch = getFS().batch();
    dishesSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { category: 'all' });
    });
    await batch.commit();

    await getFS().collection('categories').doc(id).delete();
  } catch (error) {
    console.error('删除分类失败:', error);
    throw error;
  }
}

async function getCategory(id) {
  try {
    const doc = await getFS().collection('categories').doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('获取分类失败:', error);
    throw error;
  }
}

// ========== 订单操作 ==========

async function addOrder(order) {
  try {
    await getFS().collection('orders').doc(order.id).set(order);
    return order.id;
  } catch (error) {
    console.error('添加订单失败:', error);
    throw error;
  }
}

async function getOrders() {
  try {
    const snapshot = await getFS().collection('orders').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('获取订单失败:', error);
    throw error;
  }
}

async function getOrder(id) {
  try {
    const doc = await getFS().collection('orders').doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('获取订单失败:', error);
    throw error;
  }
}

// ========== 初始化 ==========

async function initDefaultCategories() {
  const defaults = [
    { id: 'all', name: '全部', order: 0 },
    { id: 'main', name: '主食', order: 1 },
    { id: 'soup', name: '汤品', order: 2 },
    { id: 'dessert', name: '甜点', order: 3 }
  ];

  for (const cat of defaults) {
    const doc = await getFS().collection('categories').doc(cat.id).get();
    if (!doc.exists) {
      await getFS().collection('categories').doc(cat.id).set(cat);
    }
  }
}

// 将方法添加到全局 db 对象上
window.db.init = initDefaultCategories;
window.db.getDishes = getDishes;
window.db.getDish = getDish;
window.db.addDish = addDish;
window.db.updateDish = updateDish;
window.db.deleteDish = deleteDish;
window.db.getCategories = getCategories;
window.db.getCategory = getCategory;
window.db.addCategory = addCategory;
window.db.updateCategory = updateCategory;
window.db.deleteCategory = deleteCategory;
window.db.getOrders = getOrders;
window.db.getOrder = getOrder;
window.db.addOrder = addOrder;
