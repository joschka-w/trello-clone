import Cards from "./cards.js";
import Lists from "./lists.js";

const Data = (function () {
  const cardOptionButtons = [
    // Buttons will be created from this array, functions have to be added in AddFunctionsOptionButtons
    {
      title: "Löschen",
      iconName: "delete",
    },
  ];

  const listOptionItems = ["Karte hinzufügen", "Liste löschen"]; // Dropdown menu will be generated from this array, see listOptionsLogic.js for functionality

  // List and card data
  let data = {
    lists: [],
    nextId: 1,
  };

  // List actions
  function addList(name, pos = data.lists.length) {
    const newList = {
      id: data.nextId++,
      name: name,
      position: pos,
      cards: [],
    };

    data.lists.push(newList);

    saveData();

    return newList; // Incase you need the position for example (usage is optional)
  }

  function deleteList(listId) {
    const list = data.lists.find((list) => list.id === +listId); // ? Refactoring

    data.lists.splice(list.position, 1);

    updateListPositions();

    saveData();
  }

  function moveList(listElement) {
    const listId = getElementId(listElement);
    const listToMove = data.lists.find((list) => list.id === +listId); // ? Refactoring

    const newPosition = findNewListPosition(listToMove.id);
    const currentPosition = data.lists.indexOf(listToMove);

    data.lists.splice(currentPosition, 1); // Remove list from old position
    data.lists.splice(newPosition, 0, listToMove); // Insert list in new position

    updateListPositions(); // Update the position-value of all lists

    saveData();
  }

  function renameList(listId, newName) {
    const list = data.lists.find((l) => l.id === +listId); // ? Refactoring
    list.name = newName;

    saveData();
  }

  // Card actions
  function addCard(listElement, value) {
    const listId = getElementId(listElement);
    const list = data.lists.find((l) => l.id === +listId);

    const newCard = {
      id: data.nextId++,
      value: value,
      position: list.cards.length,
    };

    list.cards.push(newCard);

    saveData();

    return newCard; // Incase you need some value from the card (usage is optional)
  }

  function deleteCard(listElement, cardElement) {
    const listId = getElementId(listElement); // Get id from list element
    const list = data.lists.find((list) => list.id === +listId); // ? Refactoring

    const cardId = getElementId(cardElement);
    const card = list.cards.find((c) => c.id === +cardId);

    list.cards.splice(card.position, 1);
    updateCardPositions(list);

    saveData();
  }

  function startMoveCard(cardElement) {
    const listElement = Cards.getListFromCard(cardElement);
    const listId = getElementId(listElement);
    const list = data.lists.find((l) => l.id === +listId); // ? Refactoring

    const cardId = getElementId(cardElement);
    const card = list.cards.find((c) => c.id === +cardId); // ? Refactoring

    const currentPosition = list.cards.indexOf(card);

    list.cards.splice(currentPosition, 1);

    updateCardPositions(list);

    startMoveCard.cardToMove = card;
  }

  function endMoveCard(cardElement) {
    const card = startMoveCard.cardToMove;

    const listElement = Cards.getListFromCard(cardElement);
    const listId = getElementId(listElement);
    const list = data.lists.find((l) => l.id === +listId);

    const newPosition = findNewCardPosition(cardElement, listElement);

    list.cards.splice(newPosition, 0, card);

    updateCardPositions(list);

    saveData();
  }

  function renameCard(cardElement, newValue) {
    const listElement = Cards.getListFromCard(cardElement);
    const listId = getElementId(listElement);
    const list = data.lists.find((l) => l.id === +listId); // ? Refactoring

    const cardId = getElementId(cardElement);
    const card = list.cards.find((c) => c.id === +cardId); // ? Refactoring

    card.value = newValue;

    saveData();
  }

  // Saving & loading data
  function saveData() {
    localStorage.setItem(data, JSON.stringify(data));
  }

  function loadData() {
    const loadedData = JSON.parse(localStorage.getItem(data));

    if (!loadedData) return;

    for (const list of loadedData.lists) {
      const listElement = Lists.loadList(list);

      const addCardBtn = listElement.querySelector(".add-card-btn");
      for (const card of list.cards) {
        Cards.createCard(card.value, addCardBtn);
      }
    }
  }

  // Helper functions
  function findNewListPosition(listId) {
    const list = findElementById(listId);
    const allLists = [...document.querySelectorAll(".list-wrapper")];

    return allLists.findIndex((l) => l === list);
  }

  function findNewCardPosition(cardElement, listElement) {
    const allCards = [...listElement.querySelectorAll(".card")];

    return allCards.findIndex((c) => c === cardElement);
  }

  function findElementById(id) {
    return document.querySelector(`#id-${id}`);
  }

  function updateListPositions() {
    data.lists.forEach((list, i) => (list.position = i));
  }

  function updateCardPositions(list) {
    list.cards.forEach((card, i) => (card.position = i));
  }

  function getElementId(element) {
    return element.id.replace(/[^0-9]/g, "");
  }

  /////////////////////////////////////////////
  return {
    addList,
    deleteList,
    moveList,
    renameList,

    addCard,
    deleteCard,
    startMoveCard,
    endMoveCard,
    renameCard,

    saveData,
    loadData,

    getElementId,

    cardOptionButtons,
    listOptionItems,
    data,
  };
})();

export default Data;
