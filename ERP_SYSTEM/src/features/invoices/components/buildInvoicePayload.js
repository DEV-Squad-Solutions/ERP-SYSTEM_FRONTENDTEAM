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

// يضيف الحقل للـ object بس لو القيمة موجودة فعليًا (مش undefined/null/0/فاضية)
// لو مفيش قيمة، الحقل بيتشال خالص من الـ body
function withOptionalNumber(obj, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    obj[key] = Number(value);
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
    (line) => line.itemId && Number(line.quantity) > 0,
  );

  const payload = {
    invoiceType: invoiceTypeMap[movementType],
    paymentTerm: paymentTermMap[header.paymentMethod],
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
    notes: header.notes || "",
    lines: validLines.map((line) => ({
      itemId: Number(line.itemId),
      count: Number(line.count) || 0,
      weight: Number(line.weight) || 0,
      price: Number(line.price) || 0,
      notes: line.notes || "",
    })),
    containerLines: isSalesInvoice
      ? (containersMovement?.items || []).map((item) => ({
          containerId: Number(item.containerId),
          outgoingUnits: Number(item.issuedQuantity) || 0,
          incomingUnits: Number(item.receivedQuantity) || 0,
        }))
      : [],
  };

  // ⚠️ للإنشاء بس (حسب وجود invoiceNumber في الـ schema اللي بعتها)
  // لو الفنكشن ده مستخدم في التعديل كمان، قولّي عشان أفصل المنطق
  if (header.invoiceNumber) {
    payload.invoiceNumber = header.invoiceNumber;
  }

  // الحقول الاختيارية - بتتشال خالص لو مفيش قيمة، مش بتترجع 0 ولا null
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

  return payload;
}
