// Inicialización del carrito y total
let carrito = [];
let total = 0;

/* FUNCIONES */
// Asincronía y fetch
async function cargarProductos() {
    try {
        const response = await fetch("./js/productos.json");
        const productos = await response.json();
        const cards = document.querySelectorAll(".card");
        productos.forEach((producto, index) => {
            if (cards[index]) {
                const card = cards[index];
                const img = card.querySelector(".card-img-top");
                const title = card.querySelector(".card-title");
                const price = card.querySelector(".card-price");

                // Actualiza los contenidos con los datos del producto
                img.src = producto.imagen;
                img.alt = producto.nombre;
                title.textContent = producto.nombre;
                price.textContent = `$${producto.precio.toLocaleString()}`;
            }
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

window.addEventListener("DOMContentLoaded", cargarProductos);

// Cargar el carrito desde localStorage
function cargarCarritoAsync() {
    return new Promise((resolve, reject) => {
        const carritoGuardado = localStorage.getItem("carrito");
        carritoGuardado
            ? resolve(JSON.parse(carritoGuardado))
            : reject("No hay carrito guardado.");
    });
}

// Función para cargar el carrito
async function cargarCarrito() {
    try {
        carrito = await cargarCarritoAsync();
        total = carrito.reduce(
            (suma, item) => suma + item.precio * item.cantidad,
            0
        );
        actualizarCarrito();
    } catch (error) {
        console.error(error);
        carrito = [];
        total = 0;
        actualizarCarrito();
    }
}

// Función para actualizar el carrito en la interfaz
function actualizarCarrito() {
    const carritoList = document.getElementById("carrito-list");
    if (!carritoList) return;

    carritoList.innerHTML = "";

    carrito.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.nombre} - $${item.precio} x${item.cantidad}
            <button class="remove-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
        `;
        carritoList.appendChild(li);
    });

    // Actualizar precio total
    document.getElementById("total-price").innerText = `Subtotal: $${total}`;

    // Actualizar el contador del carrito
    actualizarContadorDelCarrito();

    // Guardar el carrito en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para actualizar el contador del carrito
function actualizarContadorDelCarrito() {
    const cantidadTotal = carrito.reduce(
        (suma, item) => suma + item.cantidad,
        0
    );

    // Actualizar el contador en el botón flotante
    const contadorCarritoFlotante = document.getElementById(
        "floating-cart-count"
    );
    if (contadorCarritoFlotante) {
        contadorCarritoFlotante.innerText = cantidadTotal;
    }

    // Actualizar el contador en el botón del navbar
    const contadorCarritoNavbar = document.getElementById("navbar-cart-count");
    if (contadorCarritoNavbar) {
        contadorCarritoNavbar.innerText = cantidadTotal;
    }
}

// Función para agregar un producto al carrito
function agregarAlCarrito(nombre, precio, imagen) {
    const productoExistente = carrito.find(
        (producto) => producto.nombre === nombre
    );

    productoExistente
        ? productoExistente.cantidad++
        : carrito.push({ nombre, precio, cantidad: 1, imagen });

    total += precio;
    actualizarCarrito();
}

// Función genérica para mostrar u ocultar modales
function toggleModal(modalId, action) {
    const modalInstance = bootstrap.Modal.getInstance(
        document.getElementById(modalId)
    );
    action === "show" ? modalInstance.show() : modalInstance.hide();
}

/* Eventos */
// Evento para agregar producto al carrito
document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function () {
        const card = this.closest(".card");
        const nombre = card.querySelector(".card-title").innerText;
        const precioTexto = card.querySelector(".card-price").innerText;
        const precio = parseFloat(
            precioTexto.replace("$", "").replace(".", "").replace(",", ".")
        );
        const imagen = card.querySelector(".card-img-top").src;

        agregarAlCarrito(nombre, precio, imagen);
    });
});

// Evento para el botón "Comprar"
document.getElementById("buy-cart").addEventListener("click", function () {
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "El carrito está vacío",
            text: "Agrega productos al carrito antes de proceder con la compra.",
            confirmButtonText: "Ok",
            confirmButtonColor: "#3085d6",
        });
        return;
    }

    const detallesList = document.getElementById("compra-detalles-list");
    detallesList.innerHTML = ""; // Limpiar lista de detalles de compra

    // Llenar la lista con los productos del carrito agregando imagen
    carrito.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="imagen-producto">
        <span>${item.nombre} - $${item.precio} x${item.cantidad} = $${
            item.precio * item.cantidad
        }</span>
    `;
        detallesList.appendChild(li);
    });

    // Mostrar el total en el modal
    document.getElementById(
        "compra-total"
    ).innerText = `Total a pagar: $${total}`;

    // Mostrar el modal de compra
    const compraModal = new bootstrap.Modal(
        document.getElementById("compraModal")
    );
    compraModal.show();
});

// Evento para el botón "Pagar"
document.getElementById("pagar-btn").addEventListener("click", function () {
    // Mostrar el modal para capturar los datos de envío
    const datosEnvioModal = new bootstrap.Modal(
        document.getElementById("datosEnvioModal")
    );
    datosEnvioModal.show();
});

// Evento para confirmar los datos de envío
document
    .getElementById("confirmarEnvio")
    .addEventListener("click", function () {
        // Capturar los valores de los campos
        const nombreEnvio = document.getElementById("nombreEnvio").value;
        const telefonoEnvio = document.getElementById("telefonoEnvio").value;
        const direccionEnvio = document.getElementById("direccionEnvio").value;

        // Validar que los campos no estén vacíos
        if (!nombreEnvio || !telefonoEnvio || !direccionEnvio) {
            Swal.fire({
                icon: "warning",
                title: "Campos incompletos",
                text: "Por favor, completa todos los campos de envío.",
                confirmButtonText: "Ok",
            });
            return;
        }

        // Cerrar el modal de datos de envío
        const datosEnvioModal = bootstrap.Modal.getInstance(
            document.getElementById("datosEnvioModal")
        );
        datosEnvioModal.hide();

        // Cerrar el modal de compra
        const compraModal = bootstrap.Modal.getInstance(
            document.getElementById("compraModal")
        );
        compraModal.hide();

        // Cerrar el carrito de compras (sidebar)
        document.getElementById("carrito-sidebar").classList.remove("show");

        // Vaciar el carrito y actualizar la interfaz
        carrito = [];
        total = 0;
        actualizarCarrito();

        // Mostrar notificación de compra realizada
        setTimeout(() => {
            Toastify({
                text: "¡Gracias por su compra!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background:
                        "linear-gradient(to right, #d4687a, #bd93b7, #3d898b)",
                },
                stopOnFocus: true,
            }).showToast();
        }, 300);
    });

// Evento para eliminar producto del carrito
document
    .getElementById("carrito-list")
    .addEventListener("click", function (event) {
        const button = event.target.closest(".remove-btn");
        if (button) {
            const index = button.getAttribute("data-index");
            const producto = carrito[index];

            total -= producto.precio * producto.cantidad;
            carrito.splice(index, 1);
            actualizarCarrito();
        }
    });

// Evento para mostrar el carrito
document
    .querySelectorAll(".carrito-btn, #floating-cart-btn")
    .forEach((button) => {
        button.addEventListener("click", function () {
            document.getElementById("carrito-sidebar").classList.toggle("show");
        });
    });

// Evento para cerrar el carrito
document.getElementById("close-cart").addEventListener("click", function () {
    document.getElementById("carrito-sidebar").classList.remove("show");
});

// Evento para el formulario
document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Capturar los valores de los campos
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const mensaje = document.getElementById("mensaje").value;

    // Validar campos
    if (nombre === "" || email === "" || mensaje === "") {
        return;
    }

    // Limpiar los campos del formulario después del envío
    document.getElementById("nombre").value = "";
    document.getElementById("email").value = "";
    document.getElementById("mensaje").value = "";

    // Mostrar el mensaje de éxito
    const mensajeEnviado = document.getElementById("mensaje-enviado");
    mensajeEnviado.classList.remove("oculto");

    // Ocultar el mensaje después de unos segundos
    setTimeout(() => {
        mensajeEnviado.classList.add("oculto");
    }, 5000);
});

// Cargar el carrito al iniciar
cargarCarrito();
