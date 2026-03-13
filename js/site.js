var VariableEliminar = [];
function filter(query, id) {
    //if (query !== "") {
    //    if (query.length < 3) {

    //        return;
    //    }
    //}
    
    // Convierte la consulta a mayúsculas y elimina espacios extra.
    var text = query.toUpperCase().trim();
    

    // Selecciona el contenedor (en este ejemplo se supone que es el div con id "busqueda")
    var contenedor = document.getElementById(id);

    // Selecciona todos los elementos con la clase "item" dentro del contenedor.
    var items = contenedor.querySelectorAll('.item');

    if (text !== "") {
        items.forEach(function (item) {
            textoRelevante = item.innerText;

            // Se hace la comparación en mayúsculas.
            if (textoRelevante.toUpperCase().includes(text)) {
                item.hidden = false;
            } else {
                item.hidden = true;
            }
        });
    } else {
        // Si no se ingresa texto, muestra todos los items.
        items.forEach(function (item) {
            item.hidden = false;
        });
    }
}


function mostrarNav() {
    const nav = document.getElementById("mostrarNav");
    const main = document.getElementById("main");

    // Alternamos las clases para mostrar/ocultar la navegación
    nav.classList.toggle("active");
    main.classList.toggle("main");

    if (nav.classList.contains("active")) {
        // Se muestra la nav: agregamos el listener para detectar clics fuera.
        // Usamos setTimeout para evitar que el clic que activó la nav la cierre inmediatamente.
        setTimeout(() => {
            document.addEventListener("click", cerrarNavFuera);
        }, 0);
    } else {
        // Si la nav se oculta, removemos el listener por si acaso.
        document.removeEventListener("click", cerrarNavFuera);
    }
}

function cerrarNavFuera(e) {
    const nav = document.getElementById("mostrarNav");
    // Si el clic NO fue dentro de la nav...
    if (!nav.contains(e.target)) {
        // Llamamos a mostrarNav para cerrar la navegación
        mostrarNav();
        // Y removemos este listener para no tener listeners acumulados
        document.removeEventListener("click", cerrarNavFuera);
    }
}

function cerrarModal(aux) {
    document.getElementById(aux).classList.add("hidden-div");
}

document.querySelectorAll('.modal').forEach(function (modal) {
    let clicEmpezoDentro = false;
    let clicTerminoDentro = false;

    modal.addEventListener('mousedown', function (event) {
        clicEmpezoDentro = event.target.closest('.modal-conte') !== null;
    });

    modal.addEventListener('mouseup', function (event) {
        clicTerminoDentro = event.target.closest('.modal-conte') !== null;
    });

    modal.addEventListener('click', function (event) {
        // Solo cerrar si el clic comenzó y terminó fuera de modal-conte
        if (!clicEmpezoDentro && !clicTerminoDentro) {
            modal.classList.add('hidden-div');
        }
    });
});


var fn = {
    validaEntero: function (value) {
        var RegExPattern = /[0-9]+$/;
        return RegExPattern.test(value);
    },
    formateaNumero: function (value) {
        if (fn.validaEntero(value)) {
            var retorno = '';
            value = value.toString().split('').reverse().join('');
            var i = value.length;
            while (i > 0) retorno += ((i % 3 === 0 && i != value.length) ? '.' : '') + value.substring(i--, i);
            return retorno;
        }
        return 0;
    },
    recortaTexto: function (texto) {
        if (!texto) return '';

        texto = texto.toString();

        if (texto.length > 45) {
            return texto.substring(0, 43) + '...';
        }

        return texto;
    }
}



function ajax(url, opciones) {
    //parametros pasados
    opciones = opciones || {};
    if (typeof url === "object" && url !== null) {
        opciones = url; //url como param o como propiedad
        url = opciones.url;
    }
    url = url || "";
    opciones.method = opciones.method || opciones.type || "GET";
    opciones.method = opciones.method.toUpperCase();

    function crearObjetoXMLHttp() {
        //Crear el objeto para el HTTP request
        if (typeof XMLHttpRequest !== "undefined")
            return new XMLHttpRequest();
        else { //para IE6-
            const XMLHttpVersions = [
                "MSXML2.XmlHttp.6.0",
                "MSXML2.XmlHttp.5.0",
                "MSXML2.XmlHttp.4.0",
                "MSXML2.XmlHttp.3.0",
                "MSXML2.XmlHttp.2.0",
                "Microsoft.XmlHttp"
            ];
            const XMLHttpVersionsLength = XMLHttpVersions.length;
            for (var i = 0; i < XMLHttpVersionsLength; i++) {
                try {
                    return new ActiveXObject(XMLHttpVersions[i]);
                } catch (e) {
                    console.log("Entro a catch");
                }
            }

            throw new ReferenceError("No se puede crear una instancia para el objeto XMLHttpRequest");
        }
    }
    var http_request;
    if (typeof opciones.xhr === 'function')
        http_request = opciones.xhr()
    else
        http_request = crearObjetoXMLHttp();

    //asignamos una función que se llamara (asincronicamente) 
    //  cuando cambie el estado de la petición
    function respuestaAJAX() {
        if (http_request.readyState == (XMLHttpRequest.DONE || 4)) { // 4 significa que terminó
            var status;
            if (http_request.status >= 200 && http_request.status < 300 || http_request.status == 304) { //2xx Success
                //aca leemos la respuesta (lel recurso devuelto)
                // y se llama al callback definido por el usuario
                status = "success";
                statusAJAX(http_request, status);
                if (typeof opciones.success === "function") {
                    var response;
                    try {
                        if (opciones.dataType == "json") { //si se espera un json
                            response = JSON.parse(http_request.response);
                            response.__proto__.toString = function () { return JSON.stringify(this) };
                        } else if (opciones.dataType == "xml") { //si se espera un xml
                            response = http_request.responseXML;
                            response.__proto__.toString = function () { return this.innerHTML };
                        } else { //si se espera texto
                            response = http_request.response;
                        }
                        // Callback a success
                        opciones.success(response);
                        completoAJAX(http_request, status);
                    } catch (err) { //error al interpretar json o xml
                        console.error(err);
                        if (typeof opciones.error === "function") {
                            status = "parseerror";
                            errorAJAX(http_request, status);
                        }
                    }
                }
            } else if (http_request.responseURL !== "") {  //Otra respuesta (ej: 500 Internal Server Error)
                status = "error";
                statusAJAX(http_request, status);
                //lanzar error
                errorAJAX(http_request, status);
            }
        }
    }
    addEvent(http_request, "readystatechange", respuestaAJAX);


    function errorAJAX(http_request, status) {
        //llamamos al callback the "error" si se especifico
        status = status || "error";
        if (typeof opciones.error !== "undefined") {
            var statusText = (http_request.statusText || "").replace(/^\d+ /, "");
            if (typeof opciones.error === "function")
                opciones.error = [opciones.error];
            var errorLength = opciones.error.length;
            for (var i = 0; i < errorLength; i++) {
                opciones.error[i](http_request, status, statusText);
            }
        }
        completoAJAX(http_request, status);
    }

    function statusAJAX(http_request, status) {
        //si se definio por ej, statusCode: { 500: function(){ /* */ } }
        if (typeof opciones.statusCode === "object" && typeof opciones.statusCode[http_request.status] === "function")
            opciones.statusCode[http_request.status](http_request, status, (http_request.statusText.replace(/^\d+ /, "") || ""));
    }

    function completoAJAX(http_request, status) {
        //llamamos al callback the "complete" si se especifico
        if (typeof opciones.complete !== "undefined") {
            if (typeof opciones.complete === "function")
                opciones.complete = [opciones.complete];
            var completeLength = opciones.complete.length;
            for (var i = 0; i < completeLength; i++) {
                opciones.complete[i](http_request, status);
            }
        }
    }

    //handlers para los errores
    const ajaxErrorEvents = ["abort", "error", "timeout"];
    const ajaxErrorEventsLength = ajaxErrorEvents.length;
    for (var i = 0; i < ajaxErrorEventsLength; i++) {
        const ajaxErrorEvent = ajaxErrorEvents[i];
        addEvent(http_request, ajaxErrorEvent, function () {
            errorAJAX(http_request, ajaxErrorEvent);
        });
    }

    function addEvent(elemento, evento, callback, arg) {
        if (elemento.addEventListener) { //addEventListener
            elemento.addEventListener(evento, callback, (arg || false));
        } else if (elemento.attachEvent) { //attachEvent para IE
            elemento.attachEvent("on" + evento, callback);
        } else {
            elemento["on" + evento] = callback;
        }
    }

    //timeout
    if (typeof opciones.timeout !== "undefined")
        http_request.timeout = opciones.timeout;

    //preparamos los datos a enviar
    var data = null;
    if (typeof opciones.data !== "undefined" && (opciones.data !== null || opciones.cache === false)) {
        if (opciones.processData === false) {
            data = opciones.data;
        } else if (typeof opciones.data === "string") {
            data = encodeURI(opciones.data.replace(/^\?/, ""));
        } else if (typeof opciones.data === "object") {
            var dataArr = [];
            for (var key in opciones.data) {
                if (Object.prototype.hasOwnProperty.call(opciones.data, key)) {
                    dataArr[dataArr.length] = encodeURIComponent(key) + "="
                        + encodeURIComponent(typeof opciones.data[key] === "string"
                            ? opciones.data[key]
                            : JSON.stringify(opciones.data[key]));
                }
            }
            data = dataArr.join("&");
        }
        //Si es GET, data va en el query del uri
        if (opciones.method == "GET") {
            if (opciones.cache === false) //no usar cache
                data += (data ? "?" : "") + "_=" + (Date.now ? Date.now() : new Date().getTime());
            url += "?" + data;
            data = null;
        }
    }

    //hacemos el request
    http_request.open(opciones.method, url, true, opciones.username, opciones.password);
    //forms
    if (opciones.method == "POST" || opciones.method == "PUT")
        http_request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //completamos encabezados
    for (var encabezado in opciones.headers) {
        if (Object.prototype.hasOwnProperty.call(opciones.headers, encabezado))
            http_request.setRequestHeader(encabezado.replace(/(?:^([a-z])|([a-z]))([a-z0-9_]*)([A-Z]+)/g,
                function (m, p1, p2, p3, p4) { return (p1 ? p1.toUpperCase() : p2) + p3 + "-" + p4 }),
                opciones.headers[encabezado]);
    }
    //dataType y contentType
    if (opciones.dataType == "xml") {
        http_request.setRequestHeader("Accept", "text/xml; charset=UTF-8");
    } else if (opciones.dataType == "json") {
        http_request.setRequestHeader("Accept", "application/json; charset=UTF-8");
    }
    if (typeof opciones.contentType !== "undefined") { //Content-Type x usuario
        http_request.overrideMimeType(opciones.contentType);
        http_request.setRequestHeader("Content-Type", opciones.contentType);
    }
    //beforeSend
    if (typeof opciones.beforeSend === "function") {
        if (opciones.beforeSend(http_request, opciones) === false) {
            http_request.abort();
            return false;
        }
    }
    //send
    http_request.send(data);
    return true;
}


function mensajeResultado(tipo, texto) {
    // 1= OK,
    // 2= NO,
    let color = (tipo == 1) ? "bg-verde" : "bg-rojo";
    let icon = (tipo == 1) ? "fi-rr-check-circle" : "fi-rr-check-circle";
    let html = `
            <div class="col-12 ${color} banner">
                <p class="row align-items-center text-marginNo">
                    <span class="col-auto icon">
                        <i class="fi ${icon}"></i>
                    </span>
                    <span class="col">
                        <b>${texto}.</b>
                    </span>
                </p>
            </div>
        `
    document.getElementById("mensajeResultadoDiv").innerHTML = html;
}

function HTMLCriticidad(criticidad) {
    switch (criticidad) {
        
        case 3:
            return "<span class='badge bg-rojo'>Critico</span>";
        case 4:
            return "<span class='badge bg-rojo'>Muy Critico</span>";
    }
    return "";
}
function HTMLCriticidadTodos(criticidad) {
    
    switch (criticidad) {
        case 0:
            return `<div class="circulo bg-grisT" title="Indefinido"></div>`;
        case 1:
            return `<div class="circulo bg-verde" title ="Baja"></div>`;
        case 2:
            return `<div class="circulo bg-amarillo" title="Media"></div>`;
        case 3:
            return `<div class="circulo bg-naranjo" title ="Alta"></div>`;
        case 4:
            return `<div class="circulo bg-rojo" title="Muy alta"></div>`;
    }
    return "";
}
function HTMLEstado(Completo)
{
    switch (Completo) {
        case 7:
            return "<span class='badge bg-grisT c-09'>No Aplica</span>";
        case 6:
            return "<span class='badge bg-rojo c-09'>Vencido</span>";
        case 5:
            return "<span class='badge bg-rojo c-09'>Revisión</span>";
        case 4:
            return "<span class='badge bg-rojo c-09'>No Cumple</span>";
        case 3:
            return "<span class='badge bg-verde c-09'>Cumple</span>";
        case 2:
            return "<span class='badge bg-naranjo c-09'>En Proceso</span>";
        case 1:
            return "<span class='badge bg-grisO c-09'>Pendiente</span>";
    }
    return "";
}
function HTMLTipoAlertaRecurrente(aux) {
    switch (aux) {
        case 0:
            return "<span>Solo una vez</span>";
        case 1:
            return "<span>Semanal</span>";
        case 2:
            return "<span>Quincenal</span>";
        case 3:
            return "<span>Mensual</span>";
        case 4:
            return "<span>Trimestral</span>";
        case 5:
            return "<span>Semestral</span>";
        case 6:
            return "<span>Anual</span>";
    }
    return "";
}
function HTMLTipoCategoria(Completo) {
    switch (Completo) {
        case 4:
            return "<span>Seguridad</span>";
        case 3:
            return "<span>RCA's</span>";
        case 2:
            return "<span>Permisos</span>";
        case 1:
            return "<span>Normas</span>";
    }
    return "Indefinido";
}
function HTMLTipo(Completo) {
    switch (Completo) {
        case 4:
            return "<span>Actualización Heredada</span>";
        case 3:
            return "<span>Eliminación</span>";
        case 2:
            return "<span>Revisión</span>";
        case 1:
            return "<span>Actualización</span>";
    }
    return "";
}
function HTMLCortar(texto, largo)
{
    if (texto != null) {
        if (texto.length > largo && texto.length>10) {
            texto = texto.slice(0, largo - 3) + "..."; 
         }
    }
    return texto;
}
function HTMLRevision(revision)
{
    if (!revision) {
        return "<span title='Pendiente' class='c-rojo'><i class='icon fi fi-rr-comment-exclamation'></i></span>";
    }
    return "<span title='Verificado' class='c-verde'><i class='icon fi fi-rr-comment-check'></i></span>";

}

function toggleUsuario() {
    let navUsuario = document.getElementById('navUsuario');
    navUsuario.classList.toggle('hidden-div');

    if (!navUsuario.classList.contains('hidden-div')) {
        // Si el div se mostró, agregamos el listener para detectar clic fuera
        setTimeout(() => { // setTimeout evita que el clic que abre el div lo cierre inmediatamente
            document.addEventListener('click', clickOutsideNavUsuario);
        }, 0);
    } else {
        // Si se ocultó, eliminamos el listener
        document.removeEventListener('click', clickOutsideNavUsuario);
    }
}

function clickOutsideNavUsuario(e) {
    let navUsuario = document.getElementById('navUsuario');
    // Si el clic se realizó fuera de navUsuario
    if (!navUsuario.contains(e.target)) {
        navUsuario.classList.add('hidden-div'); // Se oculta el div
        document.removeEventListener('click', clickOutsideNavUsuario);
    }
}


function toggleText(link) {
    // Obtener el contenedor de texto y el enlace "Ver más"
    let textElement = link.previousElementSibling;
    let showMoreLink = link;

    // Alternar entre mostrar/ocultar el texto
    if (textElement.classList.contains('expanded')) {
        textElement.classList.remove('expanded');
        showMoreLink.textContent = 'Ver más';
    } else {
        textElement.classList.add('expanded');
        showMoreLink.textContent = 'Ver menos';
    }
}

function verMas() {
    // Obtener todos los contenedores de texto
    const textContainers = document.querySelectorAll('.text-container2');

    textContainers.forEach(function (container) {
        // Obtener el botón dentro de este contenedor
        const button = container.querySelector('.toggle-text-btn');

        if (button) {
            // Obtener la altura del contenedor
            const height = container.offsetHeight;

            // Mostrar el botón solo si la altura es mayor a 50px
            if (height > 55) {
                container.classList.add('collapsed');
                button.style.display = 'inline-block';
            } else {
                button.style.display = 'none';
            }
        }
    });
}

function toggleText2(button) {
    const container = button.closest('.text-container2');

    if (container.classList.contains('collapsed')) {
        // Expandir
        container.classList.remove('collapsed');
        button.textContent = 'Ver menos';
    } else {
        // Contraer
        container.classList.add('collapsed');
        button.textContent = 'Ver más';
    }
}

function toggleTabla(boton) {
    let contenedor = boton.closest('.tabla');
    let tabla = contenedor.querySelector('.tabla-contenido');

    tabla.classList.toggle('hidden-div');

    boton.textContent = tabla.classList.contains('hidden-div') ? 'Ver tabla' : 'Ocultar tabla';
}

function domHTML(data, Tipo) {
    const listaElem = document.getElementById('lista');
    listaElem.innerHTML = "";

    let html = `<div class="col-12">`;
    data.forEach(item => {
        let derogado = (item.derogado) ? "<span class='badge bg-rojo'><i class='fi fi-rr-diamond-exclamation'></i> Derogado</span>" : ""
        html += `<div class="row item">
                        <div class="col-12 col-lg-10 bg-gris item-header">
                                <p class="text-heightNo text-marginNo">
                                    <small>${item.tipo} Nº${item.numero} / ${item.publicacion}</small> <small> ${derogado}</small><br />
                                    <b><a href="javascript:void(0)" onclick="detalleTodo(${item.idNorma},${Tipo})">${item.nombre}</a></b>
                                </p>
                        </div>
                    <div class="col-12 ">`;
        item.obligacions.forEach(obligacion => {



            let topico = ` <b>${obligacion.topico1}</b><br />`
            if (obligacion.topico2 != "") {
                topico += `<span class="row no-gutters">
                                    <span class="col-auto">
                                        <i class="fip fi fi-rr-arrow-turn-down-right"></i>
                                    </span>
                                    <span class="col">
                                        ${obligacion.topico2}<br />`
                if (obligacion.topico3 != "") {
                    topico += ` <span class="row no-gutters">
                                            <span class="col-auto">
                                                <i class="fip fi fi-rr-arrow-turn-down-right"></i>
                                            </span>
                                            <span class="col">
                                                ${obligacion.topico3}
                                            </span>
                                        </span>`
                }
                topico += `     </span>
                                </span>`
            }


            let obligacionHTML = `<div class="text-container">
                                        <p class="text-marginNo" data-id="${obligacion.idNormaObligacion}">${obligacion.nombre}</p>`
            if (obligacion.nombre.length > 700) {
                obligacionHTML = obligacionHTML + `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>`
            }
            obligacionHTML = obligacionHTML + ` </div>`

            let aspectoImpacto = '';
            let colAux1 = 'col-3';
            let colAux2 = 'col';
            if (item.normaPermiso != 2) {
                aspectoImpacto = `
                    <div class="col col-small">
                        <small>${obligacion.aspecto}</small>
                    </div>
                    <div class="col col-small">
                        <small>${obligacion.impacto}</small>
                    </div>`;
                colAux1 = 'col-12 col-lg-5';
                colAux2 = 'col-5';
            }



            html += `<div class="row item-obligacion align-items-center">
                            <div class="col-12 col-lg col-small">
                                <div class="row">
                                    <div class="col-auto">
                                        <span class="icon-xl close" onclick="togglePaddingMore(this)">
                                            <i class="fi fi-rr-add"></i>
                                        </span>
                                    </div>
                                    <div class="col pad-l">
                                        <p class="text-heightNo text-marginNo">
                                            <small>
                                                <strong>${obligacion.articulo}</strong>
                                            </small> <br />
                                            ${obligacionHTML}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="${colAux1} col-small">
                                <div class="row row-small">
                                    <div class="${colAux2} col-small">
                                        <p class="text-marginNo row row-small">
                                            <small class="col-12 col-small">
                                                ${topico}
                                            </small>
                                        </p>
                                    </div>
                                    ${aspectoImpacto}
                                </div>
                            </div>
                            <div class="col-12 padding-more hidden">
                                <div class="col-12 bg-gris item-divplanta">
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="row align-items-center justify-content-between borde-bottom">
                                                <div class="col col-small">
                                                    <p><b>Planta</b></p>
                                                </div>
                                                <div class="col col-small">
                                                    <p><b>Actividad</b></p>
                                                </div>
                                                <div class="col col-small text-center">
                                                    <p><b>Estado de <br>Cumplimiento</b></p>
                                                </div>
                                                <div class="col col-small text-center  hiddenchico-xs">
                                                    <p><b>Estado de <br>Verificación</b></p>
                                                </div>
                                                <div class="col col-small  hiddenchico-xs">
                                                    <p><b>Vencimiento</b></p>
                                                </div>
                                                <div class="col col-small  hiddenchico-xs">
                                                    <p><b>Comentario</b></p>
                                                </div>
                                                <div class="col col-small text-center  hiddenchico-xs">
                                                    <p><b>Criticidad</b></p>
                                                </div>
                                                <div class="col-auto col-small  hiddenchico-xs">
                                                    <p><b>&nbsp;Ver Detalle&nbsp;&nbsp;</b></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
            obligacion.planta.forEach(planta => {
                html += `<div class="row">
                                <div class="col-12">
                                    <div id="plantaObliga-${planta.idNormaPlanta}" class="row align-items-center justify-content-between borde-bottom">
                                        <div class="col col-small">
                                            <p class="text-marginNo">
                                                ${planta.filial} <br>
                                                <span class="row no-gutters">
                                                    <span class="col-auto"><i class="fip fi fi-rr-arrow-turn-down-right"></i></span>
                                                    <span class="col"> ${planta.planta}</span>
                                                </span>
                                            </p>
                                        </div>
                                        <div class="col col-small">
                                            <p class="text-marginNo row">
                                                <small class="col-12">
                                                    <b>${planta.actividad1}</b><br>
                                                    <span class="row no-gutters">
                                                        <span class="col-auto">
                                                            <i class="fip fi fi-rr-arrow-turn-down-right"></i>
                                                        </span>
                                                        <span class="col">
                                                                ${planta.actividad2}
                                                        </span>
                                                    </span>
                                                </small>
                                            </p>
                                        </div>
                                        <div class="col col-small text-center">
                                            <buttom onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})">
                                                ${HTMLEstado(planta.estado)}
                                            </buttom>
                                        </div>
                                        <div class="col col-small text-center hiddenchico-xs">
                                            ${HTMLRevision(planta.revision)}
                                        </div>
                                        <div class="col col-small hiddenchico-xs">
                                            <p class="text-marginNo">${planta.vencimiento}</p>
                                        </div>
                                        <div class="col col-small hiddenchico-xs">
                                            <div class="text-container">
                                                <p class="text-marginNo">
                                                    ${planta.comentario}
                                                </p>
                                                ${(planta.comentario.length > 200) ? `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>` : ``}
                                            </div>
                                        </div>

                                        <div class="col col-small text-center hiddenchico-xs">
                                            ${HTMLCriticidadTodos(planta.criticidad)}
                                        </div>
                                        <div class="col-auto col-small hiddenchico-xs">
                                            <buttom onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})" class="btn btn-xs btn-primary">
                                                Completar
                                            </buttom>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
            });
            html += `</div>
                    </div>
                </div>`;
        });

        html += `</div>
                </div>`;
    });

    html += `</div>`;
    listaElem.insertAdjacentHTML("beforeend", html);
}
function domHTMLHallazgo(data, Tipo) {
    const listaElem = document.getElementById('lista');
    listaElem.innerHTML = "";



    data.forEach(item => {
        let html = `<div class="col-12">`;
        let AvanceoBoton = '';
        let btnvermas = '';
        switch (item.estado) {
            case 1://Borrador = 1;
                AvanceoBoton = `
                    <div class="col-4">
                        <a class="btn btn-hall" href="../../Administrador/DetailsHallazgo/${item.idHallazgo}">Crear Plan de acción</a>
                    </div>
                `
                break;
            case 2://Proceso = 2;
                AvanceoBoton = `
                    <div class="col pad-l">
                        <p class="text-heightNo text-marginNo">
                            Avance (${item.accionFinal} de ${item.accionTotal} acciones finalizadas)<br />
                            <div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="${item.accionFinal}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar progress-bar-verde text-bg-success" style="width: ${item.accionPorcentaje}%">${item.accionPorcentaje}%</div>
                            </div>
                        </p>
                    </div>
                `
                btnvermas = `
                    <span class="icon-xl close" onclick="togglePaddingMore(this)">
                        <i class="fi fi-rr-add"></i>
                    </span>
                `;
                break;
            case 3://Cerrado = 3;
                AvanceoBoton = `
                    <div class="col pad-l">
                        <p class="text-heightNo text-marginNo">
                            Avance (${item.accionFinal} de ${item.accionTotal} acciones finalizadas)<br />
                            <div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="${item.accionFinal}" aria-valuemin="0" aria-valuemax="100">
                                <div class="progress-bar progress-bar-verde text-bg-success" style="width: ${item.accionPorcentaje}%">${item.accionPorcentaje}%</div>
                            </div>
                        </p>
                    </div>
                `
                btnvermas = `
                    <span class="icon-xl close" onclick="togglePaddingMore(this)">
                        <i class="fi fi-rr-add"></i>
                    </span>
                `;
                break;
        }



        
        html += `
            <div class="row item">
                <div class="col-12 col-lg-10 bg-gris item-header">
                    <p class="text-heightNo text-marginNo">
                        <small><b>${item.codigo}</b> / ${item.origen} / ${item.fechaEvento}</small><br />
                        <div class="text-container2">
                            <div>
                                <a href="javascript:void(0)" onclick="detalleHallazgo(${item.idHallazgo})" >
                                    ${item.descripcion}
                                </a>
                            </div>
                            <a href="javascript:void(0)" class="btn btn-xss btn-edit toggle-text-btn" onclick="toggleText2(this)" style="display: none;">Ver más</a>
                        </div>
                    </p>
                </div>
                <div class="col-12 ">
                    <div class="row item-obligacion align-items-center">
                        <div class="col-12 col-lg col-small">
                            <div class="row">
                                <div class="col-auto">
                                    ${btnvermas}
                                </div>
                                <div class="col pad-l">
                                    <p class="text-heightNo text-marginNo">
                                        <small>
                                            <strong>${item.filial}</strong>
                                        </small> <br>
                                    </p><div class="text-container">
                                        <p class="text-marginNo" data-id="713">${item.planta}</p> </div>
                                    <p></p>
                                </div>
                                <div class="col pad-l">
                                    <p class="text-heightNo text-marginNo">
                                        <small>
                                            <strong>Responsable</strong>
                                        </small> <br>
                                    </p><div class="text-container">
                                        <p class="text-marginNo" data-id="713">${item.responsable}</p> </div>
                                    <p></p>
                                </div>
                                <div class="col pad-l">
                                    <p class="text-heightNo text-marginNo">
                                        <small>
                                            <strong>Tipo</strong>
                                        </small> <br>
                                    </p><div class="text-container">
                                        <p class="text-marginNo" data-id="713">${item.tipo}</p> </div>
                                    <p></p>
                                </div>
                                ${AvanceoBoton}
                            </div>
                        </div>`;
        html += `
                    <div class="col-12 padding-more hidden">
                        <div class="col-12 bg-gris item-divplanta">
                            <div class="row">
                                <div class="col-12">
                                    <div class="row align-items-center justify-content-between">
                                    <div class="col-auto col-small">
                                            <p><b>#</b></p>
                                        </div>
                                        <div class="col-3 col-small">
                                            <p><b>Acción</b></p>
                                        </div>
                                        <div class="col col-small">
                                            <p><b>Responsable</b></p>
                                        </div>
                                        <div class="col col-small">
                                            <p><b>Vencimiento</b></p>
                                        </div>
                                        <div class="col text-center col-small">
                                            <p><b>Estado de <br> Cumplimiento</b></p>
                                        </div>
                                        <div class="col text-center col-small">
                                            <p><b>Estado de <br>Verificación</b></p>
                                        </div>
                                        <div class="col col-small">
                                            <p><b>&nbsp;Ver Detalle&nbsp;&nbsp;</b></p>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                            if (item.estado == 2 || item.estado == 3) {
                                let contador = 0;
                                item.acciones.forEach(accion => {
                                    contador++;
                                    html += `
                                        <div class="row item-planta">
                                            <div class="col-12">
                                                <div class="row align-items-center justify-content-between">
                                                    <div class="col-auto col-small hiddenchico-xs">
                                                        <p class="text-heightNo text-marginNo">
                                                            <b>${contador}</b>
                                                        </p>
                                                    </div>
                                                    <div class="col-3 col-small hiddenchico-xs text-container2">
                                                        <div>
                                                            ${accion.descripcion}
                                                        </div>
                                                        <a href="javascript:void(0)" class="btn btn-xss btn-edit toggle-text-btn" onclick="toggleText2(this)" style="display: none;">Ver más</a>
                                                    </div>
                                                    <div class="col col-small hiddenchico-xs">
                                                        <p class="text-heightNo text-marginNo">
                                                            ${accion.responsable}
                                                        </p>
                                                    </div>
                                                    <div class="col col-small hiddenchico-xs sin-Salto">
                                                            ${accion.fechaVencimiento}
                                                    </div>
                                                    <div class="col col-small text-center hiddenchico-xs">
                                                        ${HTMLEstado(accion.estado)}
                                                    </div>
                                                    <div class="col col-small text-center hiddenchico-xs">
                                                        ${HTMLRevision(accion.revision)}
                                                    </div>
                                                    <div class="col col-small hiddenchico-xs">
                                                        <a href="#" onclick="detalleAccionHallazgo(${accion.idAccion})" class="btn btn-xs btn-primary">Completar</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`
                                });
                            }
            html += `
                    </div>
                </div>
            </div>
        </div>
    </div>`

        listaElem.insertAdjacentHTML("beforeend", html);
    })
    verMas();
}

function domHTMLTable(data,Tipo) {
    const listaElem = document.getElementById('lista');
    if (!listaElem) return;

    // Limpiar el contenedor
    listaElem.innerHTML = "";

    // Crear la estructura de la tabla con encabezados
    let html = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr class="cabezera align-items-center">
                        <th>Topico</th>
                        ${[3, 4].includes(Tipo) ? `<th>RCA o Resolución</th>` : `<th>Norma</th>`}
                        <th>Requisito</th>
                        <th>Forma de Cumplimiento</th>
                        ${[2, 3, 4].includes(Tipo) ? `<th>Etapa del proyecto</th>` : ``}
                        <th>Actividad</th>
                        ${[2, 3, 4].includes(Tipo) ? `<th>Aspecto Ambiental</th>` : ``}
                        <th class="text-center">Estado de <br>Cumplimiento</th>
                        <th class="text-center tdnone">Estado de <br>Verificación</th>
                        <th class="text-center">Evidencia</th>
                        <th>Comentario</th>
                        ${[1, 2].includes(Tipo) ? `<th class="text-center">Criticidad</th>` : ``}
                        
                    </tr>
                </thead>
                <tbody id="busqueda">
            `;

    // Iterar sobre cada objeto "norma"
    data.forEach(norma => {
        // Para cada norma, recorrer sus obligaciones
        norma.normaObligacions.forEach(obligacion => {
            // Si la obligación tiene registros de planta, crear una fila por cada uno
            if (obligacion.normaPlanta && obligacion.normaPlanta.length > 0) {
                obligacion.normaPlanta.forEach(planta => {
                    //CREACION VISTA DE TOPICOS
                    let especialRCA = `<b>${obligacion.topico1}</b><br />`
                    let topico = [1, 2].includes(Tipo) ? `<b>${obligacion.topico1}</b><br />` : ``    
                    if (obligacion.topico2 != "") {
                        topico += `
                            <span class="row no-gutters">
                                <span class="col-auto">
                                        ${[1,2].includes(Tipo) ? `<i class="fip fi fi-rr-arrow-turn-down-right"></i>` : ``}
                                </span>
                                <span class="col">
                                    ${obligacion.topico2}<br />`
                                    if (obligacion.topico3 != "") {
                                        topico += ` 
                                            <span class="row no-gutters">
                                                <span class="col-auto">
                                                    <i class="fip fi fi-rr-arrow-turn-down-right"></i>
                                                </span>
                                                <span class="col">
                                                    ${obligacion.topico3}
                                                </span>
                                            </span>`
                                    }
                        topico += `
                                </span>
                            </span>`
                    }
                    //CREACION VISTA DE ARCHIVOS
                    let archivosHtml = ``
                    planta.archivos.forEach(archivo => {
                        archivo.forEach(unico => {
                            let nombreArchivo = unico.length > 20 ? unico.slice(0, 17) + "..." : unico;
                            archivosHtml = archivosHtml + `<a target="_blank" class="badge bg-gris" href="https://requisitosmedioambiente.blob.core.windows.net/archivo/${unico}">${nombreArchivo}</a>`
                        })
                    })
                    let obligacionHTML = `
                        <div class="text-container">
                            <p onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})" class="text-marginNo" data-id="${obligacion.idNormaObligacion}">${obligacion.nombre}</p>`
                            if (obligacion.nombre.length > 600) {
                                obligacionHTML = obligacionHTML + `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>`
                            }
                        obligacionHTML = obligacionHTML + ` </div>`

                    let fcumplimientoHTML = `
                        <div class="text-container">
                            <p class="text-marginNo" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})">${obligacion.cumplimiento}</p>`
                            if (obligacion.cumplimiento.length > 160) {
                                fcumplimientoHTML = fcumplimientoHTML + `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>`
                            }
                        fcumplimientoHTML = fcumplimientoHTML + ` </div>`

                    let derogado = (norma.derogado) ? "<span class='badge bg-rojo'><i class='fi fi-rr-diamond-exclamation'></i> Derogado</span>" : ""
                    html += `
                        <tr class="item"  id="plantaObliga-${planta.idNormaPlanta}">
                            <td>${topico}</td>
                            <td class="pointer" onclick="detalleTodo(${norma.idNorma},${Tipo})"> <small> ${derogado}</small><br><b>${norma.tipo}</b><br> <span class="sin-Salto">Nº${norma.numero} / ${norma.publicacion}</span></td>
                            <td class="pointer">
                                <small onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})"><b class="text-underline">${obligacion.articulo} </b></small><br>
                                ${obligacionHTML}
                            </td>
                            <td class="pointer">
                                ${fcumplimientoHTML}
                            </td>
                            ${[2, 3, 4].includes(Tipo) ? `<td>${obligacion.etapa}</td>` : ``}
                            <td>
                                <p class="text-marginNo row">
                                    <span class="col-12">
                                            <b>${planta.actividad1}</b><br>
                                        <span class="row no-gutters">
                                            <span class="col-auto">
                                                <i class="fip fi fi-rr-arrow-turn-down-right"></i>
                                            </span>
                                            <span class="col">
                                                    ${planta.actividad2}
                                            </span>
                                        </span>
                                    </span>
                                </p>
                            </td>
                            ${[2, 3, 4].includes(Tipo) ? `<td>${obligacion.aspecto}</td>` : ``}
                            
                            <td class="pointerC text-center" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})">${HTMLEstado(planta.estado)}</td>
                            <td class="text-center tdnone">${HTMLRevision(planta.revision)}</td>
                            <td class="pointer text-center" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})">${archivosHtml}</td>
                            <td >
                                <div class="text-container">
                                    <p class="pointer" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})" data-id="undefined">
                                        ${planta.comentario}
                                    </p>
                                    ${(planta.comentario.length > 200) ? `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>` : ``}
                                </div>
                            </td>
                            ${[1, 2].includes(Tipo) ? `<td class="text-center">${HTMLCriticidadTodos(planta.criticidad)}</td>` : ``}
                            
                        </tr>
                    `;

                });
            } else {
                // En caso de que no existan plantas, se muestra una fila sin datos de planta
                html += `
                  <tr>
                    <td>${norma.tipo}<br> Nº${norma.numero} / ${norma.publicacion}</td>
                    <td>${norma.nombre}</td>
                    <td>${norma.cumplimiento}</td>
                    <td>${obligacion.aspecto}</td>
                    <td>${obligacion.impacto}</td>
                    <td colspan="5">No hay información de planta</td>
                  </tr>
                `;
            }
        });
    });

    html += `
              </tbody>
            </table>
        </div>
      `;

    // Insertar la tabla en el contenedor
    listaElem.insertAdjacentHTML("beforeend", html);
}


function domHTMLTableHallazgo(data, Tipo) {
    const listaElem = document.getElementById('lista');
    if (!listaElem) return;

    // Limpiar el contenedor
    listaElem.innerHTML = "";

    // Crear la estructura de la tabla con encabezados
    let html = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr class="cabezera align-items-center">
                        <th>Topico</th>
                        ${[3, 4].includes(Tipo) ? `<th>RCA o Resolución</th>` : `<th>Norma</th>`}
                        <th>Requisito</th>
                        <th>Forma de Cumplimiento</th>
                        ${[2, 3, 4].includes(Tipo) ? `<th>Etapa del proyecto</th>` : ``}
                        <th>Actividad</th>
                        ${[2, 3, 4].includes(Tipo) ? `<th>Aspecto Ambiental</th>` : ``}
                        <th class="text-center">Estado de <br>Cumplimiento</th>
                        <th class="text-center tdnone">Estado de <br>Verificación</th>
                        <th class="text-center">Evidencia</th>
                        <th>Comentario</th>
                        ${[1, 2].includes(Tipo) ? `<th class="text-center">Criticidad</th>` : ``}
                        
                    </tr>
                </thead>
                <tbody id="busqueda">
            `;

    // Iterar sobre cada objeto "norma"
    data.forEach(norma => {
        // Para cada norma, recorrer sus obligaciones
        norma.normaObligacions.forEach(obligacion => {
            // Si la obligación tiene registros de planta, crear una fila por cada uno
            if (obligacion.normaPlanta && obligacion.normaPlanta.length > 0) {
                obligacion.normaPlanta.forEach(planta => {
                    //CREACION VISTA DE TOPICOS
                    let especialRCA = `<b>${obligacion.topico1}</b><br />`
                    let topico = [1, 2].includes(Tipo) ? `<b>${obligacion.topico1}</b><br />` : ``
                    if (obligacion.topico2 != "") {
                        topico += `
                            <span class="row no-gutters">
                                <span class="col-auto">
                                        ${[1, 2].includes(Tipo) ? `<i class="fip fi fi-rr-arrow-turn-down-right"></i>` : ``}
                                </span>
                                <span class="col">
                                    ${obligacion.topico2}<br />`
                        if (obligacion.topico3 != "") {
                            topico += ` 
                                            <span class="row no-gutters">
                                                <span class="col-auto">
                                                    <i class="fip fi fi-rr-arrow-turn-down-right"></i>
                                                </span>
                                                <span class="col">
                                                    ${obligacion.topico3}
                                                </span>
                                            </span>`
                        }
                        topico += `
                                </span>
                            </span>`
                    }
                    //CREACION VISTA DE ARCHIVOS
                    let archivosHtml = ``
                    planta.archivos.forEach(archivo => {
                        archivo.forEach(unico => {
                            let nombreArchivo = unico.length > 20 ? unico.slice(0, 17) + "..." : unico;
                            archivosHtml = archivosHtml + `<a target="_blank" class="badge bg-gris" href="https://requisitosmedioambiente.blob.core.windows.net/archivo/${unico}">${nombreArchivo}</a>`
                        })
                    })
                    let obligacionHTML = `
                        <div class="text-container">
                            <p onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})" class="text-marginNo" data-id="${obligacion.idNormaObligacion}">${obligacion.nombre}</p>`
                    if (obligacion.nombre.length > 600) {
                        obligacionHTML = obligacionHTML + `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>`
                    }
                    obligacionHTML = obligacionHTML + ` </div>`

                    let fcumplimientoHTML = `
                        <div class="text-container">
                            <p class="text-marginNo" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})">${obligacion.cumplimiento}</p>`
                    if (obligacion.cumplimiento.length > 160) {
                        fcumplimientoHTML = fcumplimientoHTML + `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>`
                    }
                    fcumplimientoHTML = fcumplimientoHTML + ` </div>`

                    let derogado = (norma.derogado) ? "<span class='badge bg-rojo'><i class='fi fi-rr-diamond-exclamation'></i> Derogado</span>" : ""
                    html += `
                        <tr class="item"  id="plantaObliga-${planta.idNormaPlanta}">
                            <td>${topico}</td>
                            <td class="pointer" onclick="detalleTodo(${norma.idNorma},${Tipo})"> <small> ${derogado}</small><br><b>${norma.tipo}</b><br> <span class="sin-Salto">Nº${norma.numero} / ${norma.publicacion}</span></td>
                            <td class="pointer">
                                <small onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})"><b class="text-underline">${obligacion.articulo} </b></small><br>
                                ${obligacionHTML}
                            </td>
                            <td class="pointer">
                                ${fcumplimientoHTML}
                            </td>
                            ${[2, 3, 4].includes(Tipo) ? `<td>${obligacion.etapa}</td>` : ``}
                            <td>
                                <p class="text-marginNo row">
                                    <span class="col-12">
                                            <b>${planta.actividad1}</b><br>
                                        <span class="row no-gutters">
                                            <span class="col-auto">
                                                <i class="fip fi fi-rr-arrow-turn-down-right"></i>
                                            </span>
                                            <span class="col">
                                                    ${planta.actividad2}
                                            </span>
                                        </span>
                                    </span>
                                </p>
                            </td>
                            ${[2, 3, 4].includes(Tipo) ? `<td>${obligacion.aspecto}</td>` : ``}
                            
                            <td class="pointerC text-center" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})">${HTMLEstado(planta.estado)}</td>
                            <td class="text-center tdnone">${HTMLRevision(planta.revision)}</td>
                            <td class="pointer text-center" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})">${archivosHtml}</td>
                            <td >
                                <div class="text-container">
                                    <p class="pointer" onclick="detalleObligacionPlantaTodo(${planta.idNormaPlanta},${Tipo})" data-id="undefined">
                                        ${planta.comentario}
                                    </p>
                                    ${(planta.comentario.length > 200) ? `<a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleText(this)">Ver más</a>` : ``}
                                </div>
                            </td>
                            ${[1, 2].includes(Tipo) ? `<td class="text-center">${HTMLCriticidadTodos(planta.criticidad)}</td>` : ``}
                            
                        </tr>
                    `;

                });
            } else {
                // En caso de que no existan plantas, se muestra una fila sin datos de planta
                html += `
                  <tr>
                    <td>${norma.tipo}<br> Nº${norma.numero} / ${norma.publicacion}</td>
                    <td>${norma.nombre}</td>
                    <td>${norma.cumplimiento}</td>
                    <td>${obligacion.aspecto}</td>
                    <td>${obligacion.impacto}</td>
                    <td colspan="5">No hay información de planta</td>
                  </tr>
                `;
            }
        });
    });

    html += `
              </tbody>
            </table>
        </div>
      `;

    // Insertar la tabla en el contenedor
    listaElem.insertAdjacentHTML("beforeend", html);
}

function activarSinVencimientoListeners() {
    let sinVencimientos = document.querySelectorAll('[name^="SinVencimiento"]');

    sinVencimientos.forEach(function (checkbox) {
        // Evita agregar múltiples listeners si ya están
        checkbox.removeEventListener("change", sinVencimientoHandler);
        checkbox.addEventListener("change", sinVencimientoHandler);
    });
}

function sinVencimientoHandler(e) {
    const match = e.target.name.match(/\[(\d+)\]/);
    if (!match) return;

    const index = match[1];
    const fechaInput = document.querySelector(`input[name="FechaVencimiento[${index}]"]`);
    if (fechaInput) {
        fechaInput.disabled = e.target.checked;
    }
}


function detalleObligacionPlantaTodo(Id, Tipo) {
    VariableEliminar = [];
    if (Tipo == 3 || Tipo == 4) {
        detalleObligacionPlantaRca(Id,Tipo);
        return;
    }
    detalleObligacionPlantaNorma(Id, Tipo);
}
function detalleObligacionPlantaNorma(IdNormaPlanta, Tipo) {
    const inputDisabled = document.getElementById("desabilitadoMaster").value; // devuelve "disabled"
    const userRole = document.getElementById("TipodeUsuariohtmlAux").value;
    sectionModal(5);
    ajax({
        url: "../../Normas/DetailsObligacionPlanta/" + IdNormaPlanta,
        method: "GET", dataType: "json",
        success: function (data) {
            document.getElementById("F-NombreNorma").innerHTML = `<b>${data.normaTipo} Nº${data.normaArticulo}/${data.normaAnio}</b><br> ${data.norma}`;

            //document.getElementById("F-NombreNorma").innerText = data.norma;
            document.getElementById("F-NombreObligacion").innerHTML = `<b>${data.obligacionArticulo}</b><br> ${data.obligacion}`;
            document.getElementById("F-Filial").innerText = data.filial;
            document.getElementById("F-Planta").innerText = data.planta;
            document.getElementById("F-Aspecto").innerText = data.aspecto;
            document.getElementById("F-Impacto").innerText = data.impacto;
            document.getElementById("F-Actividad1").innerText = data.actividad1;
            document.getElementById("F-Actividad2").innerText = data.actividad2;
            document.getElementById("F-Topico1").innerText = data.topico1;
            document.getElementById("F-Topico2").innerText = data.topico2;
            document.getElementById("F-Topico3").innerText = data.topico3;
            document.getElementById("F-IdNormaPlanta").value = IdNormaPlanta;
            document.getElementById("F-Ley").innerHTML = `<a target="_blank" href="${data.linkLey}"><span class="badge bg-gris text-underline"><i class="fi fi-rr-link"></i> Ir a Norma</span></a>`;

            document.getElementById("fechaCalendario").value = data.vencimiento;
            document.getElementById("tituloCalendario").value = data.norma;
            document.getElementById("F-Estado").value = data.estado;
            document.getElementById("F-Criticidad").value = data.criticidad;

            try {
                document.getElementById("RevisionCheck").checked = false;
                document.getElementById("RevisionCheck").checked = data.revision;
            } catch { }
            
            //document.getElementById("F-Vencimiento").value = data.vencimiento;
            document.getElementById("F-Comentario").value = data.comentario;
            let html = "";
            document.getElementById("TotalInputs").value = data.cumplimientos.length;

            document.getElementById("F-Archivo1").innerHTML = "";
            document.getElementById("F-Archivo2").innerHTML = "";

            if (data.archivo1 != null) {
                let tabla1 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo1}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small>`
                document.getElementById("F-Archivo1").innerHTML = tabla1;
                document.getElementById("ayuda1").classList.remove("hidden-div")


                //Agregar a acontinuacion del nombre.let html = `<p>Nuevo contenido agregado al final</p>`;
                let tabla = `
                    <div class="tabla">
                        <a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleTabla(this)">Ver tabla</a>
                        <div class="tabla-contenido hidden-div">
                            <img src="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo1}" class="img-fluid">
                        </div>
                    </div>
                `
                document.getElementById("F-NombreObligacion").insertAdjacentHTML("beforeend", tabla);
            } else {
                document.getElementById("ayuda1").classList.add("hidden-div")
            }
            if (data.archivo2 != null) {
                let tabla2 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo2}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small>`
                document.getElementById("F-Archivo2").innerHTML = tabla2;
                document.getElementById("ayuda2").classList.remove("hidden-div")
            } else {
                document.getElementById("ayuda2").classList.add("hidden-div")
            }
            
            data.cumplimientos.forEach((item, index) => {
                let color = "";
                if (item.archivos.length > 0) {
                    switch (item.archivos[0].estado) {
                        case "Vencido":
                            color = "bg-rojo";
                            break;
                        case "Por vencer":
                            color = "bg-amarillo";
                            break;
                        case "Vigente":
                            color = "bg-verde";
                            break;
                    }
                }
                let archivos=""
                if (item.archivos.length > 0) {
                    item.archivos[0].documentos.forEach((item2, index2) => {
                        archivos += `
                            <span class="badge bg-gris" id="${item2}">
                                <a title="${item2}" href="${"https://requisitosmedioambiente.blob.core.windows.net/archivo/" + item2}" target="_blank">${HTMLCortar(item2,40)} </a > &nbsp;&nbsp;
                                ${inputDisabled === "" ? `<buttom class="pointerC" onclick="archivoEliminar('${item2}',${Tipo})" title="Eliminar Archivo"> <i class="fi fi-rr-circle-xmark"></i></buttom>` : ""}
                            </span>
                        `;
                    });
                }

                html += `
                    <div class="row borde bg-fondo mar-b align-items-end">
                        <div class="col-12">
                            <small class="c-gris">Forma de Cumplimiento ${index + 1} <span class="badge ${color}">${(item.archivos.length > 0) ? item.archivos[0].estado : ""}</span></small><br>
                            <b><span id="F-Cumplimiento1">${item.nombre}</span></b>
                        </div>
                        <div class="col-8">
                            <small class="c-gris">Últimos archivos: ${(item.archivos.length > 0) ? item.archivos[0].fechaIngreso : ""}</small><br>
                            <small>${archivos}</small>
                            <p class="text-marginNo">
                                <br>
                                <small class="c-gris">Subir Nueva Evidencia</small><br>
                            </p>
                            <input type="file" id="archivos" class="form-control" name="Archivos[${index}]" multiple ${inputDisabled}>
                            <input type="hidden"  name="IdNormaFormaCumplimiento[${index}]" value="${item.idNormaFormaCumplimiento}"  ${inputDisabled} >
                            <input type="hidden"  name="IdNormaPlantaArchivo[${index}]" value="${(item.archivos.length > 0) ? item.archivos[0].idNormaPlantaArchivo : ""}"  ${inputDisabled} >
                        </div>
                        <div class="col-4">
                            <div class="row form-group">
                                <div class="col-12">
                                    <input type="checkbox" value="true" id="SinVencimiento[${index}]" name="SinVencimiento[${index}]" ${(item.archivos.length > index) ? item.archivos[index].vencimientoOk : ""}  ${inputDisabled} /> 
                                    <label class="form-check-label" for="SinVencimiento[${index}]">Sin vencimiento</label>
                                    
                                    <small class="c-gris">Si se selecciona "sin vencimiento", no es necesario ingresar una fecha de vencimiento.<br><br></small>
                                </div>
                                <div class="col-12">
                                    <label for="Vencimiento"><b>Vencimiento</b></label>
                                    <div>
                                        <input type="date" class="form-control" id="F-Vencimiento" name="FechaVencimiento[${index}]" aria-describedby="VencimientoAyuda" value="${(item.archivos.length > index) ? item.archivos[index].fechaVencimiento : ""}" ${(item.archivos.length > index) ? (item.archivos[index].vencimientoOk == 'checked' ? 'disabled' : '') : ''} placeholder=""  ${inputDisabled} >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
            });
            document.getElementById("listaCumplimientos").innerHTML = html;


            //HISTORIAL DE ARCHIVOS
            html = "";
            if (data.historialArchivos.length > 0) {
                data.historialArchivos.forEach(item => {
                    let botones =""
                    if (item.eliminado) {
                        botones = `
                            <button type="button" class="btn btn-xs btn-edit" onclick="archivoRecuperar('${item.nombre}', ${Tipo})">
                                Recuperar
                            </button>
                        `;

                        // 👇 Solo agregamos el botón "Eliminar" si el rol es Administrador
                        if (userRole === 'Administrador') {
                            botones += `
                                <button type="button" class="btn btn-xs btn-delete" onclick="archivoEliminarDefinitivamente('${item.nombre}', ${Tipo})">
                                    Eliminar
                                </button>
                            `;
                        }
                    }
                    html = html + `
                        <tr id="HA-${item.nombre}">
                            <td>${item.obligacion}</td>
                            <td>${item.fechaIngreso}</td>
                            <td><a target="_blank" href="${"https://requisitosmedioambiente.blob.core.windows.net/archivo/" + item.nombre}"><i class="fi fi-rr-clip"></i> ${item.nombre}</a></td>
                            <td>${botones}</td>
                        </tr>
                    `;
                });
            } else {
                html = `<tr><td>No hay evidencia cargada.</td></tr>`;
            }
            document.getElementById("F-HistorialArchivo").innerHTML = html;
            //HISTORIAL DE HISTORIAL
            html = "";
            data.historials.forEach(item => {
                let botonEliminar = '';

                if (userRole === 'Administrador') {
                    botonEliminar = `<button type="button" class="btn btn-xs btn-delete" onclick="historialEliminar(${item.id}, ${Tipo})">Eliminar</button>`;
                }
                html += `
                    <tr id="H-${item.id}">
                        <td>${item.fechaIngreso}</td>
                        <td>${HTMLTipo(item.tipo)}</td>
                        <td>${HTMLEstado(item.estado)}</td>
                        <td>${item.usuario}</td>
                        <td>${item.comentario}</td>
                        <td>${botonEliminar}</td>
                    </tr>
                `;
            });
            document.getElementById("F-Historial").innerHTML = html;

            document.getElementById("detalleObligacionPlantaNormaModal").classList.remove("hidden-div");
            // Llama a esto justo después de insertar el HTML:
            activarSinVencimientoListeners();
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });




}
function detalleObligacionPlantaRca(IdNormaPlanta, Tipo) {
    const inputDisabled = document.getElementById("desabilitadoMaster").value; // devuelve "disabled"
    const userRole = document.getElementById("TipodeUsuariohtmlAux").value;
    sectionModal(4);
    ajax({
        url: "../../RcasResoluciones/DetailsObligacionPlanta/" + IdNormaPlanta,
        method: "GET", dataType: "json",
        success: function (data) {

            document.getElementById("F-NombreNorma").innerHTML = `<b>${data.normaTipo} Nº${data.normaArticulo}/${data.normaAnio}</b><br> ${data.norma}`;

            //document.getElementById("F-NombreNorma").innerText = data.norma;
            document.getElementById("F-NombreObligacion").innerHTML = `<b>${data.obligacionArticulo}</b><br> ${data.obligacion}`;

            document.getElementById("F-Filial").innerText = data.filial;
            document.getElementById("F-Planta").innerText = data.planta;
            document.getElementById("F-Aspecto").innerText = data.aspecto;
            document.getElementById("F-Impacto").innerText = data.impacto;
            document.getElementById("F-Actividad1").innerText = data.actividad1;
            document.getElementById("F-Actividad2").innerText = data.actividad2;
            document.getElementById("F-Topico1").innerText = data.topico1;
            document.getElementById("F-Topico2").innerText = data.topico2;
            document.getElementById("F-Topico3").innerText = data.topico3;
            document.getElementById("F-IdNormaPlanta").value = IdNormaPlanta;


            //LOS ARCHIVO LA COSA COMPLETA
            var nArchivo = document.getElementById("N-Archivo2");
            var link = nArchivo ? nArchivo.querySelector("a") : null;

            if (data.archivo === null || data.archivo === undefined || data.archivo.trim() === "") {
                nArchivo.classList.add("hidden-div");
            } else {
                // Si tiene valor, quita la clase y actualiza el href
                if (nArchivo) nArchivo.classList.remove("hidden-div");
                if (link) {
                    link.href = "https://requisitosmedioambiente.blob.core.windows.net/norma/" + data.archivo;
                }
            }
            
            document.getElementById("fechaCalendario").value = data.vencimiento;
            document.getElementById("tituloCalendario").value = data.norma;
            document.getElementById("F-Estado").value = data.estado;
            document.getElementById("F-Criticidad").value = data.criticidad;

            try {
                document.getElementById("RevisionCheck").checked = false;
                document.getElementById("RevisionCheck").checked = data.revision;
            } catch { }

            /*document.getElementById("F-Vencimiento").value = data.vencimiento;*/
            document.getElementById("F-Comentario").value = data.comentario;
            let html = "";
            document.getElementById("TotalInputs").value = data.cumplimientos.length;

            document.getElementById("F-Archivo1").innerHTML = "";
            document.getElementById("F-Archivo2").innerHTML = "";

            if (data.archivo1 != null) {
                let tabla1 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo1}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small>`
                document.getElementById("F-Archivo1").innerHTML = tabla1;
                document.getElementById("ayuda1").classList.remove("hidden-div")


                //Agregar a acontinuacion del nombre.let html = `<p>Nuevo contenido agregado al final</p>`;
                let tabla = `
                    <div class="tabla">
                        <a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleTabla(this)">Ver tabla</a>
                        <div class="tabla-contenido hidden-div">
                            <img src="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo1}" class="img-fluid">
                        </div>
                    </div>
                `
                document.getElementById("F-NombreObligacion").insertAdjacentHTML("beforeend", tabla);


            } else {
                document.getElementById("ayuda1").classList.add("hidden-div")
            }
            if (data.archivo2 != null) {
                let tabla2 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo2}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small>`
                document.getElementById("F-Archivo2").innerHTML = tabla2;
                document.getElementById("ayuda2").classList.remove("hidden-div")
            } else {
                document.getElementById("ayuda2").classList.add("hidden-div")
            }

            data.cumplimientos.forEach((item, index) => {
                let color = "";
                if (item.archivos.length > 0) {
                    switch (item.archivos[0].estado) {
                        case "Vencido":
                            color = "bg-rojo";
                            break;
                        case "Por vencer":
                            color = "bg-amarillo";
                            break;
                        case "Vigente":
                            color = "bg-verde";
                            break;
                    }
                }
                let archivos = "";
                if (item.archivos.length > 0) {
                    item.archivos[0].documentos.forEach((item2, index2) => {
                        archivos += `
                            <span class="badge bg-gris" id="${item2}">
                                <a title="${item2}" href="${"https://requisitosmedioambiente.blob.core.windows.net/archivo/" + item2}" target="_blank">${ HTMLCortar(item2,40)} </a>&nbsp;&nbsp;
                                ${inputDisabled === "" ? `<buttom class="pointerC" onclick="archivoEliminar('${item2}',${Tipo})" title="Eliminar Archivo"> <i class="fi fi-rr-circle-xmark"></i></buttom>` : ""}
                            </span>
                        `;
                    });
                }

                html += `
                    <div class="row borde bg-fondo mar-b align-items-end">
                        <div class="col-12">
                            <small class="c-gris">Forma de Cumplimiento ${index + 1} <span class="badge ${color}">${(item.archivos.length > 0) ? item.archivos[0].estado : ""}</span></small><br>
                            <b><span id="F-Cumplimiento1">${item.nombre}</span></b>
                        </div>
                        <div class="col-8">
                            <small class="c-gris">Últimos archivos: ${(item.archivos.length > 0) ? item.archivos[0].fechaIngreso : ""}</small><br>
                            <small>${archivos}</small>
                            <p class="text-marginNo">
                                <br>
                                <small class="c-gris">Subir Nueva Evidencia</small><br>
                            </p>
                            <input type="file" id="archivos" class="form-control" name="Archivos[${index}]" multiple ${inputDisabled} >
                            <input type="hidden"  name="IdRcaFormaCumplimiento[${index}]" value="${item.idRcaFormaCumplimiento}" ${inputDisabled} >
                            <input type="hidden"  name="IdRcaPlantaArchivo[${index}]" value="${(item.archivos.length > 0) ? item.archivos[0].idRcaPlantaArchivo : ""}" ${inputDisabled} >

                        </div>
                        <div class="col-4">
                            <div class="row form-group">
                                <div class="col-12">
                                    <input type="checkbox" value="true" id="SinVencimiento[${index}]" name="SinVencimiento[${index}]" ${(item.archivos.length > index) ? item.archivos[index].vencimientoOk : ""} ${inputDisabled} /> 
                                    <label class="form-check-label" for="SinVencimiento[${index}]">Sin vencimiento</label>
                                    <small class="c-gris">Si se selecciona "sin vencimiento", no es necesario ingresar una fecha de vencimiento.<br><br></small>
                                </div>
                                <div class="col-12">
                                    <label for="Vencimiento"><b>Vencimiento</b></label>
                                    <div>
                                        <input type="date" class="form-control" id="F-Vencimiento" name="FechaVencimiento[${index}]" aria-describedby="VencimientoAyuda" value="${(item.archivos.length > index) ? item.archivos[index].fechaVencimiento : ""}" ${(item.archivos.length > index) ? (item.archivos[index].vencimientoOk == 'checked' ? 'disabled' : '') : ''} placeholder="" ${inputDisabled} >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
            });
            document.getElementById("listaCumplimientos").innerHTML = html;


            //HISTORIAL DE ARCHIVOS
            html = "";
            if (data.historialArchivos.length > 0) {
                data.historialArchivos.forEach(item => {
                    let botones = ""
                    if (item.eliminado) {
                        botones = `
                            <button type="button" class="btn btn-xs btn-edit" onclick="archivoRecuperar('${item.nombre}', ${Tipo})">
                                Recuperar
                            </button>
                        `;

                        // 👇 Solo agregamos el botón "Eliminar" si el rol es Administrador
                        if (userRole === 'Administrador') {
                            botones += `
                                <button type="button" class="btn btn-xs btn-delete" onclick="archivoEliminarDefinitivamente('${item.nombre}', ${Tipo})">
                                    Eliminar
                                </button>
                            `;
                        }
                    }
                    html = html + `
                        <tr id="HA-${item.nombre}">
                            <td>${item.obligacion}</td>
                            <td>${item.fechaIngreso}</td>
                            <td><a target="_blank" href="${"https://requisitosmedioambiente.blob.core.windows.net/archivo/" + item.nombre}"><i class="fi fi-rr-clip"></i> ${item.nombre}</a></td>
                            <td>${botones}</td>
                        </tr>
                    `;
                });
            } else {
                html = `<tr><td>No hay evidencia cargada.</td></tr>`;
            }
            document.getElementById("F-HistorialArchivo").innerHTML = html;
            //HISTORIAL DE HISTORIAL
            html = "";
            data.historials.forEach(item => {
                let botonEliminar = '';

                if (userRole === 'Administrador') {
                    botonEliminar = `<button type="button" class="btn btn-xs btn-delete" onclick="historialEliminar(${item.id}, ${Tipo})">Eliminar</button>`;
                }

                html += `
                    <tr id="H-${item.id}">
                        <td>${item.fechaIngreso}</td>
                        <td>${HTMLTipo(item.tipo)}</td>
                        <td>${HTMLEstado(item.estado)}</td>
                        <td>${item.usuario}</td>
                        <td>${item.comentario}</td>
                        <td>${botonEliminar}</td>
                    </tr>
                `;
            });
            document.getElementById("F-Historial").innerHTML = html;

            document.getElementById("detalleObligacionPlantaRcaModal").classList.remove("hidden-div");
            // Llama a esto justo después de insertar el HTML:
            activarSinVencimientoListeners();
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });




}


function detalleAccionHallazgo(IdAccion) {
    const inputDisabled = document.getElementById("desabilitadoMaster").value; // devuelve "disabled"
    const userRole = document.getElementById("TipodeUsuariohtmlAux").value;
    sectionModal(4);
    ajax({
        url: "../../Hallazgo/DetailsAccionHallazgo/" + IdAccion,
        method: "GET", dataType: "json",
        success: function (data) {
            
            //document.getElementById("F-NombreNorma").innerText = data.norma;
            document.getElementById("F-CodigoHallazgo").innerHTML = `${data.codigo}`;
            document.getElementById("F-NombreAccion").innerHTML = data.descripcion;
            document.getElementById("F-IdAccion").value = data.id;

            document.getElementById("F-Filial").innerText = data.filial;
            document.getElementById("F-Planta").innerText = data.planta;
            document.getElementById("F-Actividad1").innerText = data.actividad1;
            document.getElementById("F-Actividad2").innerText = data.actividad2;
            document.getElementById("F-Topico1").innerText = data.topico1;
            document.getElementById("F-Topico2").innerText = data.topico2;
            document.getElementById("F-Costo").innerText = data.costo;

            document.getElementById("fechaCalendario").value = data.vencimiento;
            document.getElementById("tituloCalendario").value = data.descripcion;

            document.getElementById("F-Vencimiento").value = data.vencimiento;
            document.getElementById("F-Estado").value = data.estado;
            document.getElementById("F-Comentario").value = data.comentario;

            try {
                document.getElementById("RevisionCheck").checked = false;
                document.getElementById("RevisionCheck").checked = data.revision;
            } catch { }

            let html = "";


            let archivos = ""
            if (data.archivos.length > 0) {
                data.archivos.forEach((item2, index2) => {
                    archivos += `
                        <span class="badge bg-gris" id="${item2.id}">
                            <a title="${item2.nombre}" href="${"https://requisitosmedioambiente.blob.core.windows.net/accion/" + item2.id}" target="_blank">${HTMLCortar(item2.nombre, 40)} </a > &nbsp;&nbsp;
                            ${inputDisabled === "" ? `<buttom class="pointerC" onclick="archivoEliminar('${item2.id}',${Tipo})" title="Eliminar Archivo"> <i class="fi fi-rr-circle-xmark"></i></buttom>` : ""}
                        </span>
                    `;
                });
            }
            document.getElementById("listaArchivos").innerHTML = archivos;

            //HISTORIAL DE ARCHIVOS
            html = "";
            if (data.historialArchivos.length > 0) {
                data.historialArchivos.forEach(item => {
                    let botones = ""
                    if (item.eliminado) {
                        botones = `
                            <button type="button" class="btn btn-xs btn-edit" onclick="archivoRecuperar('${item.nombre}', ${Tipo})">
                                Recuperar
                            </button>
                        `;

                        // 👇 Solo agregamos el botón "Eliminar" si el rol es Administrador
                        if (userRole === 'Administrador') {
                            botones += `
                                <button type="button" class="btn btn-xs btn-delete" onclick="archivoEliminarDefinitivamente('${item.nombre}', ${Tipo})">
                                    Eliminar
                                </button>
                            `;
                        }
                    }
                    html = html + `
                        <tr id="HA-${item.nombre}">
                            <td>${item.fechaIngreso}</td>
                            <td><a target="_blank" href="${"https://requisitosmedioambiente.blob.core.windows.net/accion/" + item.id}"><i class="fi fi-rr-clip"></i> ${item.nombre}</a></td>
                            <td>${botones}</td>
                        </tr>
                    `;
                });
            } else {
                html = `<tr><td>No hay evidencia cargada.</td></tr>`;
            }
            document.getElementById("F-HistorialArchivo").innerHTML = html;
            //HISTORIAL DE HISTORIAL
            html = "";
            data.historials.forEach(item => {
                let botonEliminar = '';

                if (userRole === 'Administrador') {
                    botonEliminar = `<button type="button" class="btn btn-xs btn-delete" onclick="historialEliminar(${item.id}, ${Tipo})">Eliminar</button>`;
                }
                html += `
                    <tr id="H-${item.id}">
                        <td>${item.fechaIngreso}</td>
                        <td>${HTMLTipo(item.tipo)}</td>
                        <td>${HTMLEstado(item.estado)}</td>
                        <td>${item.usuario}</td>
                        <td>${item.comentario}</td>
                        <td>${botonEliminar}</td>
                    </tr>
                `;
            });
            document.getElementById("F-Historial").innerHTML = html;

            document.getElementById("detalleObligacionPlantaNormaModal").classList.remove("hidden-div");
            // Llama a esto justo después de insertar el HTML:
            activarSinVencimientoListeners();
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });




}



function detalleTodo(Id, Tipo) {
    if (Tipo == 3) {
        detalleRca(Id);
        return;
    }
    detalleNorma(Id);
}
function detalleNorma(IdNorma) {
    sectionModal(1);
    ajax({
        url: "../../Normas/Details/" + IdNorma,
        method: "GET", dataType: "json",
        success: function (data) {

            document.getElementById("NombreTitulo").innerHTML = `<b>${data.tipo} Nº${data.numero} / ${data.publicacion.slice(-4) }</b> <br> ${data.nombre}`;
            document.getElementById("N-Nombre").innerText = data.nombre;
            document.getElementById("N-Tipo").innerText = data.tipo;
            document.getElementById("N-Publicacion").innerText = data.publicacion;
            document.getElementById("N-Promulgacion").innerText = data.promulgacion;
            document.getElementById("N-Vigencia").innerText = data.vigencia;
            document.getElementById("N-Activo").innerText = data.derogado;
            document.getElementById("N-Numero").innerText = data.numero;
            document.getElementById("N-Link").innerText = fn.recortaTexto(data.link);
            document.getElementById("N-Link").setAttribute("href", data.link);
            document.getElementById("N-Autoridad").innerText = data.autoridad;
            document.getElementById("N-Archivo").innerText = data.archivo;
            document.getElementById("N-Archivo").href = "https://requisitosmedioambiente.blob.core.windows.net/norma/" + data.archivo;
            document.getElementById("N-Resumen").innerText = data.resumen;

            const btnCalendario1 = document.getElementById("btncalendario1");
            if (data.vigenciaF !== null && data.vigenciaF !== undefined && data.vigenciaF.trim() !== "") {
                // Mostrar el botón si está oculto
                if (btnCalendario1.classList.contains("hidden-div")) {
                    btnCalendario1.classList.remove("hidden-div");
                }
            } else {
                // Ocultar el botón si no está oculto
                if (!btnCalendario1.classList.contains("hidden-div")) {
                    btnCalendario1.classList.add("hidden-div");
                }
            }

            document.getElementById("fechaCalendario").value = data.vigenciaF;
            document.getElementById("tituloCalendario").value = data.nombre;
            document.getElementById("obligacion").innerHTML = "";
            data.obligaciones.forEach(function (item) {

                let tabla1 = ``;
                let tabla2 = ``;
                if (item.archivo1 !== null && item.archivo1 !== '') {
                    tabla1 = `
                            <p class="col-6">
                                <small class="c-gris">Tabla adjunta (descargar)</small><br>
                                <b><span"><small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo1}" target="_blank" class="badge bg-gris">(tabla de ayuda)</a></small></span></b>
                            </p>
                        `
                }
                if (item.archivo2 !== null && item.archivo2 !== '') {
                    tabla2 = `
                            <p class="col-6">
                                <small class="c-gris">Archivo adjunto</small><br>
                                <b><span"><small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo2}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small></span></b>
                            </p>
                            `
                }


                let obligaciones = ``
                item.listaCumplimiento.forEach(function (item2, i) {
                    obligaciones += `
                        <p>
                            <small class="c-gris">Forma de Cumplimiento ${i + 1}</small><br>
                            <b><span>${item2.nombre}</span></b>
                        </p>`
                })
                let tablahtml = ``
                if (item.archivo1 != null) {
                    tablahtml = `
                        <div class="tabla">
                            <a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleTabla(this)">Ver tabla</a>
                            <div class="tabla-contenido hidden-div">
                                <img src="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo1}" class="img-fluid">
                            </div>
                        </div>`
                }

                let html = `<div class="row borde mar-b" id="obligacion-${item.idNormaObligacion}">
                                    <div class="col-9">
                                        <div class="row">
                                            <div class="col-12">
                                                <p>
                                                    <small class="c-gris">${item.articulo}</small><br>
                                                    <b><span">${item.nombre}</span>${tablahtml}</b>
                                                    
                                                </p>
                                            </div>
                                            <div class="col-12">
                                                <div class="row">
                                                    <p class="col-6">
                                                        <small class="c-gris">Aspecto Ambiental</small><br>
                                                        <b><span">${item.aspecto}</span></b>
                                                    </p>
                                                    <p class="col-6">
                                                        <small class="c-gris">Impacto Ambiental</small><br>
                                                        <b><span">${item.impacto}</span></b>
                                                    </p>
                                                    ${tabla1}
                                                    ${tabla2}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="row">
                                            <div class="col-12">
                                                <p>
                                                    <small class="c-gris">Topico 1</small><br>
                                                    <b><span">${item.topico1}</span></b>
                                                </p>
                                                <p>
                                                    <small class="c-gris">Topico 2</small><br>
                                                    <b><span">${item.topico2}</span></b>
                                                </p>
                                                <p>
                                                    <small class="c-gris">Topico 3</small><br>
                                                    <b><span">${item.topico3}</span></b>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <h3>Forma de Cumplimiento</h3>
                                        ${obligaciones}
                                    </div>
                                    <div class="col-12">
                                        <hr>
                                    </div>
                                </div>`;
                document.getElementById('obligacion').insertAdjacentHTML("beforeend", html)
            });

            if (data.permisos.length > 0) {
                document.getElementById("permiso").innerHTML = "";
                data.permisos.forEach(function (item) {
                    let tabla1 = ``;
                    let tabla2 = ``;
                    if (item.archivo1 !== null && item.archivo1 !== '') {
                        tabla1 = `
                            <p class="col-6">
                                <small class="c-gris">Tabla adjunta (descargar)</small><br>
                                <b><span"><small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo1}" target="_blank" class="badge bg-gris">(tabla de ayuda)</a></small></span></b>
                            </p>
                        `
                    }
                    if (item.archivo2 !== null && item.archivo2 !== '') {
                        tabla2 = `
                            <p class="col-6">
                                <small class="c-gris">Archivo adjunto</small><br>
                                <b><span"><small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo2}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small></span></b>
                            </p>
                            `
                    }

                    let permisos = ``
                    item.listaCumplimiento.forEach(function (item2, i) {
                        permisos += `
                        <p>
                            <small class="c-gris">Forma de Cumplimiento ${i + 1}</small><br>
                            <b><span>${item2.nombre}</span></b>
                        </p>`
                    })

                    let tablahtml = ``
                    if (item.archivo1 != null) {
                        tablahtml = `
                        <div class="tabla">
                            <a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleTabla(this)">Ver tabla</a>
                            <div class="tabla-contenido hidden-div">
                                <img src="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo1}" class="img-fluid">
                            </div>
                        </div>`
                    }


                    let html = `<div class="row borde mar-b" id="obligacion-${item.idNormaObligacion}">
                                    <div class="col-9">
                                        <div class="row">
                                            <div class="col-12">
                                                <p>
                                                    <small class="c-gris">${item.articulo}</small><br>
                                                    <b><span">${item.nombre}</span>${tablahtml}</b>
                                                </p>
                                            </div>
                                            ${tabla1}
                                            ${tabla2}
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="row">
                                            <div class="col-12">
                                                <p>
                                                    <small class="c-gris">Topico 1</small><br>
                                                    <b><span>${item.topico1}</span></b>
                                                </p>
                                                <p>
                                                    <small class="c-gris">Topico 2</small><br>
                                                    <b><span>${item.topico2}</span></b>
                                                </p>
                                                <p>
                                                    <small class="c-gris">Topico 3</small><br>
                                                    <b><span>${item.topico3}</span></b>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <h3>Forma de Cumplimiento</h3>
                                        ${permisos}
                                    </div>
                                    <div class="col-12">
                                        <hr>
                                    </div>
                                </div>`;
                    document.getElementById('permiso').insertAdjacentHTML("beforeend", html)
                });

            }
            


            document.getElementById("detalleNormaModal").classList.remove("hidden-div");
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}
function detalleRca(IdNorma) {
    sectionModal(1);
    ajax({
        url: "../../RcasResoluciones/Details/" + IdNorma,
        method: "GET", dataType: "json",
        success: function (data) {

            document.getElementById("NombreTitulo").innerHTML = `<b>${data.tipo} Nº${data.numero} / ${data.publicacion.substring(0, 4)}</b> <br> ${data.nombre}`;
            document.getElementById("tituloDiv").innerText = data.tipoDefSingular;
            document.getElementById("tituloDiv2").innerText = data.tipoDefSingular;
            
            document.getElementById("N-Nombre").innerText = data.nombre;
            document.getElementById("N-Tipo").innerText = data.tipo;
            document.getElementById("N-Publicacion").innerText = data.publicacion;
            document.getElementById("N-Activo").innerText = data.activo;
            document.getElementById("N-Numero").innerText = data.numero;
            document.getElementById("N-Autoridad").innerText = data.autoridad;
            document.getElementById("N-Resumen").innerText = data.resumen;
            //LOS ARCHIVO LA COSA COMPLETA
            var nArchivo = document.getElementById("N-Archivo");
            var link = nArchivo ? nArchivo.querySelector("a") : null;

            if (data.archivo === null || data.archivo === undefined || data.archivo.trim() === "") {
                nArchivo.classList.add("hidden-div");
            } else {
                // Si tiene valor, quita la clase y actualiza el href
                if (nArchivo) nArchivo.classList.remove("hidden-div");
                if (link) {
                    link.href = "https://requisitosmedioambiente.blob.core.windows.net/norma/" + data.archivo;
                }
            }

            const btnCalendario1 = document.getElementById("btncalendario2");
            if (data.publicacionF !== null && data.publicacionF !== undefined && data.publicacionF.trim() !== "") {
                // Mostrar el botón si está oculto
                if (btnCalendario1.classList.contains("hidden-div")) {
                    btnCalendario1.classList.remove("hidden-div");
                }
            } else {
                // Ocultar el botón si no está oculto
                if (!btnCalendario1.classList.contains("hidden-div")) {
                    btnCalendario1.classList.add("hidden-div");
                }
            }

            document.getElementById("fechaCalendario").value = data.publicacionF;
            document.getElementById("tituloCalendario").value = data.nombre;



            document.getElementById("obligacion").innerHTML = "";
            data.obligaciones.forEach(function (item) {

                let tabla1 = ``;
                let tabla2 = ``;
                if (item.archivo1 !== null && item.archivo1 !== '') {
                    tabla1 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo1}" target="_blank" class="badge bg-gris">(tabla de ayuda)</a></small>`
                }
                if (item.archivo2 !== null && item.archivo2 !== '') {
                    tabla2 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${item.archivo2}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small>`
                }


                let obligaciones = ``
                item.listaCumplimiento.forEach(function (item2, i) {



                    obligaciones += `<p>
                                            <small class="c-gris">Forma de Cumplimiento ${i + 1}</small><br>
                                            <b><span>${item2.nombre}</span></b>
                                        </p>`
                })

                let html = `<div class="row borde mar-b" id="obligacion-${item.idNormaObligacion}">
                                    <div class="col-9">
                                        <div class="row">
                                            <div class="col-12">
                                                <p>
                                                    <small class="c-gris">${item.articulo}</small><br>
                                                    <b><span">${item.nombre}</span></b>
                                                </p>
                                            </div>
                                            <div class="col-12">
                                                <div class="row">
                                                    <p class="col-6">
                                                        <small class="c-gris">Aspecto Ambiental</small><br>
                                                        <b><span">${item.aspecto}</span></b>
                                                    </p>
                                                    <p class="col-6">
                                                        <small class="c-gris">Impacto Ambiental</small><br>
                                                        <b><span">${item.impacto}</span></b>
                                                    </p>
                                                    <p class="col-6">
                                                        <small class="c-gris">Archivo ayuda</small><br>
                                                        <b><span">${tabla1}</span></b>
                                                    </p>
                                                    <p class="col-6">
                                                        <small class="c-gris">Archivo ayuda 2</small><br>
                                                        <b><span">${tabla2}</span></b>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-3">
                                        <div class="row">
                                            <div class="col-12">
                                                <p>
                                                    <small class="c-gris">Topico 1</small><br>
                                                    <b><span">${item.topico1}</span></b>
                                                </p>
                                                <p>
                                                    <small class="c-gris">Topico 2</small><br>
                                                    <b><span">${item.topico2}</span></b>
                                                </p>
                                                <p>
                                                    <small class="c-gris">Topico 3</small><br>
                                                    <b><span">${item.topico3}</span></b>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <h3>Forma de Cumplimiento</h3>
                                        ${obligaciones}
                                    </div>
                                    <div class="col-12">
                                        <hr>
                                    </div>
                                </div>`;
                document.getElementById('obligacion').insertAdjacentHTML("beforeend", html)
            });
                
            document.getElementById("detalleNormaModal").classList.remove("hidden-div");
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}
function detalleHallazgo(Idhallazgo) {
    /*sectionModal(1);*/
    ajax({
        url: "../../Hallazgo/Details/" + Idhallazgo,
        method: "GET", dataType: "json",
        success: function (data) {
            document.getElementById("CodigoTitulo").innerHTML = data.codigo;

            document.getElementById("H-Planta").innerText = data.planta;
            document.getElementById("H-Filial").innerText = data.filial;
            document.getElementById("H-Actividad1").innerText = data.actividad1;
            document.getElementById("H-Actividad2").innerText = data.actividad2;
            document.getElementById("H-Topico1").innerText = data.topico1;
            document.getElementById("H-Topico2").innerText = data.topico2;

            document.getElementById("H-Tipo").innerText = data.tipo;
            document.getElementById("H-Origen").innerText = data.origen;
            document.getElementById("H-Clasificacion").innerText = data.clasificacion;
            document.getElementById("H-Criticidad").innerText = data.criticidad;
            document.getElementById("H-Estado").innerText = data.estado;
            document.getElementById("H-Responsable").innerText = data.responsable;

            document.getElementById("H-FechaEvento").innerText = data.fechaEvento;
            document.getElementById("H-Descripcion").innerHTML = data.descripcion;

            document.getElementById("fechaCalendario").value = data.fechaEvento;
            document.getElementById("tituloCalendario").value = data.codigo;

            document.getElementById("H-AccionesLista").innerHTML = "";
            data.acciones.forEach(function (item) {
                let html = `<div class="row borde mar-b">
                                <div class="col-12">
                                    <div class="row">
                                        <div class="col">
                                            <p>
                                                <small class="c-gris">Responsable</small><br>
                                                <b><span">${item.responsable}</span></b>
                                            </p>
                                        </div>
                                        <div class="col">
                                            <p>
                                                <small class="c-gris">Fecha Vencimiento</small><br>
                                                <b><span">${item.fechaVencimiento}</span></b>
                                            </p>
                                        </div>
                                        <div class="col">
                                            <p>
                                                <small class="c-gris">Costo</small><br>
                                                <b><span">$ ${fn.formateaNumero(item.costo)}</span></b >
                                            </p>
                                        </div>
                                        <div class="col">
                                            <p>
                                                <small class="c-gris">Estado</small><br>
                                                <b><span">${HTMLEstado(item.estado)}</span></b >
                                            </p>
                                        </div>
                                        <div class="col">
                                            <p>
                                                <small class="c-gris">Revision</small><br>
                                                <b><span">${HTMLRevision(item.revision)}</span></b >
                                            </p>
                                        </div>
                                        <div class="col-12">
                                            <p class="sin-margin">
                                                <small class="c-gris">Descripción</small><br>
                                                ${item.descripcion}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <hr>
                                </div>
                            </div>`;
                document.getElementById('H-AccionesLista').insertAdjacentHTML("beforeend", html)
            });


            data.obligaciones.forEach(function (item) {
                let html = `<div class="row borde mar-b">
                                <div class="col-12">
                                    <div class="row">
                                        
                                        <div class="col-12">
                                            <p>
                                                <span id="Tipo-1">${item.tipo} Nº ${item.numero}  / ${item.anio} </span><br>
                                                <small class="c-gris">
                                                    <span id="ADescripcion-1">${item.autoridad} </span><br>
                                                </small>
                                            </p>
                                            <p>
                                                <small class="c-gris">Responsable</small><br>
                                                <b><span">${item.obligacion}</span></b>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <hr>
                                </div>
                            </div>`;
                document.getElementById('H-ObligacionesLista').insertAdjacentHTML("beforeend", html)
            });

            document.getElementById("detalleHallazgoModal").classList.remove("hidden-div");
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}

function detalleObligacionNorma(IdNormaPlanta) {
    ajax({
        url: "../../Normas/DetailsObligacion/" + IdNormaPlanta,
        method: "GET", dataType: "json",
        success: function (data) {
            document.getElementById("F-NombreNorma").innerHTML = `<b>${data.normaTipo} Nº${data.normaArticulo}/${data.normaAnio}</b><br> ${data.normaNombre}`;
            //FALTA normatipo normaAutoridad normaArticulo
            document.getElementById("F-TipoTexto").innerText = data.tipoTexto;

            document.getElementById("F-NombreObligacion").innerHTML = `<b>${data.articulo}</b><br> ${data.obligacion}`;
            document.getElementById("F-Aspecto").innerText = data.aspecto;
            document.getElementById("F-Impacto").innerText = data.impacto;
            document.getElementById("F-Articulo").innerText = data.articulo;
            document.getElementById("F-Etapa").innerText = data.etapa;
            document.getElementById("F-Topico1").innerText = data.topico1;
            document.getElementById("F-Topico2").innerText = data.topico2;
            document.getElementById("F-Topico3").innerText = data.topico3;

            document.getElementById("N-Archivo").innerText = data.archivo;


            document.getElementById("F-Archivo1").innerHTML = "";
            document.getElementById("F-Archivo2").innerHTML = "";

            if (data.archivo1 != null) {
                let tabla1 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo1}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small>`
                document.getElementById("F-Archivo1").innerHTML = tabla1;
                document.getElementById("ayuda1").classList.remove("hidden-div")


                //Agregar a acontinuacion del nombre.let html = `<p>Nuevo contenido agregado al final</p>`;
                let tabla = `
                    <div class="tabla">
                        <a href="javascript:void(0)" class="btn btn-xss btn-edit" onclick="toggleTabla(this)">Ver tabla</a>
                        <div class="tabla-contenido hidden-div">
                            <img src="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo1}" class="img-fluid">
                        </div>
                    </div>
                `
                document.getElementById("F-NombreObligacion").insertAdjacentHTML("beforeend", tabla);
            } else {
                document.getElementById("ayuda1").classList.add("hidden-div")
            }
            if (data.archivo2 != null) {
                let tabla2 = `<small><a href="https://requisitosmedioambiente.blob.core.windows.net/obligacion/${data.archivo2}" target="_blank" class="badge bg-gris">(documento ayuda)</a></small>`
                document.getElementById("F-Archivo2").innerHTML = tabla2;
                document.getElementById("ayuda2").classList.remove("hidden-div")
            } else {
                document.getElementById("ayuda2").classList.add("hidden-div")
            }

            let html = '';
            data.cumplimientos.forEach((item, index) => {
                html += `
                    <div class="row borde mar-b align-items-end">
                        <div class="col-12">
                            <small class="c-gris">Forma de Cumplimiento ${index + 1} </small><br>
                            <b><span id="F-Cumplimiento1">${item.nombre}</span></b>
                        </div>
                    </div>`
            });
            document.getElementById("listaCumplimientos").innerHTML = html;


            document.getElementById("detalleObligacionNormaModal").classList.remove("hidden-div");
            // Llama a esto justo después de insertar el HTML:
            activarSinVencimientoListeners();
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });




}



function archivoEliminar(aux, tipo) {
    // Guardamos como objeto con dos propiedades
    VariableEliminar.push({ aux: aux, tipo: tipo });
    document.getElementById(aux).remove();
    //ajax({
    //    url: "../../Normas/ArchivoEliminar?id=" + aux + "&tipo=" + tipo,
    //    method: "GET", dataType: "json",
    //    success: function (data) {
    //        if (data) {
    //            document.getElementById(aux).remove();

    //            //document.getElementById("F-HistorialArchivo");

    //        }
    //    },
    //    error: function (xhr, status, error) {
    //        console.warn("ERROR", xhr, status, error);
    //    }
    //});
}
function archivoEliminarDefinitivamente(aux, tipo) {
    ajax({
        url: "../../Normas/ArchivoEliminarDefinitivamente?id=" + aux + "&tipo=" + tipo,
        method: "GET", dataType: "json",
        success: function (data) {
            if (data) {
                document.getElementById("HA-" + aux).remove();

                //document.getElementById("F-HistorialArchivo");

            }
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}
function archivoRecuperar(aux,tipo) {
    ajax({
        url: "../../Normas/ArchivoRecuperar?id=" + aux + "&tipo=" + tipo,
        method: "GET", dataType: "json",
        success: function (data) {
            if (data) {
                document.getElementById("HA-"+aux).remove();

                //Agergar en el listado 

            }
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}
function historialEliminar(aux, tipo) {
    ajax({
        url: "../../Normas/HistorialEliminar?id=" + aux + "&tipo=" + tipo,
        method: "GET", dataType: "json",
        success: function (data) {
            if (data) {
                document.getElementById("H-" + aux).remove();

                //Agergar en el listado 

            }
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}


function agregarPropioCalendario(aux) {
    let fecha = document.getElementById("fechaCalendario").value;
    let titulo = document.getElementById("tituloCalendario").value;
    if (aux == 1) {
        agregarAGoogleCalendar(fecha, titulo)
        return;
    }
    if (aux == 2) {
        agregarAOutlookWeb(fecha, titulo)
        return;
    }
}
function agregarAGoogleCalendar(fecha, titulo) {
    const inicio = new Date(fecha + 'T09:00:00');
    const fin = new Date(fecha + 'T10:00:00');
    const inicioISO = encodeURIComponent(inicio.toISOString());
    const finISO = encodeURIComponent(fin.toISOString());
    const tituloEncoded = encodeURIComponent(titulo);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${tituloEncoded}&dates=${inicioISO}/${finISO}`;
    window.open(url, '_blank');
}
function agregarAOutlookWeb(fecha, titulo) {
    const inicio = new Date(fecha + 'T09:00:00');
    const fin = new Date(fecha + 'T10:00:00');
    const inicioStr = inicio.toISOString().substring(0, 16);
    const finStr = fin.toISOString().substring(0, 16);
    const url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(titulo)}&startdt=${inicioStr}&enddt=${finStr}`;
    window.open(url, '_blank');
}



function filtrarTopico1(Tipo, id, value = null, Filial = null, Planta = null, Admin = null) {
    return new Promise((resolve, reject) => {
        ajax({
            url: "../../Genericos/DetalleTopico1?IdTipo=" + Tipo + "&IdFilial=" + Filial + "&IdPlanta=" + Planta + "&Admin=" + Admin,
            method: "GET",
            dataType: "json",
            success: function (data) {
                let auxNombreId = id.slice(0, -1);
                const elem2 = document.getElementById(auxNombreId + "2");
                if (elem2) elem2.innerHTML = "";
                const elem3 = document.getElementById(auxNombreId + "3");
                if (elem3) elem3.innerHTML = "";

                let select = document.getElementById(id);
                select.innerHTML = "";
                // Crear y agregar la opción por defecto
                let opcionPorDefecto = document.createElement("option");
                opcionPorDefecto.value = "";
                opcionPorDefecto.textContent = "Seleccione un Tópico";
                select.appendChild(opcionPorDefecto);

                // Agregar opciones desde los datos
                data.forEach(function (item) {
                    let opcion = document.createElement("option");
                    opcion.value = item.value;
                    opcion.textContent = item.nombre;
                    select.appendChild(opcion);
                });

                if (value) {
                    const existe = Array.from(select.options).some(opt => opt.value === String(value));
                    // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                    select.value = existe ? value : "";
                } else {
                    select.value = "";
                }

                resolve(true); // <- marca que terminó exitosamente
            },
            error: function (xhr, status, error) {
                console.warn("ERROR", xhr, status, error);
                reject(error); // <- si ocurre un error, lo marca
            }
        });
    });
}
function filtrarTopico2(Tipo, selectedValue, id, value = null, Filial = null, Planta = null) {
    return new Promise((resolve, reject) => {
        ajax({
            url: "../../Genericos/DetalleTopico2?IdTipo=" + Tipo + "&Id=" + selectedValue + "&IdFilial=" + Filial + "&IdPlanta=" + Planta,
            method: "GET",
            dataType: "json",
            success: function (data) {
                let auxNombreId = id.slice(0, -1);
                let select = document.getElementById(id);
                select.innerHTML = "";
                // Crear y agregar la opción por defecto
                let opcionPorDefecto = document.createElement("option");
                opcionPorDefecto.value = "";
                opcionPorDefecto.textContent = "Seleccione un Tópico";
                select.appendChild(opcionPorDefecto);

                // Agregar opciones desde los datos
                data.forEach(function (item) {
                    let opcion = document.createElement("option");
                    opcion.value = item.value;
                    opcion.textContent = item.nombre;
                    select.appendChild(opcion);
                });

                if (value) {
                    const existe = Array.from(select.options).some(opt => opt.value === String(value));
                    // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                    select.value = existe ? value : "";
                } else {
                    select.value = "";
                }

                resolve(true);
            },
            error: function (xhr, status, error) {
                console.warn("ERROR", xhr, status, error);
                reject(error);
            }
        });
    });
}
function filtrarTopico3(Tipo, selectedValue, id, value = null, Filial = null, Planta = null) {
    return new Promise((resolve, reject) => {
        ajax({
            url: "../../Genericos/DetalleTopico3?IdTipo=" + Tipo + "&Id=" + selectedValue + "&IdFilial=" + Filial + "&IdPlanta=" + Planta,
            method: "GET",
            dataType: "json",
            success: function (data) {
                let select = document.getElementById(id);
                select.innerHTML = "";
                // Crear y agregar la opción por defecto
                let opcionPorDefecto = document.createElement("option");
                opcionPorDefecto.value = "";
                opcionPorDefecto.textContent = "Seleccione un Tópico";
                select.appendChild(opcionPorDefecto);

                // Agregar opciones desde los datos
                data.forEach(function (item) {
                    let opcion = document.createElement("option");
                    opcion.value = item.value;
                    opcion.textContent = item.nombre;
                    select.appendChild(opcion);
                });

                if (value) {
                    const existe = Array.from(select.options).some(opt => opt.value === String(value));
                    // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                    select.value = existe ? value : "";
                } else {
                    select.value = "";
                }

                resolve(true);
            },
            error: function (xhr, status, error) {
                console.warn("ERROR", xhr, status, error);
                reject(error);
            }
        });
    });
}

function filtrarActividad1(selectedValue, id, value) {
    ajax({
        url: "../../Genericos/DetalleActividad1/" + selectedValue,
        method: "GET", dataType: "json",
        success: function (data) {
            let auxNombreId = id.slice(0, -1);
            document.getElementById(auxNombreId + "2").innerHTML = "";

            let select = document.getElementById(id);
            select.innerHTML = "";
            let opcionPorDefecto = document.createElement("option");
            opcionPorDefecto.value = "";
            opcionPorDefecto.textContent = "Seleccione una Actividad";
            select.appendChild(opcionPorDefecto);

            // Agregar opciones desde los datos
            data.forEach(function (item) {
                let opcion = document.createElement("option");
                opcion.value = item.value;
                opcion.textContent = item.nombre;
                select.appendChild(opcion);
            });

            if (value) {
                const existe = Array.from(select.options).some(opt => opt.value === String(value));
                // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                select.value = existe ? value : "";
            } else {
                select.value = "";
            }
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}
function filtrarActividad2(selectedValue, id, value) {
    ajax({
        url: "../../Genericos/DetalleActividad2/" + selectedValue,
        method: "GET", dataType: "json",
        success: function (data) {


            let select = document.getElementById(id);
            select.innerHTML = "";
            let opcionPorDefecto = document.createElement("option");
            opcionPorDefecto.value = "";
            opcionPorDefecto.textContent = "Seleccione una Sub-Actividad";
            select.appendChild(opcionPorDefecto);

            // Agregar opciones desde los datos
            data.forEach(function (item) {
                let opcion = document.createElement("option");
                opcion.value = item.value;
                opcion.textContent = item.nombre;
                select.appendChild(opcion);
            });

            if (value) {
                const existe = Array.from(select.options).some(opt => opt.value === String(value));
                // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                select.value = existe ? value : "";
            } else {
                select.value = "";
            }
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}

function filtrarFilial(selectedValue, id, value, conectado) {
    ajax({
        url: "../../Genericos/DetalleFilial?id=" + selectedValue + "&conectado=" + conectado,
        method: "GET", dataType: "json",
        success: function (data) {
            let select = document.getElementById(id);
            let html = '<option  value="">Seleccione una Planta</option>';
            data.forEach(function (item) {
                html = html + '<option value="' + item.idPlanta + '">' + item.nombre + '</option>'
            })
            select.innerHTML = html;
            if (value) {
                const existe = Array.from(select.options).some(opt => opt.value === value);
                // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                select.value = existe ? value : "";
            } else {
                select.value = "";
            }
        },
        error: function (xhr, status, error) {
            console.warn("ERROR", xhr, status, error);
        }
    });
}
function filtrarAspecto(Tipo, id, value = null, Filial = null, Planta = null) {
    return new Promise((resolve, reject) => {
        ajax({
            url: "../../Genericos/DetalleAspecto?IdTipo=" + Tipo + "&IdFilial=" + Filial + "&IdPlanta=" + Planta,
            method: "GET",
            dataType: "json",
            success: function (data) {
                let select = document.getElementById(id);
                let html = '<option value="">Seleccione un Aspecto</option>';
                data.forEach(function (item) {
                    html += '<option value="' + item.value + '">' + item.nombre + '</option>';
                });
                select.innerHTML = html;

                if (value) {
                    const existe = Array.from(select.options).some(opt => opt.value === value);
                    // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                    select.value = existe ? value : "";
                } else {
                    select.value = "";
                }

                resolve(true); // <- marca que terminó exitosamente
            },
            error: function (xhr, status, error) {
                console.warn("ERROR", xhr, status, error);
                reject(error); // <- si ocurre un error, lo marca
            }
        });
    });
}
function filtrarUsuario(IdPlanta, id, value = null) {
    return new Promise((resolve, reject) => {
        ajax({
            url: "../../Genericos/DetalleUsuario?IdPlanta=" + IdPlanta,
            method: "GET",
            dataType: "json",
            success: function (data) {
                let select = document.getElementById(id);
                let html = '<option value="">Seleccione un Usuario</option>';
                data.forEach(function (item) {
                    html += '<option value="' + item.value + '">' + item.nombre + '</option>';
                });
                select.innerHTML = html;

                if (value) {
                    const existe = Array.from(select.options).some(opt => opt.value === value);
                    // Si existe, lo asigna; si no, selecciona el primero (índice 0)
                    select.value = existe ? value : "";
                } else {
                    select.value = "";
                }

                resolve(true); // <- marca que terminó exitosamente
            },
            error: function (xhr, status, error) {
                console.warn("ERROR", xhr, status, error);
                reject(error); // <- si ocurre un error, lo marca
            }
        });
    });
}