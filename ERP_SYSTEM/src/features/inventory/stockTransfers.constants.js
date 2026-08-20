export const stockTransferEmptyLine = {
  itemId: "",
  quantity: "",
  notes: "",
};

export const stockTransferEmptyForm = {
  transferDate: new Date().toISOString().slice(0, 10),
  sourceStoreId: "",
  destinationStoreId: "",
  notes: "",
  lines: [
    {
      ...stockTransferEmptyLine,
    },
  ],
};

export const formatQuantity = (value) =>
  Number(value || 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 3,
  });

export const formatMoney = (value) =>
  Number(value || 0).toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
