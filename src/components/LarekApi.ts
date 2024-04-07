import {Api, ApiListResponse} from './base/api';
import { IOrder, IOrderResult, ICardItem, ILarekApi } from '../types';

export class LarekApi extends Api implements ILarekApi {
  readonly cdn: string;

  constructor(cdn: string, baseURL: string, options?: RequestInit) {
    super(baseURL, options);
    this.cdn = cdn;
  }

  getCardItem(id: string): Promise<ICardItem> {
    return this.get(`/product/${id}`)
    .then((item: ICardItem) => ({
      ...item,
      image: this.cdn + item.image,
    }));
  }

  getCardList(): Promise<ICardItem[]> {
    return this.get('/product')
    .then((data: ApiListResponse<ICardItem>) => 
    data.items.map((item) => ({
      ...item,
      image: this.cdn + item.image,
    })));
  }

  orderCards(order: IOrder): Promise<IOrderResult> {
    return this.post('/order', order)
    .then((data: IOrderResult) => data);
  }
}