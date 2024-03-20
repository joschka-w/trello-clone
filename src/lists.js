import EventHandling from "./event_handling.js";
import { addListButton, listNameInput } from "./main.js";
import Cards from "./cards.js";
import ListOptions from "./listOptionsLogic.js";
import Data from "./data.js";

const Lists = (function () {
  // Elements
  const createListWindow = document.querySelector(".create-list-name");

  // Creation of List
  function showListCreationWindow() {
    Cards.RemoveExistingCardCreationWindow(); // If a create-card window exists, remove it

    createListWindow.classList.remove("hide");

    addListButton.insertAdjacentElement("afterend", createListWindow);
    addListButton.classList.add("hide");

    listNameInput.focus();
  }

  function createListElement() {
    const listElement = document.createElement("div"); // Create the element
    listElement.classList.add("list-wrapper"); // Add the appropriate class to it

    const html = `
    <div class="list-header">
      <button class="list-title">title</button>
      <button class="list-options-btn generic-btn">⋯</button>
    </div>
    <button class="add-card-btn">+ Eine Karte hinzufügen</button>`;

    listElement.insertAdjacentHTML("afterbegin", html); // Insert contents into the element

    return listElement;
  }

  function createList(listName) {
    const wrapper = createListElement(); // Create the list-element

    createListWindow.insertAdjacentElement("afterend", wrapper);
    createListWindow.classList.add("hide"); // Hide the add-list window

    wrapper.querySelector(".list-title").textContent = listName; // Set the title to listName

    enableCardDragging(wrapper); // Give dragging functionality to cards(list also needs logic for that to happen)

    EventHandling.listCreation(wrapper, listName); // Add event handlers
    makeDraggable(wrapper); // Make the list draggable (different from above)

    const listData = Data.addList(listName); // Update the data
    wrapper.id = `id-${listData.id}`; // Add the unique id to the element

    return wrapper; // Does not need to be used
  }

  function cancelListCreation() {
    addListButton.classList.remove("hide");
    createListWindow.classList.add("hide");

    listNameInput.value = ""; // Clear the input
  }

  function submitListCreation() {
    const input = listNameInput.value;
    if (!input) return; // Do nothing if the text input is empty

    const list = createList(input); // Create and display a list with the given name

    // Move add-list button to the "bottom" (to the side in then dom)
    list.insertAdjacentElement("afterend", addListButton);
    addListButton.classList.remove("hide");

    listNameInput.value = ""; // Clear the input
    showListCreationWindow(); // Show the window again, in case user wants to add multiple lists
  }

  // Data loading
  function loadList(listData) {
    const list = createList(listData.name);
    addListButton.insertAdjacentElement("beforebegin", list);

    return list; // Maybe needed
  }

  // Editing of List
  function editListTitle(titleEl, parent) {
    const titleHtml = `<input type="text" class="edit-list-title-input text-input" />`;

    titleEl.insertAdjacentHTML("beforebegin", titleHtml);
    titleEl.classList.add("hide");

    const editTitleInput = parent.firstElementChild.firstElementChild;

    editTitleInput.value = titleEl.textContent;
    editTitleInput.focus();
    editTitleInput.select();

    EventHandling.editTitleInputKeyDown(editTitleInput, titleEl);
  }

  function submitTitleEdit(inputEl, titleEl) {
    const newTitle = inputEl.value;

    if (!newTitle) return; // Do nothing if input is empty

    titleEl.textContent = newTitle; // Set new title
    inputEl.remove();
    titleEl.classList.remove("hide");

    const listId = Data.getElementId(titleEl.parentElement.parentElement);
    Data.renameList(listId, newTitle);
  }

  function cancelTitleEdit(inputEl, titleEl) {
    inputEl.remove();
    titleEl.classList.remove("hide");
  }

  // Options-dropdown

  function createOptionsItem(name) {
    const element = document.createElement("li");
    element.classList.add("list-dropdown-item");

    const html = `<button class="list-dropdown-item-btn">${name}</button>`;
    element.insertAdjacentHTML("afterbegin", html);

    return element;
  }

  function createOptionsList(listId) {
    const ulElement = document.createElement("ul");
    ulElement.classList.add("list-dropdown-list");

    // Create an element for each item in the optionItems array
    for (const itemName of Data.listOptionItems) {
      const item = createOptionsItem(itemName); // Create the element
      ulElement.insertAdjacentElement("beforeend", item); // Add it's class to the element

      // Add functionality to item
      item.addEventListener("click", () =>
        ListOptions.chooseFunction(itemName, listId)
      );
    }

    return ulElement;
  }

  function createOptionsDropdown(listId) {
    const wrapper = document.createElement("div"); // Create element
    wrapper.classList.add("list-dropdown-wrapper"); // Add class to element

    const html = `
    <div class="list-dropdown-header">
      <h3 class="list-dropdown-title">Listenaktionen</h3>
      <button class="list-dropdown-close-btn generic-btn">✕</button>
    </div>
    <div class="list-dropdown-content">
    </div>`;

    wrapper.insertAdjacentHTML("afterbegin", html); // Insert html into element

    const optionsList = createOptionsList(listId); // create the actual items to click
    const optionsListWrapper = wrapper.querySelector(".list-dropdown-content"); // Get the wrapper

    optionsListWrapper.insertAdjacentElement("afterbegin", optionsList); // Insert items in wrapper

    return wrapper;
  }

  function showOptionsDropdown(showBtn) {
    // If a dropdown already exists, close that one and return
    const existingDropdown = document.querySelector(".list-dropdown-wrapper");
    if (existingDropdown) {
      closeOptionsDropdown(existingDropdown);
      return;
    }

    const listEl = showBtn.parentElement.parentElement;
    const listId = listEl.id.replace(/[^0-9]/g, "");

    const dropdown = createOptionsDropdown(listId); // Create the dropdown element
    const closeDropdownBtn = dropdown.querySelector(".list-dropdown-close-btn"); // get the close button from that dropdown element

    // Adding the close-functionality to the close-button
    closeDropdownBtn.addEventListener("click", () =>
      closeOptionsDropdown(dropdown)
    );

    showBtn.insertAdjacentElement("afterend", dropdown); // Inserting the dropdown after the button
    document.addEventListener("click", EventHandling.closeListDropdownOnClick); // When user clicks outside of dropdown, it closes
  }

  function closeOptionsDropdown(dropdown) {
    document.removeEventListener(
      "click",
      EventHandling.closeListDropdownOnClick
    );
    dropdown.remove();
    EventHandling.closeListDropdownOnClick.didRun = false;
  }

  // Other
  function enableCardDragging(listEl) {
    listEl.addEventListener("dragover", (e) => {
      if (!document.querySelector(".dragging")) return;
      EventHandling.handleCardDragging(e, listEl);
    });
  }

  function cardGetDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".card:not(.dragging)"),
    ];

    // Determine alement after the one we're currently dragging
    return draggableElements.reduce(
      (closest, el) => {
        const box = el.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: el };
        } else return closest;
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  function makeDraggable(listElement) {
    listElement.setAttribute("draggable", "true");

    listElement.addEventListener("dragstart", () => {
      if (document.querySelector(".dragging")) return; // Return when a card is being dragged instead of a list

      const dropdown = document.querySelector(".list-dropdown-wrapper");
      if (dropdown) closeOptionsDropdown(dropdown);

      listElement.classList.add("list-dragging");
    });

    listElement.addEventListener("dragend", () => {
      Data.moveList(listElement);
      listElement.classList.remove("list-dragging");
    });
  }

  return {
    showListCreationWindow,
    cancelListCreation,
    submitListCreation,

    editListTitle,
    submitTitleEdit,
    cancelTitleEdit,

    loadList,

    cardGetDragAfterElement,
    showOptionsDropdown,
    closeOptionsDropdown,
  };
})();

export default Lists;
