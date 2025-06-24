(function () {
    const urlsPermitidas = [
        "https://www.u-cursos.cl/ingenieria/2/afiches/",
        "https://www.u-cursos.cl/uchile/4/afiches/"
    ];

    const urlActual = window.location.href;

    // Verificar si la URL actual empieza con cualquiera de los prefijos permitidos
    const esUrlPermitida = urlsPermitidas.some(prefix => urlActual.startsWith(prefix));

    if (!esUrlPermitida) {
        return; // No hacer nada si la URL no cumple con los prefijos permitidos
    }

    function crearBotonAfiches() {
        const boton = document.createElement("button");

        // Contenido 
        boton.textContent = "Ver Eventos";

        // Posicionamiento
        boton.style.bottom = "20px";
        boton.style.right = "20px";
        boton.style.zIndex = "9999";
        boton.style.padding = "10px";
        boton.style.position = "fixed";

        // Estilo
        boton.style.backgroundColor = "#2F8484";
        boton.style.color = "white";
        boton.style.border = "1px solid #287171";
        boton.style.borderRadius = "4px";
        boton.style.cursor = "pointer";

        // Hover (simulación de :hover)
        boton.addEventListener("mouseenter", () => {
            boton.style.backgroundColor = "#287171";
            boton.style.borderColor = "#225e5e5";
        });

        boton.addEventListener("mouseleave", () => {
            boton.style.backgroundColor = "#2F8484";
            boton.style.borderColor = "#287171";
        });
        document.body.appendChild(boton);
        return boton;
    }

    function crearPanelAfiches() {
        const panel = document.createElement("div");
        panel.id = "panel-afiches";

        // Posicionamiento
        panel.style.position = "fixed";
        panel.style.bottom = "60px";
        panel.style.right = "20px";
        panel.style.width = "320px";
        panel.style.maxHeight = "400px";

        // Estilo
        panel.style.overflowY = "auto";
        panel.style.backgroundColor = "white";
        panel.style.border = "1px solid #ccc";
        panel.style.borderRadius = "5px";
        panel.style.padding = "10px";
        panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        panel.style.zIndex = "9999";
        panel.style.display = "none";

        // Titulo
        const titulo = document.createElement("h3");
        titulo.textContent = "Próximos Eventos";
        titulo.style.fontWeight = "600";
        titulo.style.color = "#d35400";
        panel.appendChild(titulo);

        // Linea horizontal
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

        // Estilo para el scrollbar moderno (solo visible cuando hay scroll)
        lista.style.scrollbarWidth = "thin"; // Firefox
        lista.style.scrollbarColor = "#888 #f1f1f1"; // Firefox

        // Para Chrome
        lista.style.overflowY = "auto";
        lista.style.webkitOverflowScrolling = "touch"; // smooth en móvil

        panel.appendChild(lista);
        document.body.appendChild(panel);
        return panel;
    }

    // TODO: Que se ordene por id
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
                titulo.textContent = afiche.nombre;
                titulo.style.cursor = "pointer";
                titulo.style.color = "#d35400";
                titulo.style.fontWeight = "200";
                titulo.style.textDecoration = "none";
                titulo.style.transition = "color 0.2s ease";

                titulo.addEventListener("mouseenter", () => {
                    titulo.style.color = "#e67e22"; // color hover personalizado
                    // titulo.style.textDecoration = "underline"; // si quieres también subrayado
                });

                titulo.addEventListener("mouseleave", () => {
                    titulo.style.color = "#d35400";
                    // titulo.style.textDecoration = "none";
                });

                titulo.addEventListener("click", () => {
                    const url = `https://www.u-cursos.cl/ingenieria/2/afiches/o/${afiche.id}`;
                    window.open(url, "_self");
                });

                /*
                const btnReclamo = document.createElement("button");
                btnReclamo.textContent = "Reportar reclamo";
                btnReclamo.style.marginTop = "4px";
                btnReclamo.style.padding = "4px 8px";
                btnReclamo.style.fontSize = "12px";
                btnReclamo.style.backgroundColor = "rgba(235, 60, 41, 0.8)";
                btnReclamo.style.color = "white";
                btnReclamo.style.border = "none";
                btnReclamo.style.borderRadius = "3px";
                btnReclamo.style.cursor = "pointer";
                btnReclamo.addEventListener("click", () => {
                    const mensaje = prompt("Describe el error de clasificación:");
                    if (!mensaje || mensaje.trim() === "") {
                        alert("Debes ingresar una descripción para enviar el reclamo.");
                        return;
                    }

                    fetch("http://localhost:5000/reclamos", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: afiche.id,
                            mensaje: mensaje.trim()
                        })
                    })
                        .then(res => {
                            if (!res.ok) throw new Error("Error en el servidor");
                            alert("Reclamo enviado correctamente. ¡Gracias!");
                        })
                        .catch(err => {
                            console.error("Error al enviar reclamo:", err);
                            alert("Hubo un problema al enviar el reclamo.");
                        });
                });*/

                li.appendChild(titulo);
                //li.appendChild(btnReclamo);
                lista.appendChild(li);
            });

        } catch (err) {
            console.error("Error al obtener afiches:", err);
            lista.innerHTML = "<li>Error al cargar datos</li>";
        }
    }

    // Insertamos el botón y panel
    const boton = crearBotonAfiches();
    const panel = crearPanelAfiches();
    const lista = panel.querySelector("#lista-afiches");

    boton.addEventListener("click", () => {
        if (panel.style.display === "none") {
            panel.style.display = "block";
            cargarAfiches(lista);
        } else {
            panel.style.display = "none";
        }
    });
})();
