const socket = io()

socket.on('updateProducts', (products) => {
    const productsList = document.getElementById('products-list')
    productsList.innerHTML = ""
    products.forEach(product => {
        const li = document.createElement('li')
        li.id = `product-${product._id}`
        li.innerHTML = `${product.title} - $${product.price}
        <button class="delete" data-id="${product._id}">Eliminar</button>`
        productsList.appendChild(li)
    })
})

document.getElementById('products-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {
        const productId = event.target.getAttribute('data-id')
        socket.emit('deleteProduct', productId)
    }
})

document.getElementById('product-form').addEventListener('submit', (event) => {
    event.preventDefault()
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const code = document.getElementById('code').value;
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value, 10);
    const status = document.getElementById('status').value === 'true';
    const category = document.getElementById('category').value;
    const thumbnails = document.getElementById('thumbnails').value.split(',').map(url => url.trim());

    socket.emit('createProduct', { title, description, code, price, status, stock, category, thumbnails })
})