const socket = io()

socket.on('updateProducts', (products) => {
    const productsList = document.getElementById('products-list')
    productsList.innerHTML = ""
    products.forEach(product => {
        const li = document.createElement('li')
        li.id = `product-${product.id}`
        li.innerHTML = `${product.title} - $${product.price}
        <button class="delete" data-id="${product.id}">Eliminar</button>`
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
    const title = document.getElementById('title').value
    const price = document.getElementById('price').value
    socket.emit('createProduct', { title, price })
})