import { Component } from "./base/components";
import { ICardActions, ICardItem, ICatalog, IBasketCard } from "../types";
import { ensureElement } from "../utils/utils";
import { CardItem } from "./AppData";
import { cardCategory } from "../utils/constants";

export class Card<T> extends Component<ICardItem> {
  protected _title: HTMLElement;
  protected _image?: HTMLImageElement;
  protected _price: HTMLElement;
  protected _button?: HTMLButtonElement;
  protected _category: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._image = container.querySelector('.card__image');
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._button = container.querySelector('.card__button');
    this._category = container.querySelector('.card__category');

    if(actions?.onClick) {
      if(this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
        container.addEventListener('click', actions.onClick);
      }
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || '';
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  get title(): string {
    return this._title.textContent || '';
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title)
  }

  set price(value: string) {
    if(value) {
      this.setText(this._price, `${value} синапсов`);
    } else {
      this.setText(this._price, 'Бесценно');
    }

    if(this._button) {
      this._button.disabled = !value;
    }
  }

  get price(): string {
    return this._price.textContent || ''
  }

  set button(value: string) {
    if (this._price.textContent === 'Бесценно') {
			this._button.disabled = true;
			this.setText(this._button, 'Нельзя купить');
		} else this.setText(this._button, value);
  }

  toggleButton(selected: boolean) {
    if(selected) {
      this.button = 'Убрать из корзины';
    } else {
      this.button = 'В корзину'
    }
  }

  set category(value: string) {
    this.setText(this._category, value);
    this._category.classList.add(cardCategory[value]);
  }

  get category() {
    return this._category.textContent || '';
  }

  set selected(value: boolean) {
    if(!this._button.disabled) {
      this._button.disabled = value;
    }
  }
}

export type CatalogItemIndex = {
  index?: HTMLElement
}


export type BasketCardSttus = {
  index: number
}

export class BasketCard extends Card<ICardActions> {
  protected _title: HTMLElement;
  protected _index: HTMLElement;
  protected _button: HTMLButtonElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this._title = this.container.querySelector('.card__title');
    this._index = this.container.querySelector('.basket__item-index');
    this._button = this.container.querySelector('.card__button');
    this._price = this.container.querySelector('.card__price');

    if(this._button) {
      this._button.addEventListener('click', (evt) => {
        this.container.remove();
        actions?.onClick(evt);
      });
    }
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set index(value: number) {
    this.setText(this._index, value.toString());
  }

  set price(value: string) {
    this.setText(this._price, `${value}` + ' синапсов')
  }
}
  export type CardPreviewDes = {
    description: string
  }

export class CardPreview extends Card<CardPreviewDes> {
  protected _description: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);
    this._description = container.querySelector('.card__text');
  }

  set description(value: string) {
    this.setText(this._description, value);
  }
}