window.addEventListener('DOMContentLoaded', () => {
    let cart = [];

    // 1. NÚT MỞ / ĐÓNG GIỎ HÀNG
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');

    if (cartToggleBtn && cartSidebar) {
        cartToggleBtn.onclick = (e) => {
            e.preventDefault();
            cartSidebar.classList.toggle('active');
        };
    }

    if (cartCloseBtn && cartSidebar) {
        cartCloseBtn.onclick = (e) => {
            e.preventDefault();
            cartSidebar.classList.remove('active');
        };
    }

    // 2. NÚT LỌC MÓN (Mì & Cơm, Ăn vặt, Đồ uống)
    const filterBtns = document.querySelectorAll('.btn-filter');
    const foodCards = document.querySelectorAll('.food-card');

    filterBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            foodCards.forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                if (category === 'all') {
                    card.style.display = 'flex';
                } else if (category === 'main' && (title.includes('mì') || title.includes('cơm'))) {
                    card.style.display = 'flex';
                } else if (category === 'snack' && title.includes('bánh mì')) {
                    card.style.display = 'flex';
                } else if (category === 'drink' && title.includes('trà')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        };
    });

    // 3. NÚT THÊM MÓN
    const addBtns = document.querySelectorAll('.btn-add-cart');
    addBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const card = e.target.closest('.food-card');
            const name = card.querySelector('h3').innerText;
            const priceText = card.querySelector('.price').innerText;
            const price = parseInt(priceText.replace(/\D/g, ''));

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateCart();
            if (cartSidebar) cartSidebar.classList.add('active');
        };
    });

    // CẬP NHẬT GIAO DIỆN GIỎ HÀNG
    function updateCart() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total-price');

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.innerText = totalItems;

        if (cart.length === 0) {
            if (cartItems) cartItems.innerHTML = '<p class="empty-cart-msg">Giỏ hàng đang trống.</p>';
            if (cartTotal) cartTotal.innerText = '0đ';
            return;
        }

        let total = 0;
        if (cartItems) {
            cartItems.innerHTML = cart.map((item, index) => {
                const itemSum = item.price * item.quantity;
                total += itemSum;
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 0; border-bottom: 1px solid #fef08a;">
                        <div>
                            <strong style="color: #1e293b; display:block; font-size: 14px;">${item.name}</strong>
                            <small style="color: #64748b;">${item.price.toLocaleString('vi-VN')}đ x ${item.quantity}</small>
                        </div>
                        <div style="display:flex; align-items:center; gap: 8px;">
                            <span style="font-weight: bold; color: #ca8a04; font-size: 14px;">${itemSum.toLocaleString('vi-VN')}đ</span>
                            <button onclick="window.removeCartItem(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size: 16px;">✕</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (cartTotal) cartTotal.innerText = total.toLocaleString('vi-VN') + 'đ';
    }

    // XÓA MÓN
    window.removeCartItem = function(index) {
        cart.splice(index, 1);
        updateCart();
    };

    // 4. ĐẶT HÀNG FORM
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.onsubmit = (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                alert("⚠️ Giỏ hàng của bạn đang trống! Vui lòng chọn món trước.");
                return;
            }

            const name = document.getElementById('student-name').value;
            const id = document.getElementById('student-id').value;
            const address = document.getElementById('delivery-address').value;
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\n\n- Tên SV: ${name} (${id})\n- Giao đến: ${address}\n- Tổng tiền: ${totalPrice.toLocaleString('vi-VN')}đ\n\nĐơn hàng đã lưu vào hệ thống!`);

            cart = [];
            updateCart();
            checkoutForm.reset();
            if (cartSidebar) cartSidebar.classList.remove('active');
        };
    }

    // 5. NÚT ĐĂNG NHẬP
    const loginBtn = document.getElementById('login-modal-btn');
    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.preventDefault();
            const studentId = prompt("Nhập Mã Sinh Viên của bạn để đăng nhập:", "23110218");
            if (studentId) {
                alert(`Xin chào sinh viên (${studentId})! Bạn đã đăng nhập hệ thống FoodHòaLạc.`);
                loginBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> <span>SV ${studentId}</span>`;
            }
        };
    }
});

