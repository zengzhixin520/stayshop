// 全局错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// 全局变量
let cart = [];
let currentGallery = [];
let currentImageIndex = 0;

// 加载动画
window.addEventListener('load', () => {
    try {
        const loader = document.querySelector('.loader');
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 2000);
    } catch (error) {
        console.error('Loader error:', error);
    }
});

// 路由配置
const routes = {
    home: () => renderHome(),
    products: () => renderProducts()
};

// 首页内容
function renderHome() {
    try {
        document.getElementById('home').style.display = 'block';
        return '';
    } catch (error) {
        console.error('Error rendering home:', error);
        return '<div>Error loading home page</div>';
    }
}

// 产品展示页面
function renderProducts() {
    try {
        console.log("加载产品页面");
        document.getElementById('home').style.display = 'none';
        return `
            <div class="products-section">
                <h2 class="section-title">No one but you</h2>
                
                <div class="product-grid">
                    <!-- 产品 1 -->
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://i.ibb.co/WKr2cWm/20241121170535.jpg" 
                                 onclick="showImageGallery(['https://i.ibb.co/WKr2cWm/20241121170535.jpg', 'https://i.ibb.co/4F8YRvj/20241121170538.jpg', 'https://i.ibb.co/h8xyyDK/20241121170531.jpg'])">
                        </div>
                        <div class="product-info">
                            <p class="price">€135</p>
                            <button onclick="addToCart('Watch 1', 135, 'https://i.ibb.co/WKr2cWm/20241121170535.jpg')" class="buy-button">Add to Cart</button>
                        </div>
                    </div>

                    <!-- 产品 2 -->
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://i.ibb.co/N2CR8bt/20241121170545.jpg" 
                                 onclick="showImageGallery(['https://i.ibb.co/N2CR8bt/20241121170545.jpg', 'https://i.ibb.co/1nWqznN/20241121170547.jpg', 'https://i.ibb.co/vvpRmw9/20241121170552.jpg'])">
                        </div>
                        <div class="product-info">
                            <p class="price">€135</p>
                            <button onclick="addToCart('Watch 2', 135, 'https://i.ibb.co/N2CR8bt/20241121170545.jpg')" class="buy-button">Add to Cart</button>
                        </div>
                    </div>

                    <!-- 产品 3 -->
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://i.ibb.co/BNNTq9x/20241121170105.jpg" 
                                 onclick="showImageGallery(['https://i.ibb.co/BNNTq9x/20241121170105.jpg', 'https://i.ibb.co/TMRHYgP/20241121231418.jpg'])">
                        </div>
                        <div class="product-info">
                            <p class="price">€140</p>
                            <button onclick="addToCart('Watch 3', 140, 'https://i.ibb.co/BNNTq9x/20241121170105.jpg')" class="buy-button">Add to Cart</button>
                        </div>
                    </div>

                    <!-- 产品 4 -->
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://i.ibb.co/j6Njxw5/20241121170542.jpg" 
                                 onclick="showImageGallery(['https://i.ibb.co/j6Njxw5/20241121170542.jpg', 'https://i.ibb.co/52VPWBk/20241121170602.jpg'])">
                        </div>
                        <div class="product-info">
                            <p class="price">€140</p>
                            <button onclick="addToCart('Watch 4', 140, 'https://i.ibb.co/j6Njxw5/20241121170542.jpg')" class="buy-button">Add to Cart</button>
                        </div>
                    </div>

                    <!-- 产品 5 -->
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://i.ibb.co/jbfNnTZ/20241121170557.jpg" 
                                 onclick="showImageGallery(['https://i.ibb.co/jbfNnTZ/20241121170557.jpg', 'https://i.ibb.co/Tcwm15F/20241121170549.jpg'])">
                        </div>
                        <div class="product-info">
                            <p class="price">€135</p>
                            <button onclick="addToCart('Watch 5', 135, 'https://i.ibb.co/jbfNnTZ/20241121170557.jpg')" class="buy-button">Add to Cart</button>
                        </div>
                    </div>

                    <!-- 产品 6 -->
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://i.ibb.co/HBhRkDP/20241121170600.jpg" 
                                 onclick="showImageGallery(['https://i.ibb.co/HBhRkDP/20241121170600.jpg'])">
                        </div>
                        <div class="product-info">
                            <p class="price">€135</p>
                            <button onclick="addToCart('Watch 6', 135, 'https://i.ibb.co/HBhRkDP/20241121170600.jpg')" class="buy-button">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering products:', error);
        return '<div>Error loading products</div>';
    }
}

// 购物车功能
function addToCart(name, price, imageUrl) {
    try {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1, imageUrl });
        }
        updateCartDisplay();
        const cartElement = document.getElementById('cart');
        cartElement.style.display = 'block';
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
    }
}

function removeFromCart(name) {
    try {
        cart = cart.filter(item => item.name !== name);
        updateCartDisplay();
        if (cart.length === 0) {
            document.getElementById('cart').style.display = 'none';
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

function updateQuantity(name, delta) {
    try {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity = Math.max(0, item.quantity + delta);
            if (item.quantity === 0) {
                removeFromCart(name);
            } else {
                updateCartDisplay();
            }
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

function updateCartDisplay() {
    try {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');
        
        let total = 0;
        let count = 0;
        
        cartItems.innerHTML = cart.map(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            return `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <span>${item.name}</span>
                        <span>€${item.price}</span>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button onclick="updateQuantity('${item.name}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity('${item.name}', 1)">+</button>
                        </div>
                        <button onclick="removeFromCart('${item.name}')" class="remove-button">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
        
        cartTotal.innerHTML = `Total: €${total}`;
        cartCount.innerHTML = count;
    } catch (error) {
        console.error('Error updating cart display:', error);
    }
}

function toggleCart() {
    try {
        const cartElement = document.getElementById('cart');
        cartElement.style.display = cartElement.style.display === 'none' ? 'block' : 'none';
    } catch (error) {
        console.error('Error toggling cart:', error);
    }
}

// 图片预览功能
function showImageGallery(images) {
    try {
        currentGallery = images;
        currentImageIndex = 0;
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        modal.style.display = 'block';
        modalImage.src = images[0];
    } catch (error) {
        console.error('Error showing image gallery:', error);
    }
}

function closeImageModal() {
    try {
        document.getElementById('image-modal').style.display = 'none';
    } catch (error) {
        console.error('Error closing image modal:', error);
    }
}

function prevImage() {
    try {
        currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
        document.getElementById('modal-image').src = currentGallery[currentImageIndex];
    } catch (error) {
        console.error('Error navigating to previous image:', error);
    }
}

function nextImage() {
    try {
        currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
        document.getElementById('modal-image').src = currentGallery[currentImageIndex];
    } catch (error) {
        console.error('Error navigating to next image:', error);
    }
}

// 支付功能
function checkout() {
    try {
        document.getElementById('checkout-modal').style.display = 'block';
    } catch (error) {
        console.error('Error opening checkout:', error);
    }
}

function closeCheckoutModal() {
    try {
        document.getElementById('checkout-modal').style.display = 'none';
        document.getElementById('paypal-buttons').style.display = 'none';
        document.getElementById('payment-methods').style.display = 'block';
    } catch (error) {
        console.error('Error closing checkout modal:', error);
    }
}

function validateAndPay() {
    try {
        const name = document.getElementById('shipping-name').value;
        const email = document.getElementById('shipping-email').value;
        const phone = document.getElementById('shipping-phone').value;
        const address = document.getElementById('shipping-address').value;
        const city = document.getElementById('shipping-city').value;
        const postal = document.getElementById('shipping-postal').value;
        const country = document.getElementById('shipping-country').value;

        if (!name || !email || !phone || !address || !city || !postal || !country) {
            alert('Please fill in all required fields');
            return;
        }

        const shippingInfo = {
            name, email, phone, address, city, postal, country
        };

        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));

        document.getElementById('payment-methods').style.display = 'none';
        document.getElementById('paypal-buttons').style.display = 'block';
        
        paypal.Buttons({
            createOrder: function(data, actions) {
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            currency_code: "EUR",
                            value: total
                        },
                        shipping: {
                            name: {
                                full_name: name
                            },
                            address: {
                                address_line_1: address,
                                admin_area_2: city,
                                postal_code: postal,
                                country_code: country
                            }
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // 准备订单详情
                    const orderDetails = cart.map(item => 
                        `${item.name} x ${item.quantity} (€${item.price * item.quantity})\n商品图片: ${item.imageUrl}`
                    ).join('\n\n');

                    // 发送邮件通知
                    emailjs.send("zzx20070209", "template_eh7xfx1", {
                        order_id: details.id,
                        customer_name: name,
                        customer_email: email,
                        customer_phone: phone,
                        shipping_address: address,
                        shipping_city: city,
                        shipping_postal: postal,
                        shipping_country: country,
                        order_details: orderDetails,
                        total_amount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
                        order_date: new Date().toLocaleString()
                    }).then(
                        function(response) {
                            console.log("邮件发送成功", response);
                            alert('Order completed! Thank you for your purchase.');
                            cart = [];
                            updateCartDisplay();
                            closeCheckoutModal();
                            localStorage.removeItem('shippingInfo');
                        },
                        function(error) {
                            console.error("邮件发送失败", error);
                            alert('Order completed, but email notification failed. Please contact support.');
                        }
                    );
                });
            }
        }).render('#paypal-buttons');
    } catch (error) {
        console.error('Error in payment process:', error);
        alert('An error occurred during payment. Please try again.');
    }
}

// 页面渲染函数
function renderPage() {
    try {
        console.log("页面渲染被触发");
        const hash = window.location.hash.slice(1) || 'home';
        console.log("当前页面:", hash);
        
        const content = document.getElementById('content');
        const render = routes[hash];
        
        if (render) {
            content.innerHTML = render();
        }
    } catch (error) {
        console.error('Error rendering page:', error);
    }
}

// 路由监听
window.addEventListener('hashchange', renderPage);
window.addEventListener('load', renderPage);

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    try {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        } else {
            navbar.style.background = 'rgba(26, 26, 26, 0.8)';
        }
    } catch (error) {
        console.error('Error updating navbar:', error);
    }
}); 