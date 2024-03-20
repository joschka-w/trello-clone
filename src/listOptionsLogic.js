import Cards from "./cards.js";
import Lists from "./lists.js";
import Data from "./data.js";

///////////////////////////////////////
// Functions for the list-dropdown menu
///////////////////////////////////////

const ListOptions = (function () {
  // Function gets chosen based on the name on the button, array can be found in lists.js
  function chooseFunction(name, listId) {
    switch (name) {
      case "Karte hinzufügen":
        return addCard();
      case "Liste löschen":
        return deleteList(listId);
    }
  }

  function addCard() {
    const dropdown = document.querySelector(".list-dropdown-wrapper");
    const listElement = dropdown.parentElement.parentElement;

    Cards.showCardCreationWindow.call(listElement);

    Lists.closeOptionsDropdown(dropdown);
  }

  function deleteList(listId) {
    const dropdown = document.querySelector(".list-dropdown-wrapper");
    const listElement = dropdown.parentElement.parentElement;

    listElement.remove();

    Data.deleteList(listId);

    Lists.closeOptionsDropdown(dropdown);
  }

  return { chooseFunction };
})();

export default ListOptions;
