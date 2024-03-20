import CardOptions from "./cardOptionsLogic.js";
import Lists from "./lists.js";
import Data from "./data.js";

const Cards = (function () {
  // Card creation
  function createCardCreationWindow() {
    const window = document.createElement("div");
    window.classList.add("create-card-wrapper");

    const html = `
    <textarea
      class="create-card-input textarea"
      id="create-card-input"
      rows="4"
      placeholder="Geben sie einen Titel für diese Karte ein ..."
    ></textarea>
    <div class="create-card-btns">
      <button class="create-card-submit-btn submit-btn">
        Karte hinzufügen
      </button>
      <button class="create-card-cancel-btn generic-btn">✕</button>
    </div>`;

    window.insertAdjacentHTML("afterbegin", html);

    return window;
  }

  function showCardCreationWindow() {
    // If a window already exists, delete it
    const oldWindow = document.querySelector(".create-card-wrapper");
    if (oldWindow)
      cancelCreateCard(
        oldWindow,
        oldWindow.parentElement.querySelector(".add-card-btn") // The add-card button
      );

    Lists.cancelListCreation(); // Same for the list-creation window

    const window = createCardCreationWindow();
    const inputField = window.firstElementChild;
    const submitBtn = window.lastChild.firstElementChild;
    const cancelBtn = window.lastChild.lastElementChild;
    const btn = this.querySelector(".add-card-btn");

    btn.insertAdjacentElement("afterend", window); // Append the window to the list
    btn.classList.add("hide"); // Hide the button

    inputField.focus();

    // Add the event listeners to the buttons and the input field
    inputField.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          createCard(inputField.value, btn, inputField);
          break;
        case "Escape":
          cancelCreateCard(window, btn);
          break;
        default:
          return;
      }
    });

    submitBtn.addEventListener("click", () => {
      createCard(inputField.value, btn, inputField);
    });

    cancelBtn.addEventListener("click", () => {
      cancelCreateCard(window, btn);
    });
  }

  function cancelCreateCard(window, btn) {
    // Made into function because it's used twice

    window.remove(); // Delete the window
    btn.classList.remove("hide"); // Show the button
  }

  function createCardElement(task) {
    const card = document.createElement("div"); // Create the div
    card.classList.add("card"); // Add its class to it

    const html = `
    <p class="card-text">${task}</p>
    <button class="edit-card-btn">
      <span class="material-icons-outlined md-18"> edit </span>
    </button>`;

    card.insertAdjacentHTML("afterbegin", html); // Insert html into the div

    return card;
  }

  function createCard(task, addCardBtn, inputField) {
    if (!task) return; // Return if task input is empty

    const card = createCardElement(task);

    addCardBtn.insertAdjacentElement("beforebegin", card); // Insert card below all other cards

    makeDraggable(card); // Add the drag functionality to the card (in external function for readability)

    // Edit-card button should only be visible on hovering the task
    const editCardBtn = card.lastChild;

    editCardBtn.style.display = "none";

    card.addEventListener("mouseenter", () => {
      editCardBtn.style.display = "flex";
    });

    card.addEventListener("mouseleave", () => {
      editCardBtn.style.display = "none";
    });

    editCardBtn.addEventListener("click", () => editCard(card));

    if (inputField) {
      inputField.value = ""; // Clear the text input
      inputField.focus(); // Focus on the input, for the next task
    }

    const listElement = addCardBtn.parentElement;
    const cardData = Data.addCard(listElement, task); // Create the data for the card

    card.id = `id-${cardData.id}`; // Add the unique id to the element
  }

  // Card editing
  function createEditCardWindow() {
    const window = document.createElement("div");
    window.classList.add("edit-card-wrapper");

    const html = `
      <div class="edit-card-form">
        <textarea id="edit-card-input" class="edit-card-input textarea" rows="4"></textarea>
        <button class="edit-card-submit-btn submit-btn">Speichern</button>
      </div>`;

    window.insertAdjacentHTML("afterbegin", html);

    const optionBtns = createOptionButtonsWindow();
    AddOptionButtonFunctions(optionBtns);

    window.appendChild(optionBtns);

    return window;
  }

  function editCard(card) {
    // Create the edit card window
    const window = createEditCardWindow();

    const cardText = card.firstElementChild;

    cardText.insertAdjacentElement("beforebegin", window);

    card.style.border = "none"; // So the hover-effect stops while the edit-card window is showing

    const input = card.querySelector(".edit-card-input");
    const submitBtn = card.querySelector(".edit-card-submit-btn");

    input.value = cardText.textContent; // Insert old text in the input field

    input.focus();
    input.select();

    // Add event listeners
    input.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          submitEditedCard();
          break;
        case "Escape":
          // Cancel the card edit (delete the edit-window)
          card.querySelector(".edit-card-wrapper").remove();
          card.style.border = ""; // So the hover effect on card works again

          card.lastElementChild.style.display = "none"; // So the edit-card button doesnt't show when the mouse is not over it
          break;
        default:
          return;
      }
    });

    submitBtn.addEventListener("click", submitEditedCard);

    function submitEditedCard() {
      const newText = input.value;

      if (!newText) return; // Return if input field is empty

      cardText.textContent = newText; // Set the new text

      Data.renameCard(card, newText);

      card.querySelector(".edit-card-wrapper").remove(); // delete the edit-window

      // Hide the edit-card-button (otherwise it shows, even when not hovered)
      card.querySelector(".edit-card-btn").style.display = "none";

      card.style.border = ""; // So the hover effect on card works again
    }
  }

  function createOptionsButton(title, iconName) {
    // Creates a button from a name(title) and the iconName(google icons fonts code)

    const btn = document.createElement("button");
    btn.classList.add("edit-card-options-btn");

    const html = `
    <span class="material-symbols-outlined md-18"> ${iconName} </span>
    ${title}`;

    btn.insertAdjacentHTML("afterbegin", html);

    return btn;
  }

  function createOptionButtonsWindow() {
    // Creates all the buttons and inserts them in the wrapper

    const wrapper = document.createElement("div");
    wrapper.classList.add("edit-cards-options-btn-wrapper");

    for (const btn of Data.cardOptionButtons) {
      const button = createOptionsButton(btn.title, btn.iconName);
      wrapper.appendChild(button);
    }

    return wrapper;
  }

  function AddOptionButtonFunctions(wrapper) {
    // ! Can be built like the equivalent in listOptionsLogic, code is cleaner.
    // Adds the functionality to the buttons. Buttons are found with the name, then a function from cardOptionsLogic.js is assigned to each one

    const buttons = [...wrapper.children]; // Array of all the buttons

    // Delete button
    const delBtn = findBtnFromName("Löschen");

    delBtn.addEventListener("click", () =>
      CardOptions.removeCard(getCardFromBtn(delBtn))
    );

    // Helper functions
    function getCardFromBtn(btn) {
      return btn.parentElement.parentElement.parentElement;
    }

    function findBtnFromName(name) {
      return buttons.filter((btn) => btn.textContent.includes(name))[0];
    }
  }

  // Other
  function makeDraggable(card) {
    card.setAttribute("draggable", "true");

    card.addEventListener("dragstart", () => {
      Data.startMoveCard(card);
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      Data.endMoveCard(card);
      card.classList.remove("dragging");
    });
  }

  function RemoveExistingCardCreationWindow() {
    const createCardWindow = document.querySelector(".create-card-wrapper");
    if (createCardWindow)
      cancelCreateCard(
        createCardWindow,
        createCardWindow.parentElement.querySelector(".add-card-btn") // The add-card button
      );
  }

  // Helper functions
  function getListFromCard(card) {
    return card.parentElement;
  }

  return {
    showCardCreationWindow,
    RemoveExistingCardCreationWindow,
    getListFromCard,
    createCard,
  };
})();

export default Cards;
