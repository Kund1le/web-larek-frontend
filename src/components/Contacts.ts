import { EventEmitter, IEvents } from "./base/events";
import { Form } from "./common/Form";
import { IOrderForm } from "../types";
import { ensureElement } from "../utils/utils";

export class Contacts extends Form<IOrderForm> {
  protected _email: HTMLInputElement;
  protected _phone: HTMLInputElement;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    super(container, events);

    this._email = ensureElement<HTMLInputElement>('[name="email"]', this.container);
    this._phone = ensureElement<HTMLInputElement>('[name="phone"]', this.container);
  }

  set email(value: string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
  }

  set phone(value: string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
  }
}