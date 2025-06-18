document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("lista-afiches");
    lista.innerHTML = "<li>Cargando...</li>";
  
    try {
      const res = await fetch("http://localhost:5000/api/afiches");
      const afiches = await res.json(); // Esperas [{ id, titulo }, ...]
  
      if (!afiches.length) {
        lista.innerHTML = "<li>No hay afiches disponibles</li>";
        return;
      }
  
      lista.innerHTML = "";
      afiches.forEach(afiche => {
        const li = document.createElement("li");
        li.textContent = afiche.titulo;
        li.addEventListener("click", () => {
          const url = `https://www.u-cursos.cl/ingenieria/2/afiches/o/${afiche.id}`;
          chrome.tabs.create({ url }); // abre en nueva pestaña
        });
        lista.appendChild(li);
      });
  
    } catch (err) {
      console.error("Error al obtener afiches:", err);
      lista.innerHTML = "<li>Error al cargar datos</li>";
    }
  });
  