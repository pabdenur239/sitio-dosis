/* ===========================================================
   DOSIS — Ecommerce estático · lógica (JavaScript vanilla)
   Sin frameworks, sin módulos, sin dependencias externas.
   Funciona abriendo index.html con doble clic (file://).
   =========================================================== */

(function () {
  'use strict';

  /* ---------- WhatsApp ---------- */
  var WA_NUMERO = '5493886576721';
  function wa(texto) {
    return 'https://wa.me/' + WA_NUMERO + (texto ? '?text=' + encodeURIComponent(texto) : '');
  }
  function precio(n) {
    return '$' + Math.round(n).toLocaleString('es-AR');
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- Datos de productos ---------- */
  var PRODUCTOS = [
    { id: 1, nombre: 'Jean Mom Tiro Alto', cat: 'Mujer', tags: ['Jeans', 'Mujer'], precio: 45900, anterior: 57900, talles: ['36', '38', '40', '42', '44', '46'], badge: '', foto: '', ph: 'JEAN MUJER', desc: 'Denim rígido de tiro alto, calce mom. Algodón premium con elastano para mayor comodidad.' },
    { id: 2, nombre: 'Jean Recto Clásico', cat: 'Hombre', tags: ['Jeans', 'Hombre'], precio: 47900, anterior: 0, talles: ['38', '40', '42', '44', '46', '48'], badge: '', foto: '', ph: 'JEAN HOMBRE', desc: 'Jean recto clásico de hombre, ideal para todos los días. Resistente y versátil.' },
    { id: 3, nombre: 'Jean Talle Especial', cat: 'Talles especiales', tags: ['Jeans', 'Talles especiales'], precio: 52900, anterior: 64900, talles: ['48', '50', '52', '54', '56', '58', '60', '62'], badge: 'Hasta talle 62', foto: '', ph: 'JEAN T. ESPECIAL', desc: 'Jean de talle especial hasta el 62. Calce cómodo y moderno para que vistas como querés.' },
    { id: 10, nombre: 'Buzo Mood Camel', cat: 'Buzos', tags: ['Buzos', 'Hombre'], precio: 96000, anterior: 0, talles: ['S', 'L', 'XL'], badge: '', foto: 'imagenes/buzo-mood-camel.jpg', ph: 'BUZO MOOD CAMEL', desc: 'Buzo de frisa color camel con estampa "Mood State". Abrigado, moderno y versátil para todos los días.' },
    { id: 11, codigo: '22609', nombre: 'Buzo Mood Gris', cat: 'Buzos', tags: ['Buzos', 'Hombre'], precio: 96000, anterior: 0, talles: ['S', 'M', 'L', 'XL', '2XL'], badge: '', foto: 'imagenes/buzo-mood-gris.jpg', ph: 'BUZO MOOD GRIS', desc: 'Buzo de frisa color gris con estampa "Mood State". Abrigado, moderno y versátil para todos los días.' },
    { id: 12, codigo: '23607', nombre: 'Buzo Rules Negro', cat: 'Buzos', tags: ['Buzos', 'Hombre'], precio: 96000, anterior: 0, talles: ['S', 'M', 'L', 'XL', '2XL'], badge: '', foto: 'imagenes/buzo-rules-negro.jpg', ph: 'BUZO RULES NEGRO', desc: 'Buzo de frisa negro línea Rules. Calce cómodo, ideal para el día a día.' },
    { id: 13, codigo: '23607', nombre: 'Buzo Rules Azul', cat: 'Buzos', tags: ['Buzos', 'Hombre'], precio: 96000, anterior: 0, talles: ['S', 'M', 'L', 'XL', '2XL'], badge: '', foto: 'imagenes/buzo-rules-azul.jpg', ph: 'BUZO RULES AZUL', desc: 'Buzo de frisa azul línea Rules. Calce cómodo, ideal para el día a día.' },
    { id: 14, codigo: '1119900', nombre: 'Buzo Forteam Bordado Negro', cat: 'Buzos', tags: ['Buzos', 'Hombre'], precio: 110000, anterior: 0, talles: ['S'], badge: '', foto: 'imagenes/buzo-forteam-negro.jpg', ph: 'BUZO FORTEAM', desc: 'Buzo Forteam negro con logo bordado. Frisa premium y terminaciones de calidad.' },
    { id: 15, codigo: '1110012', nombre: 'Buzo St George Azul Marino', cat: 'Buzos', tags: ['Buzos', 'Talles especiales'], precio: 130000, anterior: 0, talles: ['S', 'L', '4XL'], badge: 'Hasta 4XL', foto: 'imagenes/buzo-st-george.jpg', ph: 'BUZO ST GEORGE', desc: 'Buzo St George azul marino, disponible hasta talle 4XL. Abrigo y estilo en talles especiales.' },
    { id: 6, nombre: 'Zapatilla Urbana', cat: 'Calzado', tags: ['Calzado'], precio: 72900, anterior: 0, talles: ['37', '38', '39', '40', '41', '42', '43', '44'], badge: '', foto: '', ph: 'ZAPATILLA', desc: 'Zapatilla urbana con suela amortiguada. Combina con todo, día y noche.' },
    { id: 7, nombre: 'Remera Algodón Premium', cat: 'Hombre', tags: ['Hombre'], precio: 18900, anterior: 0, talles: ['S', 'M', 'L', 'XL', '2XL'], badge: '', foto: '', ph: 'REMERA', desc: 'Remera de algodón peinado premium. Suave, fresca y de gran durabilidad.' },
    { id: 8, nombre: 'Conjunto Deportivo Niños', cat: 'Niños', tags: ['Niños'], precio: 24900, anterior: 31900, talles: ['6', '8', '10', '12', '14'], badge: '', foto: '', ph: 'NIÑOS', desc: 'Conjunto deportivo para niños. Cómodo para jugar y resistente a los lavados.' },
    { id: 9, nombre: 'Campera Puffer Mujer', cat: 'Mujer', tags: ['Mujer'], precio: 64900, anterior: 0, talles: ['S', 'M', 'L', 'XL'], badge: '', foto: '', ph: 'CAMPERA', desc: 'Campera puffer liviana y abrigada, con relleno térmico y capucha desmontable.' }
  ];

  var CATEGORIAS = ['Todos', 'Hombre', 'Mujer', 'Niños', 'Calzado', 'Jeans', 'Buzos', 'Talles especiales'];

  /* ---------- Estado ---------- */
  var carrito = [];
  var catActual = 'Todos';
  var prodActual = null;
  var talleSel = null;

  function getProducto(id) {
    for (var i = 0; i < PRODUCTOS.length; i++) { if (PRODUCTOS[i].id === id) return PRODUCTOS[i]; }
    return null;
  }
  function filtrar(cat) {
    if (cat === 'Todos') return PRODUCTOS.slice();
    return PRODUCTOS.filter(function (p) { return p.cat === cat || (p.tags || []).indexOf(cat) !== -1; });
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
        '<button class="card-imgbtn" onclick="DOSIS.verProducto(' + p.id + ')">' + img + badge + '</button>' +
        '<div class="card-body">' +
          '<button class="card-name" onclick="DOSIS.verProducto(' + p.id + ')">' + esc(p.nombre) + '</button>' +
          '<span class="card-talles">Talles ' + esc(p.talles.join(' · ')) + '</span>' +
          '<div class="card-price"><span class="price">' + precio(p.precio) + '</span>' + old + '</div>' +
          '<div class="card-actions">' +
            '<a class="btn-wa-sm" href="' + wa('Hola Dosis! Quiero consultar por: ' + p.nombre) + '" target="_blank" rel="noopener noreferrer">' + SVG_WA_WHITE + 'Consultar</a>' +
            '<button class="btn-add" onclick="DOSIS.agregar(' + p.id + ')" aria-label="Agregar al carrito">+</button>' +
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
        '<button class="card-imgbtn" onclick="DOSIS.verProducto(' + p.id + ')">' + img + badge + '</button>' +
        '<div class="card-body">' +
          '<button class="card-name" onclick="DOSIS.verProducto(' + p.id + ')">' + esc(p.nombre) + '</button>' +
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
    document.getElementById('grid-buzos').innerHTML = buzos.map(tarjetaOscura).join('');
    document.getElementById('grid-featured').innerHTML = PRODUCTOS.slice(0, 6).map(tarjetaClara).join('');
  }

  function renderCategoria() {
    var lista = filtrar(catActual);
    document.getElementById('cat-title').textContent = (catActual === 'Todos' ? 'Toda la tienda' : catActual);
    document.getElementById('cat-count').textContent = lista.length + ' productos';
    document.getElementById('grid-category').innerHTML = lista.map(tarjetaClara).join('');
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

    document.getElementById('product-body').innerHTML = '' +
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
    document.getElementById('cart-count').textContent = n;
  }

  function renderCarrito() {
    var cont = document.getElementById('cart-body');
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

  document.addEventListener('DOMContentLoaded', function () {
    initCategorias();
    initEnlacesWA();
    renderGrillas();
    actualizarBadge();
    mostrar('home');
  });
})();
