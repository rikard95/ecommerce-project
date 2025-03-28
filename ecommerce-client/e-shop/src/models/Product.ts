export class Product {
    static image: string | undefined;
    constructor(
        public id: number,
        public name: string,
        public price: number,
        public image: string, 
        public description: string
    ) {}
}
