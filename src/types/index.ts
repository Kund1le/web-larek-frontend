export interface ICardItem {
  id: string,
  title: string,
  description: string,
  image: string,
  category: string,
  price: number | null,
  button: ICardItem[],
  count?: string;
  index: number;
  selected: boolean;
}

export interface IAppState {
  catalog: ICardItem[];
  basket: string[];
  preview: string | null;
  order: IOrder | null;
}

export interface IOrderForm {
  email: string;
  phone: string;
  address: string;
  payment: string;
}

export interface IOrder extends IOrderForm {
  items: string[];
  total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
  id: string;
  total: number;
}

export interface IBasketView {
  items: HTMLElement[];
  total: number;
  selected: string;
  button: string[];
  list: HTMLElement[];
  price: number;
}

export interface ILarekApi {
  getCardList: () => Promise<ICardItem[]>;
  getCardItem: (id: string) => Promise<ICardItem>;
  orderCards: (order: IOrder) => Promise<IOrderResult>;
}

export interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export interface ISuccessActions {
  onClick: () => void;
}

export interface ISuccess {
  total: number;
}

export interface IFormState {
  valid: boolean;
  errors: string[];
}

export interface IModalData {
  content: HTMLElement;
}

export interface IPage {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}

export interface ICatalog {
  category: string;
  image: string;
  description: string | string[];
}

export interface IBasketCard<T> {
  index: number;
}