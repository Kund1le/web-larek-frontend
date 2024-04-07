import { Component } from "../base/components";
import { createElement, ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/events";
import { IBasketView } from "../../types";

export class Basket extends Component<IBasketView> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLButtonElement;
  

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = this.container.querySelector('.basket__price');
    this._button = this.container.querySelector('.basket__button');

    if(this._button) {
      this._button.addEventListener('click', () => {
        events.emit('order:open');
      });
    }
    this.items = [];
  }
  
  set items(items: HTMLElement[]) {
    if(items.length) {
      this.toggleButton(false);
      this._list.replaceChildren(...items);
    } else {
      this.toggleButton(true);
      this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
        textContent: 'Корзина пуста'
      }));
    }
  }

  set total(total: number) {
    this.setText(this._total, `${total} синапсов`);
  }

  set selected(items: string[]) {
    if (items.length) {
      this.setDisabled(this._button, false);
  } else {
      this.setDisabled(this._button, true);
    }
  }

  updatBasketData() {
    Array.from(this._list.children).forEach((item, index) => {
			const element = item.querySelector(`.basket__item-index`);
			if (element) {
				element.textContent = (index + 1).toString();
			}
		});
  }

  toggleButton(state: boolean) {
    this._button.disabled = state;
  }
}