document.addEventListener('DOMContentLoaded', () => {
  const dataForm = document.getElementById('data-form');
  const itemBrandInput = document.getElementById('item-brand');
  const itemModelInput = document.getElementById('item-model');
  const itemPuntajeInput = document.getElementById('item-puntaje');
  const tableBody = document.getElementById('table-body');

  const addItemBtn = document.getElementById('add-item-btn');
  const updateItemBtn = document.getElementById('update-item-btn');
  const statusMessage = document.getElementById('status-message');
  const loadingIndicator = document.getElementById('loading-indicator');

  const confirmationModal = document.getElementById('confirmation-modal');
  const confirmDeleteBtn = confirmationModal.querySelector('.confirm-btn');
  const cancelDeleteBtn = confirmationModal.querySelector('.cancel-btn');

  let editingItemId = null;
  let itemToDeleteId = null;

  const API_BASE_URL = "https://695eb67f2556fd22f6792fbc.mockapi.io/motos";


  function showMessage(el, msg, type = "error") {
    el.textContent = msg;
    el.classList.remove("hidden", "error", "success");
    el.classList.add(type);

    setTimeout(() => el.classList.add("hidden"), 4000);
  }

  async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res;
      } catch (err) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2; // backoff
        } else {
          throw err;
        }
      }
    }
  }

  function setEditingItem(id) {
    editingItemId = id;
    addItemBtn.style.display = "none";
    updateItemBtn.style.display = "inline-block";
  }

  function resetEditingItem() {
    editingItemId = null;
    addItemBtn.style.display = "inline-block";
    updateItemBtn.style.display = "none";
  }

  function renderTable(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
      const row = document.createElement("tr");
      const empty = document.createElement("td");
      empty.setAttribute("colspan", 5);
      empty.classList.add("empty");
      empty.textContent = "No hay elementos para mostrar.";
      row.appendChild(empty);
      tableBody.appendChild(row);
      return;
    }

    data.forEach(item => {
      const row = document.createElement("tr");

      ["id", "brand", "model", "puntaje"].forEach(attr => {
        const td = document.createElement("td");
        td.textContent = item[attr];
        row.appendChild(td);
      });

 
      const actions = document.createElement("td");
      actions.classList.add("table-actions");

   
      const edit = document.createElement("button");
      edit.classList.add("edit-btn");
      edit.textContent = "Editar";
      edit.addEventListener("click", () => {
        setEditingItem(item.id);
        itemBrandInput.value = item.brand;
        itemModelInput.value = item.model;
        itemPuntajeInput.value = item.puntaje;
      });
      actions.appendChild(edit);

 
      const del = document.createElement("button");
      del.classList.add("delete-btn");
      del.textContent = "Eliminar";
      del.addEventListener("click", () => {
        itemToDeleteId = item.id;
        confirmationModal.style.display = "flex";
      });
      actions.appendChild(del);

      row.appendChild(actions);
      tableBody.appendChild(row);
    });
  }

 
  async function loadData() {
    loadingIndicator.classList.remove("hidden");

    try {
      const res = await fetchWithRetry(API_BASE_URL);
      const data = await res.json();
      renderTable(data);
    } catch (err) {
      showMessage(statusMessage, "Error al cargar datos: " + err.message);
    } finally {
      loadingIndicator.classList.add("hidden");
    }
  }


  dataForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const brand = itemBrandInput.value.trim();
    const model = itemModelInput.value.trim();
    const puntaje = parseInt(itemPuntajeInput.value);

    if (!brand || !model || isNaN(puntaje)) {
      showMessage(statusMessage, "Complete todos los campos.", "error");
      return;
    }

    const newItem = { brand, model, puntaje };

    loadingIndicator.classList.remove("hidden");

    try {
      let res;

      if (editingItemId) {
        // PUT
        res = await fetchWithRetry(`${API_BASE_URL}/${editingItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem)
        });
        showMessage(statusMessage, "Moto actualizada.", "success");

      } else {
        // POST
        res = await fetchWithRetry(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem)
        });
        showMessage(statusMessage, "Moto agregada.", "success");
      }

      await res.json();
      dataForm.reset();
      resetEditingItem();
      loadData();

    } catch (err) {
      showMessage(statusMessage, "Error: " + err.message);
    } finally {
      loadingIndicator.classList.add("hidden");
    }
  });

  dataForm.addEventListener("reset", resetEditingItem);

  confirmDeleteBtn.addEventListener("click", async () => {
    confirmationModal.style.display = "none";

    if (!itemToDeleteId) return;

    loadingIndicator.classList.remove("hidden");

    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/${itemToDeleteId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("No se pudo eliminar");

      showMessage(statusMessage, "Moto eliminada.", "success");
      loadData();

    } catch (err) {
      showMessage(statusMessage, "Error: " + err.message);
    } finally {
      loadingIndicator.classList.add("hidden");
      itemToDeleteId = null;
    }
  });

  cancelDeleteBtn.addEventListener("click", () => {
    confirmationModal.style.display = "none";
    itemToDeleteId = null;
  });

  loadData();
});
