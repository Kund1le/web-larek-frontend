import { Form } from "./common/Form";
import { IOrderForm } from "../types";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

export class Order extends Form<IOrderForm> {
  protected _card?: HTMLButtonElement;
  protected _cash?: HTMLButtonElement;
  protected _address: HTMLInputElement
  
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._card = ensureElement<HTMLButtonElement>('[name="card"]', this.container);
    this._cash = ensureElement<HTMLButtonElement>('[name="cash"]', this.container);

    this._card.addEventListener('click', (evt: Event) => {
      evt.preventDefault();
      
      this._card.classList.add('button_alt-active');
      this._cash.classList.remove('button_alt-active');
      this.onInputChange('payment', 'card');
    });

    this._cash.addEventListener('click', (evt: Event) => {
      evt.preventDefault();

      this._cash.classList.add('button_alt-active');
      this._card.classList.remove('button_alt-active');
      this.onInputChange('payment', 'cash');
    });
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement). value = value;
  }

  set card(item: HTMLButtonElement) {
    this._card = item;
  }

  get card(): HTMLButtonElement {
    return this._card;
  }

  set cash(item: HTMLButtonElement) {
    this._cash = item;
  }

  get cash(): HTMLButtonElement {
    return this._cash;
  }
}