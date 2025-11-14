document.addEventListener('DOMContentLoaded', () => {
  const dataForm = document.getElementById('data-form');
  const itemBrandInput = document.getElementById('item-brand');
  const itemModelInput = document.getElementById('item-model');
  const itemPuntajeInput = document.getElementById('item-puntaje'); // ⭐ NUEVO
  const tableBody = document.getElementById('table-body');
  const addItemBtn = document.getElementById('add-item-btn');
  const updateItemBtn = document.getElementById('update-item-btn');
  const statusMessage = document.getElementById('status-message');

  const confirmationModal = document.getElementById('confirmation-modal');
  const confirmDeleteBtn = confirmationModal.querySelector('.confirm-btn');
  const cancelDeleteBtn = confirmationModal.querySelector('.cancel-btn');
  let itemToDeleteId = null;

  let editingItemId = null;

  const items = [];

  function showMessage(element, message, type = 'error') {
    element.textContent = message;
    element.classList.remove('hidden', 'error', 'success');
    element.classList.add(type);
    setTimeout(() => {
      element.classList.add('hidden');
    }, 5000);
  }

  function setEditingItem(id) {
    itemToDeleteId = null;
    editingItemId = id;
    addItemBtn.style.display = 'none';
    updateItemBtn.style.display = 'inline-block';
  }

  function resetEditingItem() {
    editingItemId = null;
    addItemBtn.style.display = 'inline-block';
    updateItemBtn.style.display = 'none';
  }

  function renderTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      const empty = document.createElement('td');
      empty.setAttribute('colspan', 5);
      empty.classList.add('empty');
      empty.textContent = 'No hay elementos para mostrar.';
      row.appendChild(empty);
      tableBody.appendChild(row);
      return;
    }

    data.forEach((item, index) => {
      const row = document.createElement('tr');
      item.id = index + 1;

      // ⭐ AGREGADO PUNTAJE A LA TABLA
      ['id', 'brand', 'model', 'puntaje'].forEach(attr => {
        const td = document.createElement('td');
        td.textContent = item[attr];
        row.appendChild(td);
      });

      const actions = document.createElement('td');
      actions.classList.add('table-actions');

      const edit = document.createElement('button');
      edit.classList.add('edit-btn');
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => {
        setEditingItem(item.id);
        itemBrandInput.value = item.brand;
        itemModelInput.value = item.model;
        itemPuntajeInput.value = item.puntaje; // ⭐ NUEVO
      });
      actions.appendChild(edit);

      const del = document.createElement('button');
      del.classList.add('delete-btn');
      del.textContent = 'Eliminar';
      del.addEventListener('click', () => {
        itemToDeleteId = item.id;
        resetEditingItem();
        dataForm.reset();
        confirmationModal.style.display = 'flex';
      });

      actions.appendChild(del);
      row.appendChild(actions);
      tableBody.appendChild(row);
    });
  }

  function loadData() {
    renderTable(items);
  }

  dataForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const brand = itemBrandInput.value.trim();
    const model = itemModelInput.value.trim();
    const puntaje = parseInt(itemPuntajeInput.value.trim()); // ⭐ NUEVO

    // ⭐ VALIDACIÓN
    if (!brand || !model || isNaN(puntaje)) {
      showMessage(statusMessage, 'Complete todos los campos correctamente.', 'error');
      return;
    }

    // ⭐ AGREGAMOS PUNTAJE A LOS DATOS
    const itemData = { brand, model, puntaje };

    if (editingItemId) {
      items[editingItemId - 1] = itemData;
      showMessage(statusMessage, 'Elemento actualizado con éxito.', 'success');
    } else {
      items.push(itemData);
      showMessage(statusMessage, 'Elemento agregado con éxito.', 'success');
    }

    resetEditingItem();
    dataForm.reset();
    loadData();
  });

  dataForm.addEventListener('reset', resetEditingItem);

  confirmDeleteBtn.addEventListener('click', () => {
    confirmationModal.style.display = 'none';

    if (itemToDeleteId) {
      items.splice(itemToDeleteId - 1, 1);
      showMessage(statusMessage, 'Elemento eliminado con éxito.', 'success');
      loadData();
      itemToDeleteId = null;
    }
  });

  cancelDeleteBtn.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
    itemToDeleteId = null;
  });

  loadData();
});
