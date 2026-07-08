/* ===========================================================
   DOSIS — Ecommerce estático · lógica (JavaScript vanilla)
   Catálogo dinámico: los productos se leen desde
   data/productos.json (Contrato de Datos v1.0).
   Sin frameworks, sin backend, sin dependencias externas.
   NOTA: fetch() requiere servir el sitio por HTTP
   (GitHub Pages / hosting). Abrir con doble clic (file://)
   bloquea la carga del JSON por CORS del navegador.
   =========================================================== */

(function () {
  'use strict';

  /* ---------- Configuración ---------- */
  var WA_NUMERO = '5493886576721';
  var DATA_URL = 'data/productos.json';

  function wa(texto) {
    return 'https://wa.me/' + WA_NUMERO + (texto ? '?text=' + encodeURIComponent(texto) : '');
  }
  function precio(n) {
    return '$' + Math.round(n).toLocaleString('es-AR');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- Catálogo (se llena desde productos.json) ---------- */
  var PRODUCTOS = [];
  var CATEGORIAS = ['Todos', 'Hombre', 'Mujer', 'Niños', 'Calzado', 'Jeans', 'Buzos', 'Talles especiales'];

  /* Mapea un producto del Contrato de Datos v1.0 a la estructura
     interna que usa el render. No modifica el JSON de origen. */
  function mapearProducto(p) {
    var tags = [];
    if (p.categoria) tags.push(p.categoria);
    if (p.genero) tags.push(p.genero);
    if (p.subcategoria) tags.push(p.subcategoria);

    var badge = '';
    if (p.descuento) badge = '-' + p.descuento + '%';
    else if (p.nuevo) badge = 'Nuevo';

    return {
      id: String(p.id),
      codigo: p.codigo || '',
      nombre: p.nombre || '',
      cat: p.categoria || '',
      tags: tags,
      precio: (typeof p.precio === 'number') ? p.precio : 0,
      anterior: (typeof p.precioAnterior === 'number') ? p.precioAnterior : 0,
      talles: Array.isArray(p.talles) ? p.talles : [],
      badge: badge,
      foto: p.imagenPrincipal || (Array.isArray(p.imagenes) && p.imagenes[0]) || '',
      ph: (p.nombre || 'Producto').toUpperCase(),
      desc: p.descripcion || '',
      destacado: p.destacado === true,
      stock: p.stock !== false,
      whatsapp: p.whatsapp !== false
    };
  }

  /* ---------- Estado ---------- */
  var carrito = [];
  var catActual = 'Todos';
  var prodActual = null;
  var talleSel = null;

  function getProducto(id) {
    for (var i = 0; i < PRODUCTOS.length; i++) { if (PRODUCTOS[i].id === String(id)) return PRODUCTOS[i]; }
    return null;
  }
  function filtrar(cat) {
    if (cat === 'Todos') return PRODUCTOS.slice();
    return PRODUCTOS.filter(function (p) { return p.cat === cat || (p.tags || []).indexOf(cat) !== -1; });
  }
  function destacados() {
    var d = PRODUCTOS.filter(function (p) { return p.destacado; });
    if (d.length === 0) d = PRODUCTOS.slice();
    return d.slice(0, 6);
  }

  /* =========================================================
     SVGs reutilizables
     ========================================================= */
  var SVG_WA_DARK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="#181410"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.7.7-2.5-.2-.3A8 8 0 0 1 12 4z"/></svg>';
  var SVG_WA_WHITE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.7.7-2.5-.2-.3A8 8 0 0 1 12 4z"/></svg>';

  /* =========================================================
     Tarjetas de producto
     ========================================================= */
  function tarjetaClara(p) {
    var img = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '">'
      : '<div class="ph"><span>' + esc(p.ph) + '</span></div>';
    var badge = p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '';
    var old = p.anterior ? '<span class="price-old">' + precio(p.anterior) + '</span>' : '';
    return '' +
      '<article class="card">' +
        '<button class="card-imgbtn" onclick="DOSIS.verProducto(\'' + esc(p.id) + '\')">' + img + badge + '</button>' +
        '<div class="card-body">' +
          '<button class="card-name" onclick="DOSIS.verProducto(\'' + esc(p.id) + '\')">' + esc(p.nombre) + '</button>' +
          '<span class="card-talles">Talles ' + esc(p.talles.join(' · ')) + '</span>' +
          '<div class="card-price"><span class="price">' + precio(p.precio) + '</span>' + old + '</div>' +
          '<div class="card-actions">' +
            '<a class="btn-wa-sm" href="' + wa('Hola Dosis! Quiero consultar por: ' + p.nombre) + '" target="_blank" rel="noopener noreferrer">' + SVG_WA_WHITE + 'Consultar</a>' +
            '<button class="btn-add" onclick="DOSIS.agregar(\'' + esc(p.id) + '\')" aria-label="Agregar al carrito">+</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function tarjetaOscura(p) {
    var img = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '">'
      : '<div class="phd"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C2962F" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10l-1 5H8z"/><path d="M8 8v13h8V8"/></svg><span>' + esc(p.ph) + '</span></div>';
    var badge = p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '';
    return '' +
      '<article class="card-dark">' +
        '<button class="card-imgbtn" onclick="DOSIS.verProducto(\'' + esc(p.id) + '\')">' + img + badge + '</button>' +
        '<div class="card-body">' +
          '<button class="card-name" onclick="DOSIS.verProducto(\'' + esc(p.id) + '\')">' + esc(p.nombre) + '</button>' +
          '<div class="card-price"><span class="price">' + precio(p.precio) + '</span></div>' +
          '<span class="card-talles">Talles ' + esc(p.talles.join(' · ')) + '</span>' +
          '<a class="btn-wa-gold" href="' + wa('Hola Dosis! Quiero consultar por: ' + p.nombre) + '" target="_blank" rel="noopener noreferrer">' + SVG_WA_DARK + 'Consultar por WhatsApp</a>' +
        '</div>' +
      '</article>';
  }

  /* =========================================================
     Render de grillas
     ========================================================= */
  function renderGrillas() {
    var buzos = filtrar('Buzos');
    var gb = document.getElementById('grid-buzos');
    var gf = document.getElementById('grid-featured');
    if (gb) gb.innerHTML = buzos.map(tarjetaOscura).join('');
    if (gf) gf.innerHTML = destacados().map(tarjetaClara).join('');
  }

  function renderCategoria() {
    var lista = filtrar(catActual);
    var t = document.getElementById('cat-title');
    var c = document.getElementById('cat-count');
    var g = document.getElementById('grid-category');
    if (t) t.textContent = (catActual === 'Todos' ? 'Toda la tienda' : catActual);
    if (c) c.textContent = lista.length + ' productos';
    if (g) {
      g.innerHTML = lista.length
        ? lista.map(tarjetaClara).join('')
        : '<p style="color:#857d6e;font-size:14px;padding:20px 2px">No hay productos en esta categoría por el momento. Consultanos por WhatsApp.</p>';
    }
  }

  /* =========================================================
     Detalle de producto
     ========================================================= */
  function renderProducto() {
    var p = prodActual;
    if (!p) return;
    if (!talleSel) talleSel = p.talles[0];

    var imgBox = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '">'
      : '<span class="ph-txt">[ ' + esc(p.ph) + ' · 1080×1350 ]</span>';
    var badge = p.badge ? '<span class="badge" style="top:14px;left:14px">' + esc(p.badge) + '</span>' : '';
    var old = p.anterior ? '<span class="price-old">' + precio(p.anterior) + '</span>' : '';

    var chips = p.talles.map(function (t) {
      var sel = (t === talleSel) ? ' sel' : '';
      return '<button class="talle' + sel + '" onclick="DOSIS.elegirTalle(\'' + esc(t) + '\')">' + esc(t) + '</button>';
    }).join('');

    var waProd = wa('Hola Dosis! Quiero consultar por: ' + p.nombre + ' (talle ' + talleSel + ')');
    var cont = document.getElementById('product-body');
    if (!cont) return;

    cont.innerHTML = '' +
      '<button class="back-btn" onclick="DOSIS.goShop()">← Volver a la tienda</button>' +
      '<div class="pd-grid">' +
        '<div class="pd-img">' + imgBox + badge + '</div>' +
        '<div class="pd-info">' +
          '<div style="display:flex;flex-direction:column;gap:8px">' +
            '<span class="pd-cat">' + esc(p.cat) + '</span>' +
            '<h1>' + esc(p.nombre) + '</h1>' +
          '</div>' +
          '<div class="pd-price"><span class="price">' + precio(p.precio) + '</span>' + old + '</div>' +
          '<p class="pd-desc">' + esc(p.desc) + '</p>' +
          '<div style="display:flex;flex-direction:column;gap:9px">' +
            '<span class="pd-talles-lbl">Elegí tu talle</span>' +
            '<div class="talle-row">' + chips + '</div>' +
          '</div>' +
          '<div class="pd-cta">' +
            '<a class="btn btn-wa" href="' + waProd + '" target="_blank" rel="noopener noreferrer">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.7.7-2.5-.2-.3A8 8 0 0 1 12 4z"/></svg>' +
              'Consultar por WhatsApp</a>' +
            '<button class="btn btn-negro" onclick="DOSIS.agregarYVerCarrito()">Agregar al carrito</button>' +
          '</div>' +
          '<div class="pd-finance">' +
            '<div class="fin-row"><span class="b">3-6</span><span class="t">3 y 6 cuotas sin interés</span></div>' +
            '<div class="fin-row"><span class="b">20%</span><span class="t">20% OFF en efectivo, transferencia o débito</span></div>' +
            '<div class="fin-row"><span class="b">DNI</span><span class="t">Crédito personal solo con DNI · Go Cuotas</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* =========================================================
     Carrito
     ========================================================= */
  function actualizarBadge() {
    var n = 0;
    for (var i = 0; i < carrito.length; i++) n += carrito[i].qty;
    var el = document.getElementById('cart-count');
    if (el) el.textContent = n;
  }

  function renderCarrito() {
    var cont = document.getElementById('cart-body');
    if (!cont) return;
    if (carrito.length === 0) {
      cont.innerHTML = '' +
        '<div class="empty">' +
          '<div class="circle"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9a9aa0" stroke-width="1.8"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/></svg></div>' +
          '<div style="display:flex;flex-direction:column;gap:5px"><strong>Tu carrito está vacío</strong><span class="sub">Agregá productos y consultá por WhatsApp.</span></div>' +
          '<button class="btn btn-dorado" onclick="DOSIS.goShop()" style="min-height:0;padding:13px 24px">Ir a la tienda</button>' +
        '</div>';
      return;
    }

    var items = carrito.map(function (c) {
      var thumb = c.foto
        ? '<img src="' + esc(c.foto) + '" alt="' + esc(c.nombre) + '">'
        : '<span>' + esc(c.ph) + '</span>';
      return '' +
        '<div class="cart-item">' +
          '<div class="cart-thumb">' + thumb + '</div>' +
          '<div class="cart-mid">' +
            '<strong>' + esc(c.nombre) + '</strong>' +
            '<span class="meta">Talle ' + esc(c.talle) + ' · ' + precio(c.precio) + '</span>' +
            '<div class="qty">' +
              '<button onclick="DOSIS.cambiarQty(\'' + c.key + '\',-1)">−</button>' +
              '<span class="n">' + c.qty + '</span>' +
              '<button onclick="DOSIS.cambiarQty(\'' + c.key + '\',1)">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-right">' +
            '<strong>' + precio(c.precio * c.qty) + '</strong>' +
            '<button class="cart-remove" onclick="DOSIS.quitar(\'' + c.key + '\')">Quitar</button>' +
          '</div>' +
        '</div>';
    }).join('');

    var subtotal = 0, lista = [];
    for (var i = 0; i < carrito.length; i++) {
      subtotal += carrito[i].precio * carrito[i].qty;
      lista.push(carrito[i].nombre + ' (T' + carrito[i].talle + ') x' + carrito[i].qty);
    }
    var waCheckout = wa('Hola Dosis! Quiero finalizar mi compra: ' + lista.join(', ') + '. Total: ' + precio(subtotal));

    cont.innerHTML = '' +
      '<div class="cart-list">' + items +
        '<div class="summary">' +
          '<div class="row"><span class="muted">Subtotal</span><strong>' + precio(subtotal) + '</strong></div>' +
          '<div class="row"><span class="gold">Pagando de contado (20% OFF)</span><strong class="gold">' + precio(subtotal * 0.8) + '</strong></div>' +
          '<hr>' +
          '<div class="small"><span>3 cuotas sin interés de</span><span class="w">' + precio(subtotal / 3) + '</span></div>' +
          '<div class="small"><span>6 cuotas sin interés de</span><span class="w">' + precio(subtotal / 6) + '</span></div>' +
          '<a class="btn btn-wa" href="' + waCheckout + '" target="_blank" rel="noopener noreferrer">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.7.7-2.5-.2-.3A8 8 0 0 1 12 4z"/></svg>' +
            'Finalizar compra por WhatsApp</a>' +
          '<span class="note">Coordinás el pago y la entrega directo con Dosis.</span>' +
        '</div>' +
      '</div>';
  }

  /* =========================================================
     Navegación entre pantallas
     ========================================================= */
  var PANTALLAS = ['home', 'category', 'product', 'cart', 'contact'];
  function mostrar(pantalla) {
    for (var i = 0; i < PANTALLAS.length; i++) {
      var el = document.getElementById('screen-' + PANTALLAS[i]);
      if (el) { if (PANTALLAS[i] === pantalla) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); }
    }
    var botones = document.querySelectorAll('#bottomnav button');
    for (var j = 0; j < botones.length; j++) {
      var s = botones[j].getAttribute('data-screen');
      var act = (s === pantalla) || (pantalla === 'product' && s === 'category');
      if (act) botones[j].classList.add('active'); else botones[j].classList.remove('active');
    }
    window.scrollTo(0, 0);
  }

  /* =========================================================
     API pública (usada por onclick en el HTML)
     ========================================================= */
  var DOSIS = {
    goHome: function () { mostrar('home'); },
    goShop: function () { catActual = 'Todos'; renderCategoria(); mostrar('category'); },
    goCat: function (cat) { catActual = cat; renderCategoria(); mostrar('category'); },
    goCart: function () { renderCarrito(); mostrar('cart'); },
    goContact: function () { mostrar('contact'); },
    verProducto: function (id) {
      prodActual = getProducto(id);
      talleSel = prodActual ? prodActual.talles[0] : null;
      renderProducto();
      mostrar('product');
    },
    elegirTalle: function (t) { talleSel = t; renderProducto(); },
    agregar: function (id, talle) {
      var p = getProducto(id);
      if (!p) return;
      var t = talle || p.talles[0];
      var key = p.id + '-' + t;
      var ex = null;
      for (var i = 0; i < carrito.length; i++) { if (carrito[i].key === key) { ex = carrito[i]; break; } }
      if (ex) ex.qty++;
      else carrito.push({ key: key, id: p.id, nombre: p.nombre, precio: p.precio, talle: t, foto: p.foto, ph: p.ph, qty: 1 });
      actualizarBadge();
    },
    agregarYVerCarrito: function () {
      if (prodActual) { DOSIS.agregar(prodActual.id, talleSel); DOSIS.goCart(); }
    },
    cambiarQty: function (key, d) {
      for (var i = 0; i < carrito.length; i++) {
        if (carrito[i].key === key) { carrito[i].qty = Math.max(1, carrito[i].qty + d); break; }
      }
      actualizarBadge(); renderCarrito();
    },
    quitar: function (key) {
      carrito = carrito.filter(function (c) { return c.key !== key; });
      actualizarBadge(); renderCarrito();
    }
  };

  /* atajos globales usados directamente en onclick del HTML estático */
  window.goHome = DOSIS.goHome;
  window.goShop = DOSIS.goShop;
  window.goCat = DOSIS.goCat;
  window.goCart = DOSIS.goCart;
  window.goContact = DOSIS.goContact;
  window.DOSIS = DOSIS;

  /* =========================================================
     Inicialización
     ========================================================= */
  function initCategorias() {
    var bar = document.getElementById('catbar');
    if (!bar) return;
    bar.innerHTML = CATEGORIAS.map(function (c) {
      var label = (c === 'Todos') ? 'Todos' : c;
      return '<button class="chip" onclick="DOSIS.goCat(\'' + esc(c) + '\')">' + esc(label) + '</button>';
    }).join('');
  }

  function initEnlacesWA() {
    var general = wa('Hola Dosis! Tengo una consulta.');
    var local = wa('Hola Dosis! Quiero consultar sobre el local de Tucumán 314 y las formas de pago.');
    var esp = wa('Hola Dosis! Quiero consultar disponibilidad de talles especiales (jeans hasta 62 / prendas hasta 5XL).');
    function set(id, url) { var el = document.getElementById(id); if (el) el.setAttribute('href', url); }
    set('hero-wa', general);
    set('fab-wa', general);
    set('social-wa', general);
    set('contact-wa', general);
    set('local-wa', local);
    set('esp-wa', esp);
  }

  /* Carga el catálogo desde el Contrato de Datos v1.0 */
  function cargarCatalogo() {
    return fetch(DATA_URL, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var lista = Array.isArray(data) ? data : (data && data.productos) || [];
        PRODUCTOS = lista.map(mapearProducto);
        renderGrillas();
        renderCategoria();
      })
      .catch(function (err) {
        // Falla si se abre con file:// (CORS) o si falta el JSON.
        PRODUCTOS = [];
        renderGrillas();
        var gb = document.getElementById('grid-buzos');
        if (gb) {
          gb.innerHTML = '<p style="color:#c9c1b3;font-size:14px;grid-column:1/-1">' +
            'No se pudo cargar el catálogo (data/productos.json). ' +
            'Publicá el sitio en un servidor / GitHub Pages: fetch() no funciona abriendo el archivo con doble clic.</p>';
        }
        if (window.console && console.warn) console.warn('DOSIS · catálogo no cargado:', err.message);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCategorias();
    initEnlacesWA();
    actualizarBadge();
    mostrar('home');
    cargarCatalogo();
  });
})();
