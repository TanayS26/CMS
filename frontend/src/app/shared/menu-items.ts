import { Injectable } from "@angular/core";

export interface Menu {
    state: string,
    name: string,
    icon: string,
    role: string,
}

const MENUITEMS = [
    { state: 'dashboard', name: 'Dashboard', icon: 'dashboard', role: '' },
    { state: 'category', name: 'Manage Category', icon: 'category', role: 'admin' },
    { state: 'product', name: 'Manage Products', icon: 'inventory', role: 'admin' },
    { state: 'order', name: 'Manage Orders', icon: 'list_alt', role: '' },
    { state: 'bill', name: 'View Bills', icon: 'import_contacts', role: '' },
    { state: 'user', name: 'View User', icon: 'people', role: 'admin' },
];

@Injectable()

export class MenuItems {
    getMenuitems(): Menu[] {
        return MENUITEMS;
    }
}