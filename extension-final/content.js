(function () {
    const urlActual = window.location.href;
    const esPaginaUcurso = urlActual.startsWith("https://www.u-cursos.cl/ingenieria/2/");
    if (!esPaginaUcurso) return;

    let contenedor = null;

    // Detecta si uCursos está en modo oscuro evaluando estilos aplicados al body
    function esModoOscuro() {
        const bg = getComputedStyle(document.body).backgroundColor;
        // Color típico del tema oscuro: rgb(24, 24, 24) u otros oscuros
        const [r, g, b] = bg.match(/\d+/g).map(Number);
        return (r + g + b) / 3 < 60; // muy oscuro
    }

    // Aplica estilos claros u oscuros al contenedor de eventos
    function aplicarTema() {
        if (!contenedor) return;

        const oscuro = esModoOscuro();
        contenedor.style.backgroundColor = oscuro ? "#1e1e1e" : "#ffffff";
        contenedor.style.color = oscuro ? "#f1f1f1" : "#000000";
        contenedor.style.border = "1px solid " + (oscuro ? "#444" : "#ccc");
        contenedor.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";

        const enlaces = contenedor.querySelectorAll("a");
        enlaces.forEach(a => {
            a.style.color = oscuro ? "#4EA6EA" : "#007bff";
        });

        const botones = contenedor.querySelectorAll("button");
        botones.forEach(btn => {
            btn.style.background = oscuro ? "#333" : "#eee";
            btn.style.border = "1px solid " + (oscuro ? "#666" : "#ccc");
            btn.style.color = oscuro ? "#f1f1f1" : "#000";
        });
    }

    // Observa cambios de tema de uCursos
    const observer = new MutationObserver(() => aplicarTema());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });

    function crearItemLateral() {
        const ulModulos = document.querySelector("ul.modulos");
        if (!ulModulos) return;

        const li = document.createElement("li");
        li.className = "servicio";

        const a = document.createElement("a");
        a.href = "#";
        a.style.display = "flex";
        a.style.flexDirection = "column";
        a.style.alignItems = "center";
        a.style.textAlign = "center";
        a.style.padding = "6px 0";

        const img = document.createElement("img");
        img.alt = "";
        img.src = chrome.runtime.getURL("img/eventos.png");
        img.style.width = "31px";
        img.style.height = "31px";

        const span = document.createElement("span");
        span.textContent = "Eventos";

        a.appendChild(img);
        a.appendChild(span);
        li.appendChild(a);
        ulModulos.appendChild(li);

        return a;
    }

    function insertarSeccionEventosFija() {
        if (document.getElementById("panel-fijo-afiches")) return;

        contenedor = document.createElement("div");
        contenedor.id = "panel-fijo-afiches";

        Object.assign(contenedor.style, {
            position: "fixed",
            top: "80px",
            right: "20px",
            width: "340px",
            maxHeight: "80vh",
            padding: "12px 16px",
            borderRadius: "6px",
            zIndex: "9999",
            overflowY: "auto",
        });

        contenedor.innerHTML = `
            <h3 style="display:flex; align-items:center; justify-content:space-between; margin-top:0;">
                <span>
                    <img src="${chrome.runtime.getURL("img/eventos.png")}" alt="" style="width:20px; vertical-align:middle; margin-right:6px;">
                    Próximos Eventos
                </span>
                <button id="cerrar-afiches" style="
                    border-radius:4px;
                    padding:2px 8px;
                    cursor:pointer;">×</button>
            </h3>
            <div id="contenido-afiches">
                <p>Cargando eventos...</p>
            </div>
        `;

        document.body.appendChild(contenedor);
        aplicarTema(); // aplicar estilos según modo

        document.getElementById("cerrar-afiches").addEventListener("click", () => {
            contenedor.style.display = "none";
        });

        cargarAfichesLista();
    }

    async function cargarAfichesLista() {
        try {
            // Obtener eventos del servidor del modelo (grupo6)
            const res = await fetch("https://grupo6.juan.cl/afichesApp/afichesApp-front/api/afiches");
            const afiches = await res.json();

            // Obtener IDs de eventos con reclamos aceptados desde nuestro servidor local
            let idsReportados = [];
            try {
                const resReclamos = await fetch("http://localhost:5000/afichesApp/afichesApp-front/api/afiches-reportados");
                const reportados = await resReclamos.json();
                idsReportados = reportados.map(item => item.foto_id);
            } catch (e) {
                console.log("No se pudieron cargar reclamos reportados:", e);
            }

            // Filtrar eventos excluyendo los que tienen reclamos aceptados
            const afichesFiltrados = afiches.filter(afiche => !idsReportados.includes(afiche.id));

            const lista = document.createElement("ul");
            lista.style.listStyle = "none";
            lista.style.padding = "0";
            lista.style.margin = "0";

            if (afichesFiltrados.length === 0) {
                const noEventos = document.createElement("li");
                noEventos.style.textAlign = "center";
                noEventos.style.color = esModoOscuro() ? "#bbb" : "#666";
                noEventos.style.fontStyle = "italic";
                noEventos.style.padding = "20px";
                noEventos.textContent = "No hay eventos disponibles en este momento";
                lista.appendChild(noEventos);
            } else {
                afichesFiltrados.forEach(afiche => {
                    const item = document.createElement("li");
                    item.style.marginBottom = "12px";
                    item.style.borderBottom = "1px solid #444";
                    item.style.paddingBottom = "8px";

                    const nombre = afiche.nombre || "Evento sin título";
                    const url = `https://www.u-cursos.cl/ingenieria/2/afiches/detalle?id=${afiche.id}`;

                    const aColor = esModoOscuro() ? "#4EA6EA" : "#007bff";

                    item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                        <div style="flex: 1;">
                            <p style="margin:0;">
                                <strong>📌 ${nombre}</strong><br>
                                <a href="${url}" target="_blank" style="color:${aColor};">
                                    Ver afiche →
                                </a>
                            </p>
                        </div>
                        <button 
                            class="btn-reclamo" 
                            data-afiche-id="${afiche.id}"
                            data-afiche-nombre="${nombre}"
                            style="
                                background: #ff4757;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                padding: 4px 8px;
                                font-size: 11px;
                                cursor: pointer;
                                white-space: nowrap;
                                transition: background 0.3s ease;
                            "
                            onmouseover="this.style.background='#ff3742'"
                            onmouseout="this.style.background='#ff4757'"
                            title="Reportar problema con este evento">
                            🚨 Reportar
                        </button>
                    </div>
                `;
                    lista.appendChild(item);
                });
            }

            const contenedorLista = document.getElementById("contenido-afiches");
            contenedorLista.innerHTML = "";
            contenedorLista.appendChild(lista);

            // Agregar event listeners a los botones de reclamo
            const botonesReclamo = lista.querySelectorAll('.btn-reclamo');
            botonesReclamo.forEach(boton => {
                boton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const aficheId = boton.getAttribute('data-afiche-id');
                    const aficheNombre = boton.getAttribute('data-afiche-nombre');
                    mostrarFormularioReclamo(aficheId, aficheNombre);
                });
            });
        } catch (err) {
            console.error("Error cargando eventos:", err);
            const contenedorLista = document.getElementById("contenido-afiches");
            contenedorLista.innerHTML = "<p>Error al cargar datos.</p>";
        }
    }

    function mostrarFormularioReclamo(aficheId, aficheNombre) {
        // Remover formulario existente si hay uno
        const formularioExistente = document.getElementById('formulario-reclamo');
        if (formularioExistente) {
            formularioExistente.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'formulario-reclamo';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const oscuro = esModoOscuro();
        const formulario = document.createElement('div');
        formulario.style.cssText = `
            background: ${oscuro ? '#2d2d2d' : 'white'};
            color: ${oscuro ? '#f1f1f1' : '#000'};
            padding: 20px;
            border-radius: 8px;
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        formulario.innerHTML = `
            <h3 style="margin-top: 0; color: #ff4757;">🚨 Reportar Problema</h3>
            <p><strong>Evento:</strong> ${aficheNombre}</p>
            <p><strong>ID:</strong> ${aficheId}</p>
            
            <label for="descripcion-reclamo" style="display: block; margin-bottom: 5px; font-weight: bold;">
                Describe el problema:
            </label>
            <textarea 
                id="descripcion-reclamo" 
                placeholder="Ej: Este evento ya pasó, la fecha es incorrecta, información desactualizada, etc."
                style="
                    width: 100%;
                    height: 80px;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    resize: vertical;
                    background: ${oscuro ? '#404040' : 'white'};
                    color: ${oscuro ? '#f1f1f1' : '#000'};
                    box-sizing: border-box;
                "></textarea>
            
            <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                <button 
                    id="cancelar-reclamo"
                    style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">
                    Cancelar
                </button>
                <button 
                    id="enviar-reclamo"
                    style="
                        background: #ff4757;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">
                    Enviar Reclamo
                </button>
            </div>
        `;

        overlay.appendChild(formulario);
        document.body.appendChild(overlay);

        // Event listeners
        document.getElementById('cancelar-reclamo').addEventListener('click', () => {
            overlay.remove();
        });

        document.getElementById('enviar-reclamo').addEventListener('click', () => {
            const descripcion = document.getElementById('descripcion-reclamo').value.trim();
            if (!descripcion) {
                alert('Por favor, describe el problema antes de enviar el reclamo.');
                return;
            }
            enviarReclamo(aficheId, descripcion, overlay);
        });

        // Cerrar al hacer clic en el overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    async function enviarReclamo(fotoId, descripcion, overlay) {
        try {
            const botonEnviar = document.getElementById('enviar-reclamo');
            botonEnviar.disabled = true;
            botonEnviar.textContent = 'Enviando...';

            const response = await fetch('http://localhost:5000/afichesApp/afichesApp-front/reclamos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    foto_id: parseInt(fotoId),
                    descripcion: descripcion
                })
            });

            const resultado = await response.json();

            if (response.ok) {
                alert('✅ Reclamo enviado exitosamente. Gracias por tu reporte.');
                overlay.remove();
            } else {
                throw new Error(resultado.error || 'Error al enviar el reclamo');
            }
        } catch (error) {
            console.error('Error enviando reclamo:', error);
            alert('❌ Error al enviar el reclamo. Por favor, intenta nuevamente.');

            const botonEnviar = document.getElementById('enviar-reclamo');
            if (botonEnviar) {
                botonEnviar.disabled = false;
                botonEnviar.textContent = 'Enviar Reclamo';
            }
        }
    }

    const enlaceEventos = crearItemLateral();
    enlaceEventos?.addEventListener("click", (e) => {
        e.preventDefault();
        const panel = document.getElementById("panel-fijo-afiches");
        if (panel) {
            panel.style.display = panel.style.display === "none" ? "block" : "none";
            aplicarTema(); // vuelve a aplicar si estaba oculto
        } else {
            insertarSeccionEventosFija();
        }
    });
})();