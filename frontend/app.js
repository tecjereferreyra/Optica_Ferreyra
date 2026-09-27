const API_URL = "http://localhost:5500/api";

const formPedido = document.querySelector("#formPedido");
const inputCliente = document.querySelector("#cliente");
const inputTelefono = document.querySelector("#telefono");
const selectArmazon = document.querySelector("#armazon");
const selectCristal = document.querySelector("#cristal");
const inputPrecio = document.querySelector("#precio");
const mensajeForm = document.querySelector("#mensajeForm");
const mensajeLista = document.querySelector("#mensajeLista");
const cuerpoPedidos = document.querySelector("#cuerpoPedidos");

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
});

const CLASE_ESTADO = {
    "Encargado": "estado-encargado",
    "Listo": "estado-listo",
    "Entregado": "estado-entregado"
};

const ACCION_SIGUIENTE = {
    "Encargado": "Marcar listo",
    "Listo": "Entregar"
};

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensaje ${tipo}`;
    setTimeout(() => {
        elemento.textContent = "";
        elemento.className = "mensaje";
    }, 6000);
}

// ------------------------------------------------------------
// Combo de armazones (GET /api/armazones)
// ------------------------------------------------------------
async function cargarArmazones() {
    try {
        const respuesta = await fetch(`${API_URL}/armazones`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener armazones");
        }

        const armazones = await respuesta.json();

        selectArmazon.innerHTML = '<option value="">Seleccione un armazón</option>';
        armazones.forEach(a => {
            const sinStock = a.Stock === 0;
            selectArmazon.innerHTML += `
                <option value="${a.IdArmazon}" ${sinStock ? "disabled" : ""}>
                    ${a.Marca} ${a.Modelo} — ${formatoPrecio.format(a.Precio)}
                    ${sinStock ? " (SIN STOCK)" : ` (stock: ${a.Stock})`}
                </option>
            `;
        });
    } catch (error) {
        selectArmazon.innerHTML = '<option value="">No se pudieron cargar</option>';
        mostrarMensaje(mensajeForm, "No se pudo conectar con la API.", "error");
        console.error(error);
    }
}

// ------------------------------------------------------------
// Listado de pedidos (GET /api/pedidos)
// ------------------------------------------------------------
async function cargarPedidos() {
    try {
        const respuesta = await fetch(`${API_URL}/pedidos`);
        if (!respuesta.ok) {
            throw new Error("Error al obtener pedidos");
        }

        mostrarPedidos(await respuesta.json());
    } catch (error) {
        cuerpoPedidos.innerHTML =
            '<tr><td colspan="7">No se pudo conectar con la API.</td></tr>';
        console.error(error);
    }
}

function mostrarPedidos(pedidos) {
    if (pedidos.length === 0) {
        cuerpoPedidos.innerHTML =
            '<tr><td colspan="7">No hay pedidos cargados.</td></tr>';
        return;
    }

    cuerpoPedidos.innerHTML = pedidos.map(p => `
        <tr>
            <td>${p.IdPedido}</td>
            <td>${p.Cliente}<br><span class="detalle-vehiculo">${p.Telefono}</span></td>
            <td>${p.Marca} ${p.Modelo}</td>
            <td>${p.TipoCristal}</td>
            <td>${formatoPrecio.format(p.PrecioTotal)}</td>
            <td><span class="estado ${CLASE_ESTADO[p.Estado] || ""}">${p.Estado}</span></td>
            <td>${
                ACCION_SIGUIENTE[p.Estado]
                    ? `<button class="btn btn-iniciar" data-id="${p.IdPedido}">
                        ${ACCION_SIGUIENTE[p.Estado]}</button>`
                    : "—"
            }</td>
        </tr>
    `).join("");
}

// ------------------------------------------------------------
// Alta de pedido (POST /api/pedidos)
// ------------------------------------------------------------
formPedido.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    try {
        const respuesta = await fetch(`${API_URL}/pedidos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cliente: inputCliente.value,
                telefono: inputTelefono.value,
                idArmazon: selectArmazon.value,
                tipoCristal: selectCristal.value,
                precioTotal: inputPrecio.value
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(mensajeForm, datos.mensaje, "error");
            return;
        }

        mostrarMensaje(mensajeForm, datos.mensaje, "ok");
        formPedido.reset();
        cargarArmazones();  // el stock del armazón elegido bajó
        cargarPedidos();
    } catch (error) {
        mostrarMensaje(mensajeForm, "No se pudo conectar con la API.", "error");
        console.error(error);
    }
});

// ------------------------------------------------------------
// Avanzar estado (PUT /api/pedidos/:id/avanzar) con delegación
// ------------------------------------------------------------
cuerpoPedidos.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("button[data-id]");
    if (!boton) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_URL}/pedidos/${boton.dataset.id}/avanzar`,
            { method: "PUT" }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(mensajeLista, datos.mensaje, "error");
            return;
        }

        mostrarMensaje(mensajeLista, datos.mensaje, "ok");
        cargarPedidos();
    } catch (error) {
        mostrarMensaje(mensajeLista, "No se pudo conectar con la API.", "error");
        console.error(error);
    }
});

// ------------------------------------------------------------
// Inicio
// ------------------------------------------------------------
cargarArmazones();
cargarPedidos();