import Data from "./data.js";
import Cards from "./cards.js";

const CardOptions = (function () {
  function removeCard(card) {
    const list = Cards.getListFromCard(card);

    Data.deleteCard(list, card);

    card.remove();
  }

  function editLabel() {
    console.log("label has been edited");
  }

  return { removeCard, editLabel };
})();

export default CardOptions;
