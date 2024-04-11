import './scss/styles.scss';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent, CardItem } from './components/AppData';
import { Page } from './components/Page';
import { BasketCard, Card, CardPreview } from './components/Сard';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { ICardItem, ICatalog, IOrderForm, FormErrors } from './types';
import { Order } from './components/Order';
import { Success } from './components/Success';
import { Contacts } from './components/Contacts';
import { ApiListResponse } from './components/base/api';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({eventName, data}) => {
  console.log(eventName, data);
})

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const appData = new AppState({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => modal.close()
})

//получить каталог карточек
api.getCardList()
.then(res => {
  appData.setCatalog(res);
})
.catch((err) => {
  console.error(err);
})

//вывести каталог
events.on('items:changed', () => {
  page.catalog = appData.catalog.map(item => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      id: item.id,
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price
    })
  })
})

//открыть карточку товара
events.on('card:select', (item: CardItem) => {
  const card = new Card(cloneTemplate(cardPreviewTemplate), {
    onClick: () => {
      if(item.selected) {
        events.emit('card:remove', item);
      } else {
        events.emit('card:add', item);
      }
      card.toggleButton(item.selected);
    }
  });
  modal.render({
    content: card.render({
      id: item.id,
      title: item.title,
      description: item.description,
      image: item.image,
      category: item.category,
      price: item.price,
      selected: item.selected
    })
  })
});

//заблокировать сроклл при открытом модальном окне
events.on('modal:open', () => {
  page.locked = true;
});

//разблокировать скролл при закрытии модального окна
events.on('modal:close', () => {
  page.locked = false;
});

//добавить товар в корзину
events.on('card:add', (item: CardItem) => {
  appData.addCardBasket(item);
  item.selected = true;
  page.counter = appData.getBasketCounter();
})

//открыть корзину
events.on('basket:open', () => {
  events.emit('modal:open');
  const cards = appData.basket.map((item, index) => {
    const card = new Card(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        events.emit('card:remove', item);
      },
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });
  modal.render({
    content: basket.render({
      items: cards,
      total: appData.getTotal(),
    }),
  });
  basket.toggleButton(!appData.basket.length);
});


//удалить товар(ы) из корзины
events.on('card:remove', (item: CardItem) => {
  item.selected = false;
  appData.removeCard(item.id);
  page.counter = appData.getBasketCounter();
  basket.total = appData.getTotal();
  if(appData.getBasketCounter() === 0) {
    basket.toggleButton(true);
  }
  events.emit('basket:change');
});


//изменение в корзине
events.on('basket:change', () => {
  page.counter = appData.basket.length
  let total = 0
  basket.items = appData.basket.map((item) => {
    const card = new BasketCard(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        appData.removeCardBasket(item);
        basket.total = appData.getTotal();
        events.emit('card:remove', {itemId: item.id})
      }
    });
    total += item.price;
    return card.render({
      title: item.title,
      price: item.price
    })
  })
  basket.total = total;
  appData.order.total = total;
  basket.selected = appData.basket;
})

//оформить заказ
events.on('order:open', () => {
  modal.render({
    content: order.render({
      payment: '',
      address: '',
      valid: false,
      errors: []
    })
  });
  modal.open();
});
  
//валидация первого этапа заказа
events.on(/^order\..*:change/, (data: {field: keyof IOrderForm, value: string}) => {
  appData.setOrderField(data.field, data.value);
});

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const {payment, address} = errors;
  order.valid = !payment && !address;
  order.errors = Object.values({payment, address}).filter((i) => !!i).join('; ')
});

//отправка данных о способе оплаты и адресе доставки
events.on('order:submit', () => {
  appData.order.total = appData.getTotal();
  appData.setOrderData();
  modal.render({
    content: contacts.render({
      errors: [],
      valid: false,
    }),
  });
})

//валидация второго этапа
events.on(/^contacts\..*:change/, (data: {field: keyof IOrderForm, value: string}) => {
  appData.setOrderField(data.field, data.value);
});

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const {email, phone} = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({email, phone}).filter((i) => !!i).join('; ')
})

//отправка данных о почте и номере телефона
events.on('contacts:submit', () => {
  api.post('/order', appData.order)
  .then((result) => {
    events.emit('order:success', result);
    page.counter = 0;
    appData.clearOrder();
  })
  .catch((err) => {
    console.error(err);
  })
})

//заказ оформлен
events.on('order:success', (result: ApiListResponse<string>) => {
  modal.render({
    content: success.render({
      total: result.total,
    })
  })
})