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
            const res = await fetch("https://grupo6.juan.cl/afichesApp/afichesApp-front/api/afiches");
            const afiches = await res.json();

            const lista = document.createElement("ul");
            lista.style.listStyle = "none";
            lista.style.padding = "0";
            lista.style.margin = "0";

            afiches.forEach(afiche => {
                const item = document.createElement("li");
                item.style.marginBottom = "12px";
                item.style.borderBottom = "1px solid #444";
                item.style.paddingBottom = "8px";

                const nombre = afiche.nombre || "Evento sin título";
                const url = `https://www.u-cursos.cl/ingenieria/2/afiches/detalle?id=${afiche.id}`;

                const aColor = esModoOscuro() ? "#4EA6EA" : "#007bff";

                item.innerHTML = `
                    <p style="margin:0;">
                        <strong>📌 ${nombre}</strong><br>
                        <a href="${url}" target="_blank" style="color:${aColor};">
                            Ver afiche →
                        </a>
                    </p>
                `;
                lista.appendChild(item);
            });

            const contenedorLista = document.getElementById("contenido-afiches");
            contenedorLista.innerHTML = "";
            contenedorLista.appendChild(lista);
        } catch (err) {
            console.error("Error cargando eventos:", err);
            const contenedorLista = document.getElementById("contenido-afiches");
            contenedorLista.innerHTML = "<p>Error al cargar datos.</p>";
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