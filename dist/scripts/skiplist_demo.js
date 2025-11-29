"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const skipList_1 = require("../classes/skipList");
function demo() {
    const skip = new skipList_1.SkipList(8, 0.5);
    // sample data: price -> product ids
    const items = [
        { price: 19.99, id: "prod_0123" },
        { price: 5.0, id: "prod_0001" },
        { price: 19.99, id: "prod_0456" },
        { price: 29.5, id: "prod_0789" },
        { price: 12.0, id: "prod_0100" },
        { price: 14.0, id: "prod_0101" },
        { price: 14.5, id: "prod_0103" },
        { price: 15.0, id: "prod_0102" },
        { price: 5.0, id: "prod_0002" },
    ];
    console.log("Insertion des éléments...");
    for (const it of items) {
        skip.insert(it.price, it.id);
    }
    console.log("\nTous les éléments après insertion :");
    console.log(skip.printAll());
    console.log("\nRecherche du prix entre 12 et 15");
    const r = skip.range(12.0, 15.0);
    console.log(r);
    // console.log("\nRecherche du prix 19.99 :");
    // const n = skip.search(19.99);
    // // console.log(n ? n.vals : 'not found');
    // console.log("\nSuppression du produit prod_0123 au prix 19.99");
    // skip.remove(19.99, "prod_0123");
    // skip.printAll();
    // console.log(skip.printAll());
    // console.log("\nSuppression de tous les produits au prix 5.0");
    // skip.remove(5.0);
    // skip.printAll();
}
if (require.main === module)
    demo();
//# sourceMappingURL=skiplist_demo.js.map