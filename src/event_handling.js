import Cards from "./cards.js";
import Lists from "./lists.js";
import Data from "./data.js";

const EventHandling = (function () {
  let currentList;

  function closeListDropdownOnClick(e) {
    const listDropdown = document.querySelector(".list-dropdown-wrapper");

    if (
      listDropdown &&
      !listDropdown.contains(e.target) &&
      closeListDropdownOnClick.didRun
    ) {
      Lists.closeOptionsDropdown(listDropdown);
      return;
    }

    closeListDropdownOnClick.didRun = true;
  }

  function listCreation(listElement) {
    // Add event listener to the add card button
    listElement.querySelector(".add-card-btn").addEventListener("click", () => {
      currentList = listElement;
      Cards.showCardCreationWindow.call(listElement);
    });

    // Edit title on click
    const title = listElement.firstElementChild.firstElementChild;
    title.addEventListener("click", () =>
      Lists.editListTitle(title, listElement)
    );

    // Dropdown menu shows when you click on the options-button
    const optionsBtn = listElement.querySelector(".list-options-btn");
    optionsBtn.addEventListener("click", () =>
      Lists.showOptionsDropdown(optionsBtn)
    );
  }

  function listNameInputKeyDown(e) {
    switch (e.key) {
      case "Enter":
        Lists.submitListCreation();
        break;
      case "Escape":
        Lists.cancelListCreation();
        break;
      default:
        return;
    }
  }

  function editTitleInputKeyDown(editTitleInput, titleEl) {
    editTitleInput.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
          Lists.submitTitleEdit(editTitleInput, titleEl);
          break;
        case "Escape":
          Lists.cancelTitleEdit(editTitleInput, titleEl);
          break;
        default:
          return;
      }
    });
  }

  function handleCardDragging(e, listEl) {
    e.preventDefault();

    const elementAfter = Lists.cardGetDragAfterElement(listEl, e.clientY);
    const draggableCard = document.querySelector(".dragging");
    const addBtn = listEl.querySelector(".add-card-btn");

    // append to bottom if no elementAfter, ttherwise insert it before the elementAfter
    listEl.insertBefore(draggableCard, elementAfter ? elementAfter : addBtn);
  }

  function handleListDragging(e) {
    e.preventDefault();

    const board = document.querySelector(".board");
    const elementAfter = listGetElementAfterDrag(board, e.clientX);
    const currentlyDragging = document.querySelector(".list-dragging");
    const addBtn = board.querySelector(".add-list-btn");

    if (elementAfter) board.insertBefore(currentlyDragging, elementAfter);
    else board.insertBefore(currentlyDragging, addBtn);
  }

  function listGetElementAfterDrag(container, x) {
    const draggableElements = [
      ...container.querySelectorAll(".list-wrapper:not(.list-dragging)"),
    ];

    // Determine element after the one we're currently dragging
    return draggableElements.reduce(
      (closest, element) => {
        const box = element.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: element };
        } else return closest;
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  return {
    listCreation,
    editTitleInputKeyDown,
    handleCardDragging,
    listNameInputKeyDown,
    currentList,
    handleListDragging,
    closeListDropdownOnClick,
  };
})();

export default EventHandling;
