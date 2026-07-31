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
const contentTypeMap = {
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
  const isReturnInvoice =
    movementType === "salesReturn" || movementType === "purchaseReturn";

  // الباك إند بيتطلب itemId حقيقي - الأصناف اليدوية (isTemporaryItem) مش مدعومة هنا خالص
  const validLines = lines.filter(
    (line) => line.itemId && !line.isTemporaryItem && Number(line.quantity) > 0,
  );

  const payload = {
    invoiceNumber: header.invoiceNumber,
    invoiceType: invoiceTypeMap[movementType],
    contentType: contentTypeMap[header.invoiceContentType],
    paymentTerm: paymentTermMap[header.paymentMethod],
    invoiceDate: header.date,
    dueDate: header.dueDate || header.date,
    storeId: Number(header.storeId),
    businessPartnerId: Number(header.partyId),
    usesExternalDriver: isTemporaryDriver,
    externalDriverName: isTemporaryDriver ? header.driverName : "",
    vehicleNumber: header.carNumber || "",
    exportInvoiceCode: header.exportInvoiceCode || "",
    discountAmount: Number(header.discount) || 0,
    paidAmount: Number(header.paid) || 0,
    notes: header.generalNotes || "",
    lines: validLines.map((line) => {
      const lineObj = {
        itemId: Number(line.itemId),
        count: Number(line.count) || 0,
        weight: Number(line.weight) || 0,
        price: Number(line.price) || 0,
        notes: line.notes || "",
      };
      // sourceInvoiceLineId / returnUnitCost بيبقوا مهمين بس مع فواتير المرتجعات
      if (isReturnInvoice) {
        withOptionalNumber(
          lineObj,
          "sourceInvoiceLineId",
          line.sourceInvoiceLineId,
        );
        withOptionalNumber(lineObj, "returnUnitCost", line.returnUnitCost);
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

  const paidAmount = payload.paidAmount;

  // itemsCategoryId اختياري - مش مربوط بواجهة حاليًا، بيتشال لو مفيش قيمة
  withOptionalNumber(payload, "itemsCategoryId", header.itemsCategoryId);
  withOptionalString(payload, "partnerInvoiceNo", header.partnerInvoiceNo);
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

  // أي مبلغ مدفوع > 0 (نقدي أو آجل بدفعة جزئية) لازم يبقى معاه خزنة ونوع حركة
  if (paidAmount > 0) {
    withOptionalNumber(payload, "cashboxId", header.cashboxId);
    withOptionalNumber(
      payload,
      "cashMovementTypeId",
      header.cashMovementTypeId,
    );
    withOptionalNumber(
      payload,
      "cashboxExchangeRate",
      header.cashboxExchangeRate,
    );
  }

  // wbTotal بيتحسب في الباك تلقائيًا (wbWeight - wbScaleDifference - wbDiscount) - مبيتبعتش خالص
  withOptionalNumber(payload, "wbWeight", header.WBWeight);
  withOptionalNumber(payload, "wbScaleDifference", header.WBScaleDifference);
  withOptionalNumber(payload, "wbDiscount", header.WBDiscount);

  return payload;
}
