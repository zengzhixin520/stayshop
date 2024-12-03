window.addEventListener('load', () => {
    document.querySelector('.loader').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.loader').style.display = 'none';
    }, 500);
    loadCart();
    startImageSlider();
    loadOrders();
});

function startImageSlider() {
    const images = document.querySelectorAll('.slider-image');
    let currentIndex = 0;

    setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }, 1600);
}

let cart = [];
let currentImages = [];
let currentImageIndex = 0;

function saveCart() {
    localStorage.setItem('stayshop-cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('stayshop-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartCount.textContent = cart.length;
    
    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>€${item.price}</p>
                </div>
                <button onclick="removeFromCart('${item.name}')" class="remove-button">×</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.innerHTML = `
            <p>Total: €${total}</p>
            <button onclick="checkout()" class="buy-button">Checkout</button>
        `;
    }
}

function addToCart(name, price, image) {
    cart.push({ name, price, image });
    saveCart();
    updateCart();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Added to cart!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function removeFromCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index > -1) {
        cart.splice(index, 1);
        saveCart();
        updateCart();
    }
}

function toggleCart() {
    const cart = document.getElementById('cart');
    cart.style.display = cart.style.display === 'none' ? 'block' : 'none';
}

function checkout() {
    showCheckoutForm();
}

// Order Status Constants
const ORDER_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Order Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered'
};

// Update checkout form to English
function showCheckoutForm() {
    console.log('Showing checkout form');
    const checkoutForm = document.getElementById('checkout-form');
    const proceedCheckoutButton = document.getElementById('proceed-checkout');
    
    if (checkoutForm && proceedCheckoutButton) {
        checkoutForm.innerHTML = `
            <h3>Shipping Information</h3>
            <form id="shipping-form">
                <input type="text" name="name" placeholder="Full Name" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="text" name="phone" placeholder="Phone Number" required>
                <input type="text" name="address" placeholder="Shipping Address" required>
                <textarea name="note" placeholder="Order Notes (Optional)"></textarea>
            </form>
            <div id="paypal-button-container"></div>
        `;
        
        checkoutForm.style.display = 'block';
        proceedCheckoutButton.style.display = 'none';
        initPayPalButton();
    }
}

// Order confirmation email template
function sendOrderConfirmationEmail(orderDetails) {
    emailjs.send("service_id", "template_id", {
        to_email: orderDetails.customer.email,
        order_number: orderDetails.orderNumber,
        customer_name: orderDetails.customer.name,
        order_total: `€${orderDetails.total}`,
        shipping_address: orderDetails.customer.address,
        order_status: 'Order Confirmed',
        tracking_info: 'You will receive tracking information once your order ships.'
    });
}

// Order tracking system
function updateOrderStatus(orderNumber, newStatus) {
    const orders = JSON.parse(localStorage.getItem('stayshop-orders') || '[]');
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (order) {
        order.status = newStatus;
        order.statusUpdateTime = new Date().toISOString();
        localStorage.setItem('stayshop-orders', JSON.stringify(orders));
    }
}

// Display order history
function displayOrderHistory(email) {
    const orders = getOrderHistory(email);
    const historyHTML = orders.map(order => `
        <div class="order-item">
            <h3>Order #${order.orderNumber}</h3>
            <p>Order Date: ${new Date(order.date).toLocaleString()}</p>
            <p>Status: ${order.status}</p>
            <p>Total: €${order.total}</p>
            <div class="order-products">
                ${order.items.map(item => `
                    <div class="order-product">
                        <img src="${item.image}" alt="${item.name}">
                        <span>${item.name}</span>
                        <span>€${item.price}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    document.getElementById('order-history').innerHTML = historyHTML;
}

// Payment error handling
function initPayPalButton() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    paypal.Buttons({
        createOrder: function(data, actions) {
            const orderData = {
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: total.toString()
                    }
                }]
            };
            console.log('Order Data:', orderData); // 用于调试
            return actions.order.create(orderData);
        },
        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('An error occurred during payment processing. Please try again later.');
        }
    }).render('#paypal-button-container');
}

// Submit order function
function submitOrder() {
    const form = document.getElementById('shipping-form');
    const formData = new FormData(form);
    
    const orderNumber = generateOrderNumber();
    const order = {
        orderNumber: orderNumber,
        date: new Date().toISOString(),
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        status: ORDER_STATUS.CONFIRMED,
        customer: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            note: formData.get('note')
        }
    };
    
    orders.push(order);
    localStorage.setItem('stayshop-orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    saveCart();
    updateCart();
    toggleCart();
    
    // Show order confirmation
    showOrderConfirmation(orderNumber);
}

// Show order confirmation
function showOrderConfirmation(orderNumber) {
    alert(`Order placed successfully!\nOrder Number: ${orderNumber}\nPlease save this number for tracking your order.`);
}

function renderPage() {
    const content = document.getElementById('content');
    const homeSection = document.getElementById('home');
    
    if (location.hash.startsWith('#collection-')) {
        homeSection.style.display = 'none';
        content.style.display = 'block';
        const collectionName = location.hash.replace('#collection-', '');
        showCollection(collectionName);
    } else if (location.hash === '#products') {
        homeSection.style.display = 'none';
        content.style.display = 'block';
        content.innerHTML = renderProducts();
    } else {
        homeSection.style.display = 'grid';
        content.style.display = 'none';
    }
}

function renderProducts() {
    try {
        if (location.hash.includes('collection')) {
            return '';
        }
        
        return `
            <div class="products-section">
                <h2 class="section-title">Collections</h2>
                
                <div class="filter-section">
                    <div class="filter-group">
                        <label>Price Range:</label>
                        <select id="price-filter" onchange="applyFilters()">
                            <option value="all">All</option>
                            <option value="120-125">€120-€125</option>
                            <option value="126-130">€126-€130</option>
                            <option value="131-135">€131-€135</option>
                        </select>
                    </div>
                </div>
                
                <div class="collections-grid">
                    <div class="collection-card" onclick="showCollection('three-eyed-panda')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/7YMmxjn/20241126223149.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>Three-eyed panda</h3>
                            <p>€124</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('knife-edge')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/jwDHzXw/20241126223132.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>Knife edge</h3>
                            <p>€122</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('judge')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/zbkHsJZ/20241128001518.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>JUDGE</h3>
                            <p>€126</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('crush')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/DD5XP5v/20241127000603.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>CRUSH</h3>
                            <p>€120</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('d-line-pointer')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/s5NDSgb/20241127000831.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>D-line(pointer style)</h3>
                            <p>€132</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('d-line-digital')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/kcC8Fnp/20241127000845.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>D-line(digital display)</h3>
                            <p>€132</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('bomb-first')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/0hfw11d/20241126230420.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>BOMB MECHANICAL WATCH(first gen)</h3>
                            <p>€122</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('bomb-second')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/86MK6pF/20241128072052.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>BOMB MECHANICAL WATCH(second gen)</h3>
                            <p>€123</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('fossils-circle')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/WWsRWpz/20241127000540.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>FOSSILS SHOW THE PASSAGE OF TIME(CIRCLE)</h3>
                            <p>€122</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('fossils-square')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/5kWbmcQ/20241127000451.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>FOSSILS SHOW THE PASSAGE OF TIME(SQUARE)</h3>
                            <p>€122</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('vintage')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/wz4f6xT/20241127000534.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>VINTAGE COLOR-CHANGING DIAL</h3>
                            <p>€122</p>
                        </div>
                    </div>

                    <div class="collection-card" onclick="showCollection('alien')">
                        <div class="collection-image">
                            <img src="https://i.ibb.co/xgXhFjt/20241127000635.jpg">
                        </div>
                        <div class="collection-info">
                            <h3>ALIEN</h3>
                            <p>€124</p>
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

const collections = {
    'three-eyed-panda': {
        title: "Three-eyed panda",
        products: [
            {
                name: "WHITE",
                price: 124,
                images: [
                    'https://i.ibb.co/R28pmdW/20241126223155.jpg',
                    'https://i.ibb.co/V334t48/20241127000338.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            },
            {
                name: "BLUE",
                price: 124,
                images: [
                    'https://i.ibb.co/HgKG7Gr/20241126223221.jpg',
                    'https://i.ibb.co/V334t48/20241127000338.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            },
            {
                name: "BLACK",
                price: 124,
                images: [
                    'https://i.ibb.co/cLGMHD3/20241126223237.jpg',
                    'https://i.ibb.co/V334t48/20241127000338.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            }
        ]
    },
    'knife-edge': {
        title: "Knife edge",
        products: [
            {
                name: "BLUE",
                price: 122,
                images: [
                    'https://i.ibb.co/jTLNmRr/20241126223026.jpg',
                    'https://i.ibb.co/jwDHzXw/20241126223132.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            },
            {
                name: "WHITE",
                price: 122,
                images: [
                    'https://i.ibb.co/kc6Ty1w/20241126223105.jpg',
                    'https://i.ibb.co/jwDHzXw/20241126223132.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            },
            {
                name: "BLACK",
                price: 122,
                images: [
                    'https://i.ibb.co/Y8qs0zW/20241126223134.jpg',
                    'https://i.ibb.co/jwDHzXw/20241126223132.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            }
        ]
    },
    'judge': {
        title: "JUDGE",
        products: [
            {
                name: "SILVER AND BLACK",
                price: 125,
                images: [
                    'https://i.ibb.co/HY8zVd3/20241128001514.jpg',
                    'https://i.ibb.co/zbkHsJZ/20241128001518.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            },
            {
                name: "BLACK",
                price: 125,
                images: [
                    'https://i.ibb.co/qCVZcHw/20241128001515.jpg',
                    'https://i.ibb.co/zbkHsJZ/20241128001518.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            },
            {
                name: "BLUE",
                price: 125,
                images: [
                    'https://i.ibb.co/6JnswMc/20241128001516.jpg',
                    'https://i.ibb.co/zbkHsJZ/20241128001518.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            },
            {
                name: "COPPER GOLD",
                price: 125,
                images: [
                    'https://i.ibb.co/cLjkvcC/20241128001517.jpg',
                    'https://i.ibb.co/zbkHsJZ/20241128001518.jpg',
                    'https://i.ibb.co/VvxBzzg/20241126223159.jpg',
                    'https://i.ibb.co/Hn4xpZ5/20241126223203.jpg'
                ]
            }
        ]
    },
    'crush': {
        title: "CRUSH",
        products: [
            {
                name: "BLACK",
                price: 120,
                images: [
                    'https://i.ibb.co/CsMTgXy/20241127000607.jpg',
                    'https://i.ibb.co/t3QG6bN/20241127000618.jpg',
                    'https://i.ibb.co/mRhdJy8/20241126223351.jpg'
                ]
            },
            {
                name: "WHITE",
                price: 120,
                images: [
                    'https://i.ibb.co/X5k8JzF/20241127000610.jpg',
                    'https://i.ibb.co/1z7TnsP/20241127000720.jpg',
                    'https://i.ibb.co/5FdntB0/20241127000745.jpg'
                ]
            },
            {
                name: "BLUE",
                price: 120,
                images: [
                    'https://i.ibb.co/NKYW8tJ/20241128001024.jpg',
                    'https://i.ibb.co/SBqhSYp/20241128001522.jpg'
                ]
            }
        ]
    },
    'd-line-pointer': {
        title: "D-line(pointer style)",
        products: [
            {
                name: "BLACK",
                price: 132,
                images: [
                    'https://i.ibb.co/LvTtsy0/20241127000838.jpg',
                    'https://i.ibb.co/0cgK6wj/20241127000819.jpg'
                ]
            },
            {
                name: "SILVER",
                price: 132,
                images: [
                    'https://i.ibb.co/7SQx6kh/20241127000811.jpg',
                    'https://i.ibb.co/QnVkJDr/20241127000801.jpg'
                ]
            }
        ]
    },
    'd-line-digital': {
        title: "D-line(digital display)",
        products: [
            {
                name: "BLACK",
                price: 132,
                images: [
                    'https://i.ibb.co/kcC8Fnp/20241127000845.jpg',
                    'https://i.ibb.co/sqc75VG/20241127000835.jpg'
                ]
            }
        ]
    },
    'bomb-first': {
        title: "BOMB MECHANICAL WATCH(first gen)",
        products: [
            {
                name: "BLACK",
                price: 122,
                images: [
                    'https://i.ibb.co/GRS0jyF/20241126230457.jpg',
                    'https://i.ibb.co/wKWQZHy/20241127000247.jpg'
                ]
            },
            {
                name: "BLUE",
                price: 122,
                images: [
                    'https://i.ibb.co/729zsY3/20241127000236.jpg',
                    'https://i.ibb.co/yn8GzTf/20241126223016.jpg'
                ]
            },
            {
                name: "GREEN",
                price: 122,
                images: [
                    'https://i.ibb.co/g9nRYj3/20241126230550.jpg',
                    'https://i.ibb.co/jJQQJq8/20241127000238.jpg'
                ]
            }
        ]
    },
    'bomb-second': {
        title: "BOMB MECHANICAL WATCH(second gen)",
        products: [
            {
                name: "RED",
                price: 123,
                images: [
                    'https://i.ibb.co/DR8xnPg/20241126223052.jpg'
                ]
            },
            {
                name: "GREEN",
                price: 123,
                images: [
                    'https://i.ibb.co/VxYcm9W/20241126223104.jpg'
                ]
            },
            {
                name: "BLUE",
                price: 123,
                images: [
                    'https://i.ibb.co/sVbKdXY/20241126223126.jpg'
                ]
            },
            {
                name: "YEWLLOW",
                price: 123,
                images: [
                    'https://i.ibb.co/dDXSQpy/20241126223128.jpg'
                ]
            },
            {
                name: "WHITE",
                price: 123,
                images: [
                    'https://i.ibb.co/JF0NZMq/20241126223138.jpg'
                ]
            }
        ]
    },
    'fossils-circle': {
        title: "FOSSILS SHOW THE PASSAGE OF TIME(CIRCLE)",
        products: [
            {
                name: "BLUE",
                price: 122,
                images: [
                    'https://i.ibb.co/HFpsSyK/20241127000429.jpg'
                ]
            },
            {
                name: "RED",
                price: 122,
                images: [
                    'https://i.ibb.co/R45pMRF/20241127000424.jpg'
                ]
            },
            {
                name: "WHITE",
                price: 122,
                images: [
                    'https://i.ibb.co/18pt6gr/20241127000556.jpg'
                ]
            },
            {
                name: "BLACK",
                price: 122,
                images: [
                    'https://i.ibb.co/ynR27Wf/20241127000600.jpg'
                ]
            }
        ]
    },
    'fossils-square': {
        title: "FOSSILS SHOW THE PASSAGE OF TIME(SQUARE)",
        products: [
            {
                name: "RED",
                price: 122,
                images: [
                    'https://i.ibb.co/C7h4hJR/20241126223209.jpg',
                    'https://i.ibb.co/5kWbmcQ/20241127000451.jpg'
                ]
            },
            {
                name: "BLUE",
                price: 122,
                images: [
                    'https://i.ibb.co/8xCZfJ5/20241127000515.jpg',
                    'https://i.ibb.co/5kWbmcQ/20241127000451.jpg'
                ]
            },
            {
                name: "WHITE",
                price: 122,
                images: [
                    'https://i.ibb.co/JRzXjxf/20241127000508.jpg',
                    'https://i.ibb.co/5kWbmcQ/20241127000451.jpg'
                ]
            },
            {
                name: "BLACK",
                price: 122,
                images: [
                    'https://i.ibb.co/vcgv7ZY/20241128001523.jpg',
                    'https://i.ibb.co/5kWbmcQ/20241127000451.jpg'
                ]
            }
        ]
    },
    'vintage': {
        title: "VINTAGE COLOR-CHANGING DIAL",
        products: [
            {
                name: "BLUE",
                price: 122,
                images: [
                    'https://i.ibb.co/rQrvk7T/20241127000621.jpg',
                    'https://i.ibb.co/kShjNF5/20241127000512.jpg',
                    'https://i.ibb.co/3dJQYr1/20241127000526.jpg'
                ]
            },
            {
                name: "RED",
                price: 122,
                images: [
                    'https://i.ibb.co/th4DZSL/20241127000619.jpg',
                    'https://i.ibb.co/3dJQYr1/20241127000526.jpg'
                ]
            }
        ]
    },
    'alien': {
        title: "ALIEN",
        products: [
            {
                name: "BLACK AND GOLD",
                price: 124,
                images: [
                    'https://i.ibb.co/5YXs5W2/20241127000701.jpg',
                    'https://i.ibb.co/8D8Q6HY/20241127000655.jpg',
                    'https://i.ibb.co/CmL3hfW/20241127000639.jpg',
                    'https://i.ibb.co/61cBNb5/20241127000648.jpg'
                ]
            },
            {
                name: "BLUE AND BLACK",
                price: 124,
                images: [
                    'https://i.ibb.co/RDtn60M/20241127000725.jpg',
                    'https://i.ibb.co/dfRvntW/20241127000741.jpg',
                    'https://i.ibb.co/CmL3hfW/20241127000639.jpg',
                    'https://i.ibb.co/61cBNb5/20241127000648.jpg'
                ]
            },
            {
                name: "WHITE AND BLACK",
                price: 124,
                images: [
                    'https://i.ibb.co/fGRnk9S/20241127000733.jpg',
                    'https://i.ibb.co/CmL3hfW/20241127000639.jpg',
                    'https://i.ibb.co/61cBNb5/20241127000648.jpg'
                ]
            }
        ]
    }
}; 

function showCollection(collectionName) {
    try {
        location.hash = `collection-${collectionName}`;
        const collection = collections[collectionName];
        
        document.getElementById('content').innerHTML = `
            <div class="products-section">
                <div class="collection-header">
                    <button onclick="location.hash='#products'" class="back-button">← Back to Collections</button>
                    <h2 class="section-title">${collection.title}</h2>
                </div>
                
                <div class="product-grid">
                    ${collection.products.map(product => `
                        <div class="product-card">
                            <div class="product-image" onclick="showImageGallery(${JSON.stringify(product.images)})">
                                ${product.images.map((img, index) => `
                                    <img src="${img}" 
                                         class="${index === 0 ? 'active' : ''}"
                                         alt="${product.name}">
                                `).join('')}
                            </div>
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p class="price">€${product.price}</p>
                                <button onclick="addToCart('${product.name}', ${product.price}, '${product.images[0]}')" class="buy-button">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error showing collection:', error);
    }
}

function applyFilters() {
    const priceFilter = document.getElementById('price-filter').value;
    
    const cards = document.querySelectorAll('.collection-card');
    
    cards.forEach(card => {
        const price = parseInt(card.querySelector('.collection-info p').textContent.replace('€', ''));
        
        let showCard = true;
        
        if (priceFilter !== 'all') {
            const [min, max] = priceFilter.split('-').map(Number);
            if (price < min || price > max) {
                showCard = false;
            }
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
}

function showImageGallery(images) {
    currentImages = images;
    currentImageIndex = 0;
    updateModalImage();
    document.getElementById('image-modal').style.display = 'flex';
}

function updateModalImage() {
    document.getElementById('modal-image').src = currentImages[currentImageIndex];
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateModalImage();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateModalImage();
}

function closeImageModal() {
    document.getElementById('image-modal').style.display = 'none';
}

let orders = [];

function generateOrderNumber() {
    return 'ORDER' + Date.now().toString().slice(-8);
}

function loadOrders() {
    const savedOrders = localStorage.getItem('stayshop-orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

window.addEventListener('load', () => {
    document.querySelector('.loader').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.loader').style.display = 'none';
    }, 500);
    loadCart();
    startImageSlider();
    loadOrders();
});

window.addEventListener('hashchange', renderPage);
window.addEventListener('load', renderPage);