const partyNames = [
  "شركة النور للتجارة",
  "مؤسسة الفجر للتوريدات",
  "أحمد محمد علي",
  "محمود إبراهيم",
  "شركة السلام",
];
const storeNames = ["المخزن الرئيسي", "فرع 2", "فرع 3"];
const driverNames = ["سيد فاروق", "كريم عادل", "ياسر حسن"];
const statuses = ["completed", "pending", "cancelled", "returned"];
const paymentMethods = ["cash", "bank", "credit"];
const movementTypes = ["sale", "purchase", "sale_return", "purchase_return"];
const itemNames = ["أرز أبو كاس", "سكر خام", "زيت عافية 1.5 لتر"];
const unitNames = ["كرتونة", "جردل", "برميل"];

function generateInvoices(count) {
  const invoices = [];
  for (let i = 1; i <= count; i++) {
    const movementType = movementTypes[i % movementTypes.length];
    const itemsCount = 1 + (i % 3);
    const items = Array.from({ length: itemsCount }, (_, idx) => {
      const quantity = 10 + ((i + idx) % 50);
      const price = 20 + ((i + idx) % 300);
      return {
        itemId: String((idx % 3) + 1),
        itemName: itemNames[idx % itemNames.length],
        packagingUnitId: String((idx % 3) + 1),
        packagingUnitName: unitNames[idx % unitNames.length],
        packagingCount: 5 + (idx % 10),
        unitWeight: 10 + (idx % 5) * 5,
        quantity,
        price,
        value: quantity * price,
        notes: "",
      };
    });

    const total = items.reduce((s, it) => s + it.value, 0);
    const discount = i % 5 === 0 ? 100 : 0;
    const tax = Math.round(total * 0.05);
    const paid = i % 3 === 0 ? total : Math.round(total * 0.4);
    const remaining = total - discount + tax - paid;

    invoices.push({
      id: String(1000 + i),
      invoiceNumber: `${movementType === "purchase" ? "PUR" : "SAL"}-${2000 + i}`,
      date: new Date(2026, 5, 1 + (i % 28)).toISOString().slice(0, 10),
      movementType,
      partyName: partyNames[i % partyNames.length],
      storeName: storeNames[i % storeNames.length],
      driverName: driverNames[i % driverNames.length],
      carNumber: `أ ب ج ${1000 + i}`,
      country: "مصر",
      currency: i % 4 === 0 ? "USD" : "EGP",
      paymentMethod: paymentMethods[i % paymentMethods.length],
      status: statuses[i % statuses.length],
      discount,
      tax,
      paid,
      items,
      total,
      remaining,
    });
  }
  return invoices;
}

export const mockSalesInvoices = generateInvoices(83); // رقم كبير شوية عشان نجرب الـ pagination فعليًا

export const generateInvoiceNumber = (movementType) => {
  const prefix = movementType === "purchase" ? "PUR" : "SAL";
  const count = mockSalesInvoices.filter(
    (inv) => inv.movementType === movementType,
  ).length;
  const nextNum = (movementType === "purchase" ? 1000 : 2000) + count + 1;
  return `${prefix}-${nextNum}`;
};
