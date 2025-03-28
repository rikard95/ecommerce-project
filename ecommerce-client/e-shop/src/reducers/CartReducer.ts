import { CartItem } from "../models/CartItem";

export interface ICartAction {
    type: CartActionType;
    payload?: CartItem;
}

export enum CartActionType {
    ADD_ITEM,
    REMOVE_ITEM,
    CHANGE_QUANTITY,
    RESET_CART,
}

export const CartReducer = (Cart: CartItem[], action: ICartAction) => {
    const { payload, type } = action;

    switch(type) {
        case CartActionType.ADD_ITEM: {
            const itemExists = Cart.find((item) => item.product.id === payload?.product.id);
            if (!itemExists) {
                return [...Cart, payload!];
            }

            return Cart.map((item) =>
                item.product.id === payload?.product.id
                    ? { ...item, quantity: item.quantity + payload.quantity }
                    : item
            );
        }

        case CartActionType.REMOVE_ITEM: {
            return Cart.filter(item => item.product.id !== payload?.product.id);
        }

        case CartActionType.CHANGE_QUANTITY: {
            return Cart.map(item =>
                item.product.id === payload?.product.id
                    ? { ...item, quantity: payload.quantity }
                    : item
            );
        }

        case CartActionType.RESET_CART: {
            return [];
        }

        default:
            return Cart;
    }
};
