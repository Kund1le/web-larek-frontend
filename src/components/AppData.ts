import {Model} from './base/model';
import { FormErrors, IAppState, ICardItem, IOrder, IOrderForm } from '../types';
import { BasketCard, Card } from './Сard';

export type CatalogChangeEvent = {
  catalog: ICardItem[];
}

/* 
Спасибо большое за объяснение <3
*/



//хранение данных
export class AppState extends Model<IAppState> {
  basket: ICardItem[] = [];
  catalog: ICardItem[];
  order: IOrder = {
    email: '',
    phone: '',
    items: [],
    address: '',
    total: 0,
    payment: ''
  };

  preview: string | null
  formErrors: FormErrors = {};


  //удаление товара
  removeCard(id: string) {
    this.basket = this.basket.filter((item) => item.id !== id);
    this.setOrderData();
  }

  BasketRemove(): boolean {
    return this.basket.length === 0;
  }

  setPreviewCard(item: ICardItem) {
    this.preview = item.id;
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

  setCatalog(items: ICardItem[]) {
    this.catalog = items.map((item) => {
      return {
        title: item.title,
        description: item.description,
        category: item.category,
        id: item.id,
        image: item.image,
        price: item.price
      };
    });
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
  addCardBasket(item: ICardItem) {
    this.basket.push(item);
    this.emitChanges('basket:change')
  }

  //удалить товар из корзины
  removeCardBasket(card: ICardItem) {
    this.basket = this.basket.filter((item) => item.id !== card.id);
    this.emitChanges('basket:change')
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