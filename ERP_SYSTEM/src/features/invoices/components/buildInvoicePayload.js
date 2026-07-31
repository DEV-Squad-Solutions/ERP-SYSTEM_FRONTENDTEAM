// features/invoices/components/buildInvoicePayload.js

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

function buildLinesForCreate({ lines, isReturnInvoice }) {
  return lines
    .filter(
      (line) =>
        line.itemId && !line.isTemporaryItem && Number(line.quantity) > 0,
    )
    .map((line) => {
      const lineObj = {
        itemId: Number(line.itemId),
        count: Number(line.count) || 0,
        weight: Number(line.weight) || 0,
        price: Number(line.price) || 0,
        notes: line.notes || "",
      };
      if (isReturnInvoice) {
        withOptionalNumber(
          lineObj,
          "sourceInvoiceLineId",
          line.sourceInvoiceLineId,
        );
        withOptionalNumber(lineObj, "returnUnitCost", line.returnUnitCost);
      }
      return lineObj;
    });
}

function buildContainerLinesForCreate({ containersMovement, isSalesInvoice }) {
  if (!isSalesInvoice) return [];
  return (containersMovement?.items || []).map((item) => ({
    containerId: Number(item.containerId),
    outgoingUnits: Number(item.issuedQuantity) || 0,
    incomingUnits: Number(item.receivedQuantity) || 0,
  }));
}

// ==== إنشاء فاتورة جديدة - الفورم هنا بيستخدم slugs زي "sale"/"cash"/"items" ====
export function buildCreateInvoiceRequest({
  movementType,
  header,
  lines,
  containersMovement,
  isTemporaryDriver,
}) {
  const isSalesInvoice = movementType === "sale";
  const isReturnInvoice =
    movementType === "salesReturn" || movementType === "purchaseReturn";

  const resolvedInvoiceType = invoiceTypeMap[movementType];
  const resolvedPaymentTerm = paymentTermMap[header.paymentMethod];
  const resolvedContentType = contentTypeMap[header.invoiceContentType];

  if (!resolvedInvoiceType) {
    throw new Error(`نوع الفاتورة غير معروف: "${movementType}"`);
  }
  if (!resolvedPaymentTerm) {
    throw new Error(`طريقة الدفع غير معروفة: "${header.paymentMethod}"`);
  }
  if (!resolvedContentType) {
    throw new Error(`محتوى الفاتورة غير معروف: "${header.invoiceContentType}"`);
  }

  const paidAmount = Number(header.paid) || 0;

  const payload = {
    invoiceNumber: header.invoiceNumber,
    invoiceType: resolvedInvoiceType,
    contentType: resolvedContentType,
    paymentTerm: resolvedPaymentTerm,
    invoiceDate: header.date,
    dueDate: header.dueDate || header.date,
    storeId: Number(header.storeId),
    businessPartnerId: Number(header.partyId),
    usesExternalDriver: isTemporaryDriver,
    externalDriverName: isTemporaryDriver ? header.driverName : "",
    vehicleNumber: header.carNumber || "",
    exportInvoiceCode: header.exportInvoiceCode || "",
    discountAmount: Number(header.discount) || 0,
    paidAmount,
    notes: header.generalNotes || "",
    lines: buildLinesForCreate({ lines, isReturnInvoice }),
    containerLines: buildContainerLinesForCreate({
      containersMovement,
      isSalesInvoice,
    }),
  };

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

  withOptionalNumber(payload, "wbWeight", header.WBWeight);
  withOptionalNumber(payload, "wbScaleDifference", header.WBScaleDifference);
  withOptionalNumber(payload, "wbDiscount", header.WBDiscount);

  return payload;
}

// ==== تعديل فاتورة موجودة - الفورم هنا بيستخدم قيم enum جاهزة من السيرفر ====
// (form.invoiceType = "Sales", form.paymentTerm = "Cash", form.contentType = "Items" ... إلخ)
export function buildInvoiceUpdateBody({
  form,
  lines,
  containerLines,
  rowVersion,
}) {
  const isReturnInvoice =
    form.invoiceType === "SalesReturn" || form.invoiceType === "PurchaseReturn";

  if (!form.invoiceType) throw new Error("نوع الفاتورة مطلوب");
  if (!form.paymentTerm) throw new Error("طريقة الدفع مطلوبة");
  if (!form.contentType) throw new Error("محتوى الفاتورة مطلوب");
  if (!rowVersion) throw new Error("rowVersion مفقود - أعد تحميل الفاتورة");

  const validLines = lines
    .filter(
      (line) =>
        line.itemId && !line.isTemporaryItem && Number(line.quantity) > 0,
    )
    .map((line) => {
      const lineObj = {
        itemId: Number(line.itemId),
        count: Number(line.count) || 0,
        weight: Number(line.weight) || 0,
        price: Number(line.price) || 0,
        notes: line.notes || "",
      };
      if (isReturnInvoice) {
        withOptionalNumber(
          lineObj,
          "sourceInvoiceLineId",
          line.sourceInvoiceLineId,
        );
        withOptionalNumber(lineObj, "returnUnitCost", line.returnUnitCost);
      }
      return lineObj;
    });

  const paidAmount = Number(form.paidAmount) || 0;

  const body = {
    invoiceType: form.invoiceType,
    paymentTerm: form.paymentTerm,
    contentType: form.contentType,
    invoiceDate: form.invoiceDate,
    dueDate: form.dueDate || form.invoiceDate,
    businessPartnerId: Number(form.businessPartnerId),
    storeId: Number(form.storeId),
    usesExternalDriver: form.usesExternalDriver,
    externalDriverName: form.usesExternalDriver ? form.externalDriverName : "",
    vehicleNumber: form.vehicleNumber || "",
    exportInvoiceCode: form.exportInvoiceCode || "",
    discountAmount: Number(form.discountAmount) || 0,
    paidAmount,
    notes: form.notes || "",
    lines: validLines,
    containerLines: (containerLines || []).map((c) => ({
      containerId: Number(c.containerId),
      outgoingUnits: Number(c.outgoingUnits) || 0,
      incomingUnits: Number(c.incomingUnits) || 0,
    })),
    rowVersion,
  };

  withOptionalNumber(body, "containerStoreId", form.containerStoreId);
  withOptionalNumber(body, "countryId", form.countryId);
  withOptionalNumber(
    body,
    "driverId",
    form.usesExternalDriver ? null : form.driverId,
  );
  withOptionalNumber(body, "actualDriverId", form.actualDriverId);
  withOptionalString(body, "partnerInvoiceNo", form.partnerInvoiceNo);
  withOptionalNumber(body, "itemsCategoryId", form.itemsCategoryId);
  withOptionalNumber(body, "exchangeRate", form.exchangeRate);

  if (paidAmount > 0) {
    withOptionalNumber(body, "cashboxId", form.cashboxId);
    withOptionalNumber(body, "cashMovementTypeId", form.cashMovementTypeId);
    withOptionalNumber(body, "cashboxExchangeRate", form.cashboxExchangeRate);
  }

  withOptionalNumber(body, "wbWeight", form.wbWeight);
  withOptionalNumber(body, "wbScaleDifference", form.wbScaleDifference);
  withOptionalNumber(body, "wbDiscount", form.wbDiscount);

  return body;
}
