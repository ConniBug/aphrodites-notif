module.exports.HasChanged = (oldDat, newDat) => {
    if(oldDat.ref != newDat.ref) {
        return "ref";
    }
    if(oldDat.name != newDat.name) {
        return "name";
    }
    if(oldDat.category != newDat.category) {
        return "category";
    }
    if(oldDat.shu != newDat.shu) {
        return "shu";
    }
    if(oldDat.price != newDat.price) {
        return "price";
    }
    if(oldDat.promo != newDat.promo) {
        return "promo";
    }
    if(oldDat.stock != newDat.stock) {
        return "stock";
    }
    return false;
};
  