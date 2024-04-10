import {Model} from './base/model';
import { FormErrors, IAppState, ICardItem, IOrder, IOrderForm } from '../types';

export type CatalogChangeEvent = {
  catalog: CardItem[];
}

/* Не совсем понимаю, почему нельзя использовать этот класс, учитывая то, что в проекте-примере структура именно такая
https://github.com/yandex-praktikum/ono-tebe-nado-oop
*/
export class CardItem extends Model<ICardItem> {
  description: string;
  id: string;
  image: string;
  title: string;
  price: number;
  category: string;
  selected: boolean;
  status: boolean;
}


//хранение данных
export class AppState extends Model<IAppState> {
  basket: CardItem[] = [];
  catalog: CardItem[];
  order: IOrder = {
    email: '',
    phone: '',
    items: [],
    address: '',
    total: 0,
    payment: ''
  };

  formErrors: FormErrors = {};


  //удаление товара
  removeCard(id: string) {
    this.basket = this.basket.filter((item) => item.id !== id);
    this.setOrderData();
  }

  BasketRemove(): boolean {
    return this.basket.length === 0;
  }


  //очистка данных заказа
  clearOrder() {
    this.order = {
      email: '',
      phone: '',
      address: '',
      payment: '',
      items: [],
      total: 0
    };
    this.basket = [];
    this.basket.forEach((item) => (item.selected = false));
  }

  //сумма заказа
  getTotal() {
    return this.basket.reduce((total, item) => total + item.price, 0);
  }

  //каталог главной страницы
  setCatalog(items?: ICardItem[]) {
    this.catalog = items.map(item => new CardItem(item, this.events));
    this.emitChanges('items:changed', {catalog: this.catalog});
  }

  //данные товара для заказа
  setOrderData() {
    this.order.items = this.basket.map((item) => item.id);
  }

  //счетчик товаров в корзине
  getBasketCounter() {
    return this.basket.length;
  }

  //добавить товар в корзину
  addCardBasket(item: CardItem) {
    this.basket.push(item);
  }

  //удалить товар из корзины
  removeCardBasket(card: CardItem) {
    this.basket = this.basket.filter((item) => item.id !== card.id);
  }

  //установка и проверка значений в заказе
  setOrderField(field: keyof IOrderForm, value: string) {
    this.order[field] = value;

    if(this.validateOrder()) {
      this.events.emit('order:ready', this.order);
    }
  }

  //валидация форм
  validateOrder() {
    const errors: typeof this.formErrors = {};

    if(!this.order.email) {
      errors.email = 'Необходимо указать email';
    }
    if(!this.order.phone) {
      errors.phone = 'Необходимо указать телефон';
    }
    if(!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    if(!this.order.payment) {
      errors.payment = 'Необходимо указать способ оплаты';
    }
    
    this.formErrors = errors;
    this.events.emit('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  };
}