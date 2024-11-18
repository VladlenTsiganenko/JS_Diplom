// Функция для загрузки списка клиентов с сервера
async function loadClients() {
  try {
    const response = await fetch("http://localhost:3000/api/clients");
    if (!response.ok) {
      throw new Error("Ошибка загрузки клиентов");
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка:", error);
    throw error; // Добавлено повторное выбрасывание ошибки
  }
}

// Форматирование даты и времени
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) {
    return "";
  }
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, ".");
  const formattedTime = date.toTimeString().slice(0, 5);
  return `<span style="color: black;">${formattedDate}</span> <span style="color: #B0B0B0;">${formattedTime}</span>`;
}

// Обработчик события нажатия кнопки "Сохранить" в модальном окне редактирования
document
  .getElementById("saveEditBtn")
  .addEventListener("click", async function () {
    const clientIdSpan = document.getElementById("edit-id-span").textContent;
    const clientId = clientIdSpan.replace("ID: ", "").trim();
    const editLastNameInput = document
      .getElementById("editLastName")
      .value.trim();
    const editFirstNameInput = document
      .getElementById("editFirstName")
      .value.trim();
    const editMiddleNameInput = document
      .getElementById("editMiddleName")
      .value.trim();

    const contacts = [];

    document
      .querySelectorAll("#contactEditList .contact-input-wrapper")
      .forEach((wrapper) => {
        const dropdown = wrapper.querySelector(".contact-dropdown");
        const input = wrapper.querySelector(".contact-input");
        const contactType = dropdown.value;
        const contactValue = input.value.trim();
        if (contactValue !== "") {
          contacts.push({ type: contactType, value: contactValue });
        }
      });

    const updatedData = {
      surname: editLastNameInput,
      name: editFirstNameInput,
      lastName: editMiddleNameInput,
      contacts: contacts,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/api/clients/${clientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка обновления клиента");
      }

      const updatedClient = await response.json();
      console.log("Обновленный клиент:", updatedClient);

      const row = document.querySelector(`tr[data-client-id="${clientId}"]`);
      if (row) {
        row.querySelector(
          "#data-client-id"
        ).textContent = `${updatedClient.surname} ${updatedClient.name} ${updatedClient.lastName}`;
        row.querySelector(".contact-icons-td").innerHTML = renderContactIcons(
          updatedClient.contacts
        );
        row.querySelector(".date-created-td").textContent = formatDateTime(
          updatedClient.createdAt
        );
        row.querySelector(".date-updated-td").textContent = formatDateTime(
          updatedClient.updatedAt
        );
      }

      closeModal(document.getElementById("editCustomerModal"));
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });

// центрирование модалок
function centerModal() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    const modalWidth = modal.offsetWidth;
    const windowWidth = window.innerWidth;
    const leftOffset = (windowWidth - modalWidth) / 2;
    modal.style.left = `${leftOffset}px`;
  });
}

// Вызов функции при загрузке страницы
window.addEventListener("load", () => {
  centerModal();
  addEventListenersToNames();
});

// Вызов функции при изменении размера окна
window.addEventListener("resize", centerModal);

// Функция для открытия модального окна
function openModal(modal) {
  modal.style.display = "block";
  document.body.classList.add("modal-open");
  document.getElementById("overlay").style.display = "block";
  centerModal(); // Центрируем модальное окно при его открытии
}

// Функция для закрытия модального окна
function closeModal(modal) {
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
  document.getElementById("overlay").style.display = "none";
}

// Добавление обработчика события keydown для закрытия модального окна при нажатии Escape
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const openModals = document.querySelectorAll(".modal");
    openModals.forEach((modal) => {
      if (modal.style.display === "block") {
        closeModal(modal);
      }
    });
  }
});

// Функция для очистки полей ввода
function clearInputFields() {
  document.getElementById("lastName").value = "";
  document.getElementById("firstName").value = "";
  document.getElementById("middleName").value = "";
}

// Функция для очистки формы контактов
function clearContactForm() {
  const contactForm = document.getElementById("contactList");
  const contactInputWrappers = contactForm.querySelectorAll(
    ".contact-input-wrapper"
  );
  contactInputWrappers.forEach((wrapper) => wrapper.remove());

  const addContactBtn = document.getElementById("addContactBtn");
  addContactBtn.style.display = "block";
}

// Функция для очистки формы контактов редактирования
function clearEditContactForm() {
  const contactEditList = document.getElementById("contactEditList");
  const contactInputWrappers = contactEditList.querySelectorAll(
    ".contact-input-wrapper"
  );
  contactInputWrappers.forEach((wrapper) => wrapper.remove());

  const addContactBtnEdit = document.getElementById("addContactBtnEdit");
  addContactBtnEdit.style.display = "block";
}

// Проверка контактов на наличие ошибок
function validateAllContacts(selector) {
  const contactWrappers = document.querySelectorAll(
    `${selector} .contact-input-wrapper`
  );
  let allValid = true;
  contactWrappers.forEach((wrapper) => {
    const dropdown = wrapper.querySelector(".contact-dropdown");
    const input = wrapper.querySelector(".contact-input");
    const contactType = dropdown.value;
    const isValid = validateContactInput(
      { target: input },
      wrapper,
      contactType
    );
    if (!isValid) {
      allValid = false;
    }
  });
  return allValid;
}

// Функция для создания клиента на сервере
async function createClientOnServer(clientData) {
  if (!validateAllContacts("#contactList")) {
    console.error("Ошибка контакта");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      throw new Error("Ошибка при создании клиента");
    }

    const createdClient = await response.json();
    console.log("Созданный клиент:", createdClient);

    // Добавить нового клиента в массив клиентов
    clients.push(createdClient);

    // Обновить таблицу
    addClientToTable(createdClient);

    closeModal(document.getElementById("addCustomerForm"));
    clearInputFields();
    clearContactForm();
  } catch (error) {
    console.error("Ошибка при создании клиента:", error.message);
  }
}

// Функция для обновления клиента на сервере
async function updateClientOnServer(clientId, clientData) {
  if (!validateAllContacts("#contactEditList")) {
    console.error("Ошибка контакта");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/clients/${clientId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка обновления клиента");
    }

    const updatedClient = await response.json();
    console.log("Обновленный клиент:", updatedClient);

    const clientIndex = clients.findIndex((client) => client.id === clientId);
    if (clientIndex !== -1) {
      clients[clientIndex] = { ...clients[clientIndex], ...updatedClient };
    }

    const row = document.querySelector(`tr[data-client-id="${clientId}"]`);
    if (row) {
      row.querySelector(
        "#data-client-id"
      ).textContent = `${updatedClient.surname} ${updatedClient.name} ${updatedClient.lastName}`;
      row.querySelector(".contact-icons-td").innerHTML = renderContactIcons(
        updatedClient.contacts
      );
      row.querySelector(".date-created-td").innerHTML = formatDateTime(
        updatedClient.createdAt
      );
      row.querySelector(".date-updated-td").innerHTML = formatDateTime(
        updatedClient.updatedAt
      );
    }

    closeModal(document.getElementById("editCustomerModal"));
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

// Обработчик события нажатия кнопки "Сохранить" в модальном окне создания клиента
document.getElementById("saveBtn").addEventListener("click", async (event) => {
  event.preventDefault();

  const saveClientHandler = async () => {
    const isFormValid = validateForm();
    const areContactsValid = validateAllContacts("#contactList");

    // Удаление существующего обработчика, если он есть
    document
      .getElementById("saveBtn")
      .removeEventListener("click", saveClientHandler);

    if (!isFormValid) {
      console.error("Пожалуйста, исправьте ошибки в форме");
    } else if (!areContactsValid) {
      console.error("Ошибка контакта. Проверьте все контактные данные.");
    } else {
      const firstName = document.getElementById("firstName").value;
      const middleName = document.getElementById("middleName").value;
      const lastName = document.getElementById("lastName").value;

      const contacts = [];
      document
        .querySelectorAll("#contactList .contact-input-wrapper")
        .forEach((wrapper) => {
          const dropdown = wrapper.querySelector(".contact-dropdown");
          const input = wrapper.querySelector(".contact-input");
          const contactType = dropdown.value;
          const contactValue = input.value.trim();
          if (contactValue !== "") {
            contacts.push({ type: contactType, value: contactValue });
          }
        });

      const clientData = {
        name: firstName,
        surname: lastName,
        lastName: middleName,
        contacts: contacts,
      };

      await createClientOnServer(clientData);
    }
  };

  // Добавление нового обработчика
  document
    .getElementById("saveBtn")
    .addEventListener("click", saveClientHandler);
});

document
  .getElementById("saveEditBtn")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const isFormValid = validateEditForm();
    const areContactsValid = validateAllContacts("#contactEditList");

    if (!isFormValid) {
      console.error("Пожалуйста, исправьте ошибки в форме");
    } else if (!areContactsValid) {
      console.error("Ошибка контакта. Проверьте все контактные данные.");
    } else {
      const editIdSpan = document.getElementById("edit-id-span").textContent;
      const clientId = editIdSpan.replace("ID: ", "").trim();
      const editLastNameInput = document.getElementById("editLastName").value;
      const editFirstNameInput = document.getElementById("editFirstName").value;
      const editMiddleNameInput =
        document.getElementById("editMiddleName").value;

      const contacts = [];
      document
        .querySelectorAll("#contactEditList .contact-input-wrapper")
        .forEach((wrapper) => {
          const dropdown = wrapper.querySelector(".contact-dropdown");
          const input = wrapper.querySelector(".contact-input");
          const contactType = dropdown.value;
          const contactValue = input.value.trim();
          if (contactValue !== "") {
            contacts.push({ type: contactType, value: contactValue });
          }
        });

      const clientData = {
        name: editFirstNameInput,
        surname: editLastNameInput,
        lastName: editMiddleNameInput,
        contacts: contacts,
      };

      await updateClientOnServer(clientId, clientData);
    }
  });

// Добавление клиента в таблицу
function addClientToTable(client) {
  const tableBody = document
    .getElementById("customersTable")
    .querySelector("tbody");
  const row = document.createElement("tr");
  row.dataset.clientId = client.id;
  row.innerHTML = `
    <td class="td ID-td">${client.id}</td>
    <td class="td" id="data-client-id">${client.surname} ${client.name} ${
    client.lastName
  }</td>
    <td class="td date-created-td">${formatDateTime(client.createdAt)}</td>
    <td class="td date-updated-td">${formatDateTime(client.updatedAt)}</td>
    <td class="td contact-icons-td">${renderContactIcons(client.contacts)}</td>
    <td class="btn-td">
      <button id="btnLightEdit" type="button" class="btn btn-light btn-light-edit" data-client-id="${
        client.id
      }">Изменить</button>
      <button id="btnLightDelete" type="button" class="btn btn-light btn-light-delete" data-client-id="${
        client.id
      }">Удалить</button>
    </td>
  `;

  tableBody.appendChild(row);
}

// Отображение иконок контактов
function renderContactIcons(contacts) {
  let iconsHTML = "";
  const maxVisibleIcons = 4;
  contacts.forEach((contact, index) => {
    if (index < maxVisibleIcons) {
      iconsHTML += `<img src="${getIconURL(contact.type)}" alt="${
        contact.type
      }" title="${contact.type}: ${contact.value}">`;
    }
  });
  if (contacts.length > maxVisibleIcons) {
    iconsHTML += `<span class="contact-more" data-contact-index="${maxVisibleIcons}" style="cursor: pointer;">+${
      contacts.length - maxVisibleIcons
    }</span>`;
  }
  return iconsHTML;
}

// Функция для получения URL-адреса иконки на основе типа контакта
function getIconURL(contactType) {
  switch (contactType.toLowerCase()) {
    case "телефон":
      return "images/phone.svg";
    case "доп. телефон":
      return "images/phone.svg";
    case "email":
      return "images/mail.svg";
    case "vk":
      return "images/vk.svg";
    case "facebook":
      return "images/fb.svg";
    default:
      return "images/contact_default.svg";
  }
}

// Валидация ввода контакта
function validateContactInput(event, wrapper, type) {
  const input = event.target;
  const value = input.value.trim();
  const maxLength =
    type === "email" ? 31 : type === "vk" || type === "facebook" ? 31 : 12;
  let errorMessage = "";

  if (type === "телефон" || type === "доп. телефон") {
    const validChars = /^[\d+]*$/;
    if (!validChars.test(value)) {
      errorMessage = "Ошибка ввода";
      input.value = value.replace(/[^\d+]/g, ""); // Удаление недопустимых символов
    } else if (value.length > maxLength) {
      errorMessage = "Превышение";
    }
  } else if (type === "email") {
    if (value.length > maxLength) {
      errorMessage = "Превышение";
    } else if (!value.includes("@")) {
      errorMessage = "Необходимо наличие '@'";
    }
  } else if (type === "vk" || type === "facebook") {
    if (value.length > maxLength) {
      errorMessage = "Превышение";
    }
  }

  let errorDiv = wrapper.querySelector(".error-message");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "red";
    errorDiv.style.display = "none";
    wrapper.appendChild(errorDiv);
  }

  if (errorMessage) {
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = "block";
    return false;
  } else {
    errorDiv.style.display = "none";
    return true;
  }
}

// Обработчик для предотвращения ввода букв в поля "Телефон" и "Доп. телефон"
function restrictInput(event) {
  const input = event.target;
  const value = input.value;
  const wrapper = input.closest(".contact-input-wrapper");
  const dropdown = wrapper.querySelector(".contact-dropdown");
  const type = dropdown.value;
  if (type === "телефон" || type === "доп. телефон") {
    const charCode = event.charCode || event.keyCode;
    if (charCode && (charCode < 48 || charCode > 57) && charCode !== 43) {
      event.preventDefault();
    }
  }
}

// Добавление обработчиков к существующим полям контактов
function addEventListenersToContacts(selector) {
  document.querySelectorAll(`${selector} .contact-input`).forEach((input) => {
    const wrapper = input.closest(".contact-input-wrapper");
    const dropdown = wrapper.querySelector(".contact-dropdown");
    const type = dropdown.value;

    input.addEventListener("input", (event) =>
      validateContactInput(event, wrapper, type)
    );
    input.addEventListener("keypress", restrictInput);
  });
}

// Функция для ограничения ввода символов только буквами
function restrictInputToLetters(event) {
  const charCode = event.charCode || event.keyCode;
  const regex = /^[a-zA-Zа-яА-ЯёЁ]$/;
  if (!regex.test(String.fromCharCode(charCode))) {
    event.preventDefault();
  }
}

// Добавление обработчиков к полям ввода имен
function addEventListenersToNames() {
  document.querySelectorAll(".modal__inp").forEach((input) => {
    const id = input.id;
    if (
      id === "lastName" ||
      id === "firstName" ||
      id === "middleName" ||
      id === "editLastName" ||
      id === "editFirstName" ||
      id === "editMiddleName"
    ) {
      input.addEventListener("keypress", restrictInputToLetters);
    }
  });
}

// Создание нового поля ввода контакта
function createNewInput(selector) {
  const maxInputs = 10;
  const currentInputs = document.querySelectorAll(
    `${selector} .contact-input-wrapper`
  ).length;

  if (currentInputs < maxInputs) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("contact-input-wrapper");

    const dropdown = document.createElement("select");
    dropdown.classList.add("contact-dropdown");
    ["Телефон", "Доп. телефон", "Email", "VK", "Facebook"].forEach((option) => {
      const dropdownOption = document.createElement("option");
      dropdownOption.value = option.toLowerCase();
      dropdownOption.textContent = option;
      dropdown.appendChild(dropdownOption);
    });

    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add("input-wrapper-with-delete");

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("contact-input");
    input.placeholder = "Введите контакт";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-contact-btn");
    deleteButton.innerHTML = "&times;";
    deleteButton.style.display = "none";
    input.addEventListener("input", function () {
      deleteButton.style.display =
        input.value.trim() !== "" ? "inline-block" : "none";
    });
    deleteButton.addEventListener("click", function () {
      wrapper.remove();
      if (
        document.querySelectorAll(`${selector} .contact-input-wrapper`).length <
        maxInputs
      ) {
        document.getElementById(
          selector === "#contactList" ? "addContactBtn" : "addContactBtnEdit"
        ).style.display = "block";
      }
    });

    input.addEventListener("input", (event) =>
      validateContactInput(event, inputWrapper, dropdown.value)
    );

    // Добавление обработчика для предотвращения ввода букв
    input.addEventListener("keypress", restrictInput);

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(deleteButton);

    wrapper.appendChild(dropdown);
    wrapper.appendChild(inputWrapper);
    document.querySelector(selector).appendChild(wrapper);

    if (
      document.querySelectorAll(`${selector} .contact-input-wrapper`).length >=
      maxInputs
    ) {
      document.getElementById(
        selector === "#contactList" ? "addContactBtn" : "addContactBtnEdit"
      ).style.display = "none";
    }
  }
}

// Открытие модального окна редактирования клиента
function openEditModal(client) {
  const editModal = document.getElementById("editCustomerModal");
  const editIdSpan = document.getElementById("edit-id-span");
  const editLastNameInput = document.getElementById("editLastName");
  const editFirstNameInput = document.getElementById("editFirstName");
  const editMiddleNameInput = document.getElementById("editMiddleName");
  const contactEditList = document.getElementById("contactEditList");

  editIdSpan.textContent = `ID: ${client.id}`;
  editLastNameInput.value = client.surname;
  editFirstNameInput.value = client.name;
  editMiddleNameInput.value = client.lastName;

  clearEditContactForm();
  client.contacts.forEach((contact) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("contact-input-wrapper");

    const dropdown = document.createElement("select");
    dropdown.classList.add("contact-dropdown");
    ["Телефон", "Доп. телефон", "Email", "VK", "Facebook"].forEach((option) => {
      const dropdownOption = document.createElement("option");
      dropdownOption.value = option.toLowerCase();
      dropdownOption.textContent = option;
      dropdown.appendChild(dropdownOption);
    });
    dropdown.value = contact.type.toLowerCase();

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("contact-input");
    input.value = contact.value;

    input.addEventListener("input", (event) =>
      validateContactInput(event, wrapper, dropdown.value)
    );

    // Добавление обработчика для предотвращения ввода букв
    input.addEventListener("keypress", restrictInput);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-contact-btn");
    deleteButton.innerHTML = "&times;";
    deleteButton.addEventListener("click", function () {
      wrapper.remove();
      if (
        contactEditList.querySelectorAll(".contact-input-wrapper").length < 10
      ) {
        document.getElementById("addContactBtnEdit").style.display = "block";
      }
    });

    wrapper.appendChild(dropdown);
    wrapper.appendChild(input);
    wrapper.appendChild(deleteButton);
    contactEditList.appendChild(wrapper);
  });

  openModal(editModal);

  // Добавление обработчиков к существующим контактам
  addEventListenersToContacts("#contactEditList");
}

// Функция для удаления клиента на сервере
async function deleteClientOnServer(clientId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/clients/${clientId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка удаления клиента");
    }

    return true;
  } catch (error) {
    console.error("Ошибка при удалении клиента:", error);
    return false;
  }
}

// Функция для отображения списка клиентов в таблице
function displayClients(clients) {
  const tableBody = document
    .getElementById("customersTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";

  clients.forEach((client) => {
    addClientToTable(client);
  });
}

// Функция для сортировки клиентов
function sortClients(clients, key, ascending) {
  return clients.sort((a, b) => {
    if (key === "id") {
      return ascending ? a.id - b.id : b.id - a.id;
    } else if (key === "surname") {
      return ascending
        ? a.surname.localeCompare(b.surname)
        : b.surname.localeCompare(a.surname);
    } else {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);
      return ascending ? dateA - dateB : dateB - dateA;
    }
  });
}

// Валидация
function validateInput(input, errorMessageId) {
  const value = input.value.trim();
  const maxLength = 20;
  const regex = /^[a-zA-Zа-яА-ЯёЁ]+$/;
  const errorMessageElement = document.getElementById(errorMessageId);

  if (value.length > maxLength) {
    input.value = value.slice(0, maxLength); // Обрезать до допустимой длины
    errorMessageElement.textContent = "Недопустимое количество символов";
    errorMessageElement.style.display = "block";
    return false;
  } else if (!regex.test(value)) {
    errorMessageElement.textContent = "Недопустимый формат символов";
    errorMessageElement.style.display = "block";
    return false;
  } else {
    errorMessageElement.style.display = "none";
    return true;
  }
}

document.getElementById("lastName").addEventListener("input", function () {
  validateInput(this, "lastNameError");
});
document.getElementById("firstName").addEventListener("input", function () {
  validateInput(this, "firstNameError");
});
document.getElementById("middleName").addEventListener("input", function () {
  validateInput(this, "middleNameError");
});

document
  .getElementById("lastName")
  .addEventListener("keypress", restrictInputToLetters);
document
  .getElementById("firstName")
  .addEventListener("keypress", restrictInputToLetters);
document
  .getElementById("middleName")
  .addEventListener("keypress", restrictInputToLetters);

document.getElementById("editLastName").addEventListener("input", function () {
  validateInput(this, "editLastNameError");
});
document.getElementById("editFirstName").addEventListener("input", function () {
  validateInput(this, "editFirstNameError");
});
document
  .getElementById("editMiddleName")
  .addEventListener("input", function () {
    validateInput(this, "editMiddleNameError");
  });

document
  .getElementById("editLastName")
  .addEventListener("keypress", restrictInputToLetters);
document
  .getElementById("editFirstName")
  .addEventListener("keypress", restrictInputToLetters);
document
  .getElementById("editMiddleName")
  .addEventListener("keypress", restrictInputToLetters);

// Валидация формы добавления клиента
function validateForm() {
  const lastNameValid = validateInput(
    document.getElementById("lastName"),
    "lastNameError"
  );
  const firstNameValid = validateInput(
    document.getElementById("firstName"),
    "firstNameError"
  );
  const middleNameValid = validateInput(
    document.getElementById("middleName"),
    "middleNameError"
  );

  return lastNameValid && firstNameValid && middleNameValid;
}

// Валидация формы редактирования клиента
function validateEditForm() {
  const editLastNameValid = validateInput(
    document.getElementById("editLastName"),
    "editLastNameError"
  );
  const editFirstNameValid = validateInput(
    document.getElementById("editFirstName"),
    "editFirstNameError"
  );
  const editMiddleNameValid = validateInput(
    document.getElementById("editMiddleName"),
    "editMiddleNameError"
  );

  return editLastNameValid && editFirstNameValid && editMiddleNameValid;
}

document.getElementById("saveBtn").addEventListener("click", function (event) {
  if (!validateForm()) {
    event.preventDefault();
    console.error("Пожалуйста, исправьте ошибки в форме");
  }
});

document
  .getElementById("saveEditBtn")
  .addEventListener("click", function (event) {
    if (!validateEditForm()) {
      event.preventDefault();
      console.error("Пожалуйста, исправьте ошибки в форме");
    }
  });

document
  .getElementById("saveEditBtn")
  .addEventListener("click", function (event) {
    if (!validateEditForm()) {
      event.preventDefault();
      console.error("Пожалуйста, исправьте ошибки в форме");
    }
  });

let clients = [];

// Обновление иконок заголовков таблицы
function updateHeaderIcons(header, order) {
  const iconUp = "../images/arrow_up.svg";
  const iconDown = "../images/arrow_down.svg";
  const iconAtoZ = "../images/arrow_A-Я.svg";
  const iconZtoA = "../images/arrow_up_A-R.svg";

  if (header.classList.contains("table-head-ID")) {
    header.style.backgroundImage = `url(${
      order === "asc" ? iconUp : iconDown
    })`;
  } else if (header.classList.contains("table-head-FIO")) {
    header.style.backgroundImage = `url(${
      order === "asc" ? iconZtoA : iconAtoZ
    })`;
  } else if (
    header.classList.contains("table-head-Date-Creation") ||
    header.classList.contains("table-head-Date-Change")
  ) {
    header.style.backgroundImage = `url(${
      order === "asc" ? iconUp : iconDown
    })`;
  }
}

// Обработка клика по элементу (показать больше контактов)
function handleContactMoreClick(element) {
  const row = element.closest("tr");
  const clientId = row.dataset.clientId;
  const contactIndex = parseInt(element.dataset.contactIndex, 10);

  // Найти клиента в массиве клиентов
  const client = clients.find((c) => c.id == clientId);
  if (!client || !client.contacts) return;

  // Получить дополнительные контакты
  const additionalContacts = client.contacts.slice(contactIndex);
  const additionalContactsHTML = additionalContacts
    .map(
      (contact) =>
        `<img src="${getIconURL(contact.type)}" alt="${contact.type}" title="${
          contact.type
        }: ${contact.value}">`
    )
    .join("");

  // Обновить содержимое ячейки с контактами
  const contactIconsTd = row.querySelector(".contact-icons-td");
  contactIconsTd.innerHTML = contactIconsTd.innerHTML.replace(
    element.outerHTML,
    additionalContactsHTML
  );
}

// Инициализация страницы
async function initializePage() {
  const loader = document.createElement("div");
  loader.className = "custom-loader";
  document.body.appendChild(loader);

  setTimeout(async () => {
    try {
      clients = await loadClients();
      displayClients(clients);

      // Добавление обработчиков к существующим контактам
      addEventListenersToContacts("#contactList");
      addEventListenersToContacts("#contactEditList");

      // Обработчики для кнопок "Изменить" и "Удалить"
      document
        .getElementById("customersTable")
        .addEventListener("click", (event) => {
          if (event.target.classList.contains("btn-light-edit")) {
            const clientId = event.target.dataset.clientId;
            const client = clients.find((c) => c.id == clientId);
            if (client) {
              openEditModal(client);
            }
          } else if (event.target.classList.contains("btn-light-delete")) {
            const clientId = event.target.dataset.clientId;
            document.getElementById("deleteConfirmBtn").dataset.clientId =
              clientId;
            openModal(document.getElementById("deleteCustomerModal"));
          } else if (event.target.classList.contains("contact-more")) {
            handleContactMoreClick(event.target);
          }
        });

      document
        .getElementById("saveEditBtn")
        .addEventListener("click", async () => {
          const editIdSpan =
            document.getElementById("edit-id-span").textContent;
          const clientId = editIdSpan.replace("ID: ", "").trim();
          const editLastNameInput =
            document.getElementById("editLastName").value;
          const editFirstNameInput =
            document.getElementById("editFirstName").value;
          const editMiddleNameInput =
            document.getElementById("editMiddleName").value;

          const contacts = [];
          document
            .querySelectorAll("#contactEditList .contact-input-wrapper")
            .forEach((wrapper) => {
              const dropdown = wrapper.querySelector(".contact-dropdown");
              const input = wrapper.querySelector(".contact-input");
              const contactType = dropdown.value;
              const contactValue = input.value.trim();
              if (contactValue !== "") {
                contacts.push({ type: contactType, value: contactValue });
              }
            });

          const clientData = {
            name: editFirstNameInput,
            surname: editLastNameInput,
            lastName: editMiddleNameInput,
            contacts: contacts,
          };

          await updateClientOnServer(clientId, clientData);
        });

      document
        .getElementById("deleteConfirmBtn")
        .addEventListener("click", async () => {
          const clientId =
            document.getElementById("deleteConfirmBtn").dataset.clientId;
          const deleted = await deleteClientOnServer(clientId);
          if (deleted) {
            const rows = document.querySelectorAll("#customersTable tbody tr");
            rows.forEach((row) => {
              const clientIdCell = row
                .querySelector(".ID-td")
                .textContent.trim();
              if (clientIdCell === clientId) {
                row.remove();
              }
            });
            closeModal(document.getElementById("deleteCustomerModal"));
          } else {
            alert("Ошибка при удалении клиента");
          }
        });

      // Обработчики для модальных окон
      document.getElementById("addBtn").addEventListener("click", () => {
        clearInputFields();
        clearContactForm();
        openModal(document.getElementById("addCustomerForm"));
      });

      document.getElementById("closeModalBtn").addEventListener("click", () => {
        closeModal(document.getElementById("addCustomerForm"));
      });

      document.getElementById("cancelBtn").addEventListener("click", () => {
        closeModal(document.getElementById("addCustomerForm"));
      });

      document
        .getElementById("closeEditModalBtn")
        .addEventListener("click", () => {
          closeModal(document.getElementById("editCustomerModal"));
        });

      document
        .getElementById("deleteCancelBtn")
        .addEventListener("click", () => {
          closeModal(document.getElementById("deleteCustomerModal"));
        });

      document
        .getElementById("closeDeleteModalBtn")
        .addEventListener("click", () => {
          closeModal(document.getElementById("deleteCustomerModal"));
        });

      document
        .getElementById("saveBtn")
        .addEventListener("click", async (event) => {
          event.preventDefault();
          const firstName = document.getElementById("firstName").value;
          const middleName = document.getElementById("middleName").value;
          const lastName = document.getElementById("lastName").value;

          const contacts = [];
          document
            .querySelectorAll("#contactList .contact-input-wrapper")
            .forEach((wrapper) => {
              const dropdown = wrapper.querySelector(".contact-dropdown");
              const input = wrapper.querySelector(".contact-input");
              const contactType = dropdown.value;
              const contactValue = input.value.trim();
              if (contactValue !== "") {
                contacts.push({ type: contactType, value: contactValue });
              }
            });

          const clientData = {
            name: firstName,
            surname: lastName,
            lastName: middleName,
            contacts: contacts,
          };

          await createClientOnServer(clientData);
        });

      document
        .getElementById("addContactBtn")
        .addEventListener("click", () => createNewInput("#contactList"));
      document
        .getElementById("addContactBtnEdit")
        .addEventListener("click", () => createNewInput("#contactEditList"));

      document.getElementById("overlay").addEventListener("click", () => {
        const modals = document.querySelectorAll(".modal");
        modals.forEach((modal) => {
          if (modal.style.display === "block") {
            closeModal(modal);
          }
        });
      });

      // Поиск клиентов
      let searchTimeout;
      const searchInput = document.querySelector(".top-inp-search");

      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
          const query = searchInput.value.trim();
          const response = await fetch(
            `http://localhost:3000/api/clients?search=${query}`
          );
          if (response.ok) {
            clients = await response.json();
            displayClients(clients);
          }
        }, 300);
      });

      // Обработчик для сортировки
      let sortOrder = {
        id: "desc",
        surname: "asc",
        createdAt: "asc",
        updatedAt: "asc",
      };

      document.querySelectorAll("th.table-head").forEach((header) => {
        header.addEventListener("click", () => {
          const key = header.classList.contains("table-head-ID")
            ? "id"
            : header.classList.contains("table-head-FIO")
            ? "surname"
            : header.classList.contains("table-head-Date-Creation")
            ? "createdAt"
            : "updatedAt";
          const order = sortOrder[key];
          clients = sortClients(clients, key, order === "asc");
          sortOrder[key] = order === "asc" ? "desc" : "asc";
          displayClients(clients);
          updateHeaderIcons(header, order);
        });
      });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      loader.remove();
    }
  }, 300);
}

// Вызов функции инициализации страницы
initializePage();
