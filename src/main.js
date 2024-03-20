import EventHandling from "./event_handling.js";
import Lists from "./lists.js";
import Data from "./data.js";

//////////////////////////////////////////////////////////////
// TODO - Add data saving and loading
// TODO - Close windows when clicking outside them
// TODO -
//////////////////////////////////////////////////////////////

// Elements
export const addListButton = document.querySelector(".add-list-btn");
const cardSubmitButton = document.querySelector(".list-name-submit-btn");
const cardCancelButton = document.querySelector(".list-name-cancel-btn");
export const listNameInput = document.querySelector(".list-name-input");

// Initialization
Data.loadData();

addListButton.addEventListener("click", Lists.showListCreationWindow);
cardCancelButton.addEventListener("click", Lists.cancelListCreation);
cardSubmitButton.addEventListener("click", Lists.submitListCreation);
listNameInput.addEventListener("keydown", EventHandling.listNameInputKeyDown);
document.addEventListener("dragover", (e) => {
  if (!document.querySelector(".list-dragging")) return;
  EventHandling.handleListDragging(e);
});
