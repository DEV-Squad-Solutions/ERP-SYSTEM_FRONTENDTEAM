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

// wbTotal اختياري وهو مجرد assertion عند الباك: null/omission/صفر بيتخطى المطابقة
// خالص، فمينفعش نبعته كـ 0 زي باقي الحقول الاختيارية - لازم يكون أكبر من صفر
// فعليًا عشان يتبعت، غير كده منستخدمش المفتاح خالص في الـ payload.
// القيمة دي بتيجي من الفورم (معادلة وزن البسكال - فرق الميزان - الخصم) والباك
// هو اللي بيقارنها بمجموع كميات الأصناف الفعلية - مينفعش نحسبها هنا من نفس
// الأسطر لإن كده هتبقى دايمًا متطابقة مع نفسها ويبقى الـ check عديم الفايدة.
function withPositiveNumber(obj, key, value) {
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    Number(value) > 0
  ) {
    obj[key] = Number(value);
  }
  return obj;
}

function buildLineObject({ line, isReturnInvoice }) {
  const lineObj = {
    price: Number(line.price) || 0,
    notes: line.notes || "",
  };

  // الفرقة بين صنف حقيقي وصنف مؤقت هي وجود itemId أو itemName - مفيش فلاج منفصل في الـ API
  if (line.isTemporaryItem) {
    lineObj.itemName = (line.itemName || "").trim();
  } else {
    lineObj.itemId = Number(line.itemId);
  }

  const hasCount =
    line.count !== undefined && line.count !== null && line.count !== "";
  const hasWeight =
    line.weight !== undefined && line.weight !== null && line.weight !== "";

  if (hasCount && hasWeight) {
    withOptionalNumber(lineObj, "count", line.count);
    withOptionalNumber(lineObj, "weight", line.weight);
  } else {
    withOptionalNumber(lineObj, "quantity", line.quantity);
  }

  if (isReturnInvoice) {
    withOptionalNumber(
      lineObj,
      "sourceInvoiceLineId",
      line.sourceInvoiceLineId,
    );
    withOptionalNumber(lineObj, "returnUnitCost", line.returnUnitCost);
  }

  return lineObj;
}

// pass واحد بس على الأسطر: فلترة وتحويل مع بعض بدل filter().map() منفصلين
function buildLinesForCreate({ lines, isReturnInvoice }) {
  const result = [];

  for (const line of lines) {
    const hasValidItem = line.isTemporaryItem
      ? Boolean(line.itemName?.trim())
      : Boolean(line.itemId);

    if (!hasValidItem || !(Number(line.quantity) > 0)) continue;

    // المرتجع لازم يكون مرجّع لصنف حقيقي من فاتورة أصلية - الصنف المؤقت
    // مالوش سجل حركة أصلي فمينفعش يترجع
    if (
      isReturnInvoice &&
      (line.isTemporaryItem || !line.sourceInvoiceLineId)
    ) {
      continue;
    }

    result.push(buildLineObject({ line, isReturnInvoice }));
  }

  return result;
}

function buildContainerLinesForCreate({ containersMovement, isSalesInvoice }) {
  if (!isSalesInvoice) return [];
  return (containersMovement?.items || []).map((item) => ({
    containerId: Number(item.containerId),
    outgoingUnits: Number(item.issuedQuantity) || 0,
    incomingUnits: Number(item.receivedQuantity) || 0,
  }));
}

// مؤقت: الباك لسه معندوش حقل رسمي لاسم السائق الفعلي كنص (زي externalDriverName
// بتاع السائق العادي). لحد ما يتضاف، بنبعت الاسم تحت externalActualDriverName
// كمحاولة استباقية - راجع مع الباك اند اسم الحقل النهائي وعدّل هنا لو اتغير.
function withActualDriver(obj, header) {
  withOptionalNumber(obj, "actualDriverId", header.actualDriverId);
  withOptionalString(
    obj,
    "externalActualDriverName",
    header.actualDriverId ? "" : header.actualDriverName,
  );
  return obj;
}

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

  const builtLines = buildLinesForCreate({ lines, isReturnInvoice });
  const paidAmount = Number(header.paid) || 0;
  const discountAmount = Number(header.discount) || 0;

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
    discountAmount,
    paidAmount,
    notes: header.generalNotes || "",
    lines: builtLines,
    containerLines: buildContainerLinesForCreate({
      containersMovement,
      isSalesInvoice,
    }),
  };

  withOptionalNumber(payload, "itemsCategoryId", header.itemsCategoryId);
  withOptionalString(payload, "partnerInvoiceNo", header.partnerInvoiceNo);
  if (isSalesInvoice) {
    withOptionalNumber(
      payload,
      "containerStoreId",
      containersMovement?.containerStoreId,
    );
  }
  withOptionalNumber(payload, "countryId", header.countryId);
  withOptionalNumber(
    payload,
    "driverId",
    isTemporaryDriver ? null : header.driverId,
  );
  withActualDriver(payload, header);
  withOptionalNumber(payload, "exchangeRate", header.exchangeRate);

  if (paidAmount > 0) {
    withOptionalNumber(payload, "cashboxId", header.cashboxId);
    withOptionalNumber(
      payload,
      "cashboxExchangeRate",
      header.cashboxExchangeRate,
    );
  }

  withOptionalNumber(payload, "wbWeight", header.WBWeight);
  withOptionalNumber(payload, "wbScaleDifference", header.WBScaleDifference);
  withOptionalNumber(payload, "wbDiscount", header.WBDiscount);
  withPositiveNumber(payload, "wbTotal", header.wbTotal);

  return payload;
}

export function buildInvoiceUpdateBody({
  form,
  lines,
  containerLines,
  rowVersion,
}) {
  const isReturnInvoice =
    form.invoiceType === "SalesReturn" || form.invoiceType === "PurchaseReturn";

  const validLines = buildLinesForCreate({ lines, isReturnInvoice });
  const paidAmount = Number(form.paidAmount) || 0;
  const discountAmount = Number(form.discountAmount) || 0;

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
    discountAmount,
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
  withActualDriver(body, form);
  withOptionalString(body, "partnerInvoiceNo", form.partnerInvoiceNo);
  withOptionalNumber(body, "itemsCategoryId", form.itemsCategoryId);
  withOptionalNumber(body, "exchangeRate", form.exchangeRate);

  if (paidAmount > 0) {
    withOptionalNumber(body, "cashboxId", form.cashboxId);
    withOptionalNumber(body, "cashboxExchangeRate", form.cashboxExchangeRate);
  }

  withOptionalNumber(body, "wbWeight", form.wbWeight);
  withOptionalNumber(body, "wbScaleDifference", form.wbScaleDifference);
  withOptionalNumber(body, "wbDiscount", form.wbDiscount);
  withPositiveNumber(body, "wbTotal", form.wbTotal);

  return body;
}
