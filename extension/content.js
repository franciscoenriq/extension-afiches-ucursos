(function () {
    const urlsPermitidas = [
      "https://www.u-cursos.cl/ingenieria/2/afiches/",
      "https://www.u-cursos.cl/uchile/4/afiches/"
    ];
  
    const urlActual = window.location.href;
  
    // Verificamos si la URL actual está permitida
    if (!urlsPermitidas.includes(urlActual)) {
      return; // No hacer nada si la URL no es una de las permitidas
    }
  
    function crearBotonAfiches() {
      const boton = document.createElement("button");
      boton.textContent = "Ver afiches";
      boton.style.position = "fixed";
      boton.style.bottom = "20px";
      boton.style.right = "20px";
      boton.style.zIndex = "9999";
      boton.style.padding = "10px";
      boton.style.backgroundColor = "#0044cc";
      boton.style.color = "white";
      boton.style.border = "none";
      boton.style.borderRadius = "5px";
      boton.style.cursor = "pointer";
      document.body.appendChild(boton);
      return boton;
    }
  
    function crearPanelAfiches() {
        const panel = document.createElement("div");
        panel.id = "panel-afiches";
        panel.style.position = "fixed";
        panel.style.bottom = "60px";
        panel.style.right = "20px";
        panel.style.width = "320px";
        panel.style.maxHeight = "400px";
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
        panel.appendChild(titulo);
      
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
      
  
    async function cargarAfiches(lista) {
      try {
        const res = await fetch("http://localhost:5000/api/afiches");
        const afiches = await res.json();
  
        if (!afiches.length) {
          lista.innerHTML = "<li>No hay afiches disponibles</li>";
          return;
        }
  
        lista.innerHTML = "";
        afiches.forEach(afiche => {
            const li = document.createElement("li");
          
            const titulo = document.createElement("div");
            titulo.textContent = afiche.titulo;
            titulo.style.cursor = "pointer";
            titulo.style.color = "blue";
            titulo.style.textDecoration = "underline";
            titulo.addEventListener("click", () => {
              const url = `https://www.u-cursos.cl/ingenieria/2/afiches/o/${afiche.id}`;
              window.open(url, "_blank");
            });
          
            const btnReclamo = document.createElement("button");
            btnReclamo.textContent = "Reportar reclamo";
            btnReclamo.style.marginTop = "4px";
            btnReclamo.style.padding = "4px 8px";
            btnReclamo.style.fontSize = "12px";
            btnReclamo.style.backgroundColor = "#e74c3c";
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
            });
          
            li.appendChild(titulo);
            li.appendChild(btnReclamo);
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
  