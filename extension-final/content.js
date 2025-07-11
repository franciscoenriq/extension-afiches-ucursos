(function () {
    const urlActual = window.location.href;

    const esPaginaCanales = urlActual.includes("/mis_canales/");

    if (!esPaginaCanales) {
        return; // Solo ejecutar en la sección de "mis canales"
    }

    function crearItemLateral() {
        const ulModulos = document.querySelector("ul.modulos");
        if (!ulModulos) return;
    
        const li = document.createElement("li");
        li.className = "servicio";
        li.style.marginTop = "-19px"; 
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
        img.style.width = "55px";
        img.style.height = "55px";
    
        const span = document.createElement("span");
        span.textContent = "Eventos";
        span.style.marginTop = "0px";
        span.style.fontSize = "12px";
    
        a.appendChild(img);
        a.appendChild(span);
        li.appendChild(a);
        ulModulos.appendChild(li);
    
        return a;
    }
    

    // Reutiliza tu código original para el panel y su lógica:
    function crearPanelAfiches() {
        const panel = document.createElement("div");
        panel.id = "panel-afiches";

        panel.style.position = "fixed";
        panel.style.bottom = "70px";
        panel.style.right = "20px";
        panel.style.width = "320px";
        panel.style.maxHeight = "400px";
        panel.style.overflow = "hidden";
        panel.style.transform = "scale(0.8) translate(20px, 20px)";
        panel.style.opacity = "0";
        panel.style.transition = "transform 0.4s ease, opacity 0.4s ease";
        panel.style.overflowY = "auto";
        panel.style.backgroundColor = "white";
        panel.style.border = "1px solid #ccc";
        panel.style.borderRadius = "5px";
        panel.style.padding = "10px";
        panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        panel.style.zIndex = "9999";
        panel.style.display = "none";

        const titulo = document.createElement("h3");
        titulo.textContent = "Próximos Eventos";
        titulo.style.fontWeight = "600";
        titulo.style.color = "#d35400";
        panel.appendChild(titulo);

        const horizontalLine = document.createElement("hr");
        panel.appendChild(horizontalLine);

        const lista = document.createElement("ul");
        lista.id = "lista-afiches";
        lista.innerHTML = "<li>Cargando...</li>";
        lista.style.listStyle = "none";
        lista.style.padding = "0";
        lista.style.margin = "0";
        lista.style.maxHeight = "300px";
        lista.style.overflowY = "auto";

        panel.appendChild(lista);
        document.body.appendChild(panel);
        return panel;
    }

    function decodeHtmlEntities(str) {
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    }

    async function cargarAfiches(lista) {
        try {
            const res = await fetch("https://grupo6.juan.cl/afichesApp/afichesApp-front/api/afiches");
            const afiches = await res.json();

            if (!afiches.length) {
                lista.innerHTML = "<li>No hay afiches disponibles</li>";
                return;
            }

            lista.innerHTML = "";
            afiches.forEach(afiche => {
                const li = document.createElement("li");
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.alignItems = "center";
                li.style.marginBottom = "8px";
                li.style.gap = "10px";

                const titulo = document.createElement("span");
                titulo.textContent = decodeHtmlEntities(afiche.nombre);
                titulo.style.cursor = "pointer";
                titulo.style.color = "#d35400";
                titulo.style.fontWeight = "200";

                titulo.addEventListener("mouseenter", () => {
                    titulo.style.color = "#e67e22";
                });
                titulo.addEventListener("mouseleave", () => {
                    titulo.style.color = "#d35400";
                });
                titulo.addEventListener("click", () => {
                    const url = `https://www.u-cursos.cl/ingenieria/2/afiches/o/${afiche.id}`;
                    window.open(url, "_self");
                });

                li.appendChild(titulo);
                lista.appendChild(li);
            });

        } catch (err) {
            console.error("Error al obtener afiches:", err);
            lista.innerHTML = "<li>Error al cargar datos</li>";
        }
    }

    const enlaceEventos = crearItemLateral();
    const panel = crearPanelAfiches();
    const lista = panel.querySelector("#lista-afiches");

    let panelAbierto = false;

    enlaceEventos.addEventListener("click", (e) => {
        e.preventDefault();

        if (!panelAbierto) {
            cargarAfiches(lista);
            panel.style.display = "block";
            requestAnimationFrame(() => {
                panel.style.transform = "scale(1) translate(0, 0)";
                panel.style.opacity = "1";
            });
        } else {
            panel.style.transform = "scale(0.8) translate(20px, 20px)";
            panel.style.opacity = "0";
            setTimeout(() => {
                if (!panelAbierto) {
                    panel.style.display = "none";
                }
            }, 400);
        }

        panelAbierto = !panelAbierto;
    });
})();
