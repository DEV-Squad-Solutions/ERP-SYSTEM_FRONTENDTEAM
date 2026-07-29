const invoiceTypeMap = {
  sale: "Sales",
  purchase: "Purchase",
  salesReturn: "SalesReturn",
  purchaseReturn: "PurchaseReturn",
};
const paymentTermMap = {
  cash: "Cash",
  credit: "Credit",
};
const invoiceContentTypeMap = {
  items: "Items",
  containers: "Containers",
};

function withOptionalNumber(obj, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    obj[key] = Number(value);
  }
  return obj;
}
function withOptionalString(obj, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    obj[key] = value;
  }
  return obj;
}

export function buildInvoicePayload({
  movementType,
  header,
  lines,
  containersMovement,
  isTemporaryDriver,
}) {
  const isSalesInvoice = movementType === "sale";
  const validLines = lines.filter(
    (line) =>
      (line.itemId || (line.isTemporaryItem && line.itemName)) &&
      Number(line.quantity) > 0,
  );

  const payload = {
    invoiceType: invoiceTypeMap[movementType],
    paymentTerm: paymentTermMap[header.paymentMethod],
    invoiceContentType: invoiceContentTypeMap[header.invoiceContentType],
    invoiceDate: header.date,
    dueDate: header.dueDate || header.date,
    businessPartnerId: Number(header.partyId),
    storeId: Number(header.storeId),
    usesExternalDriver: isTemporaryDriver,
    externalDriverName: isTemporaryDriver ? header.driverName : "",
    vehicleNumber: header.carNumber || "",
    exportInvoiceCode: header.exportInvoiceCode || "",
    discountAmount: Number(header.discount) || 0,
    paidAmount: Number(header.paid) || 0,
    generalNotes: header.generalNotes || "",
    lines: validLines.map((line) => {
      const lineObj = {
        ...(line.isTemporaryItem
          ? { isTemporaryItem: true, itemName: line.itemName }
          : { itemId: Number(line.itemId) }),
        count: Number(line.count) || 0,
        weight: Number(line.weight) || 0,
        price: Number(line.price) || 0,
        notes: line.notes || "",
      };
      if (!line.isTemporaryItem) {
        withOptionalNumber(lineObj, "itemUnitId", line.itemUnitId);
      }
      return lineObj;
    }),
    containerLines: isSalesInvoice
      ? (containersMovement?.items || []).map((item) => ({
          containerId: Number(item.containerId),
          outgoingUnits: Number(item.issuedQuantity) || 0,
          incomingUnits: Number(item.receivedQuantity) || 0,
        }))
      : [],
  };

  if (header.invoiceNumber) {
    payload.invoiceNumber = header.invoiceNumber;
  }

  withOptionalNumber(
    payload,
    "containerStoreId",
    containersMovement?.containerStoreId,
  );
  withOptionalNumber(payload, "countryId", header.countryId);
  withOptionalNumber(
    payload,
    "driverId",
    isTemporaryDriver ? null : header.driverId,
  );
  withOptionalNumber(payload, "actualDriverId", header.actualDriverId);
  withOptionalNumber(payload, "exchangeRate", header.exchangeRate);
  if (header.paymentMethod === "cash") {
    withOptionalNumber(payload, "cashboxId", header.cashboxId);
  }

  withOptionalString(payload, "WBWeight", header.WBWeight);
  withOptionalString(payload, "WBScaleDifference", header.WBScaleDifference);
  withOptionalString(payload, "WBDiscount", header.WBDiscount);
  withOptionalString(payload, "WBTotal", header.WBTotal);

  return payload;
}
