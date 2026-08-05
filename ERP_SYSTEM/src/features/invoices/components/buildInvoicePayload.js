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

function buildLinesForCreate({ lines, isReturnInvoice }) {
  return lines
    .filter((line) => {
      const hasValidItem = line.isTemporaryItem
        ? Boolean(line.itemName?.trim())
        : Boolean(line.itemId);

      if (!hasValidItem || !(Number(line.quantity) > 0)) return false;

      // المرتجع لازم يكون مرجّع لصنف حقيقي من فاتورة أصلية - الصنف المؤقت
      // مالوش سجل حركة أصلي فمينفعش يترجع
      if (
        isReturnInvoice &&
        (line.isTemporaryItem || !line.sourceInvoiceLineId)
      ) {
        return false;
      }

      return true;
    })
    .map((line) => buildLineObject({ line, isReturnInvoice }));
}

function buildContainerLinesForCreate({ containersMovement, isSalesInvoice }) {
  if (!isSalesInvoice) return [];
  return (containersMovement?.items || []).map((item) => ({
    containerId: Number(item.containerId),
    outgoingUnits: Number(item.issuedQuantity) || 0,
    incomingUnits: Number(item.receivedQuantity) || 0,
  }));
}

// حساب الصافي هنا كمان (نفس منطق الفورم) عشان نتحقق من قاعدة الدفع النقدي/الآجل
// قبل ما نبعت للباك، ونديله رسالة عربي واضحة بدل 400 عام
function computeNetTotal(lines, discountAmount) {
  const total = lines
    .filter((l) => Number(l.price) > 0)
    .reduce((sum, l) => sum + (Number(l.quantity) || 0) * Number(l.price), 0);
  return Math.max(total - (Number(discountAmount) || 0), 0);
}

function validatePaymentRule({ paymentTerm, paidAmount, netTotal }) {
  const EPSILON = 0.01;
  if (paymentTerm === "Cash") {
    if (Math.abs(paidAmount - netTotal) > EPSILON) {
      throw new Error(
        `الدفع نقدي - لازم يكون المدفوع (${paidAmount}) يساوي صافي الفاتورة (${netTotal}) بالظبط`,
      );
    }
  } else if (paymentTerm === "Credit") {
    if (paidAmount > netTotal + EPSILON) {
      throw new Error(
        `المدفوع (${paidAmount}) أكبر من صافي الفاتورة (${netTotal}) - غير مسموح`,
      );
    }
  }
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

  if (!resolvedInvoiceType) {
    throw new Error(`نوع الفاتورة غير معروف: "${movementType}"`);
  }
  if (!resolvedPaymentTerm) {
    throw new Error(`طريقة الدفع غير معروفة: "${header.paymentMethod}"`);
  }
  if (!resolvedContentType) {
    throw new Error(`محتوى الفاتورة غير معروف: "${header.invoiceContentType}"`);
  }

  const builtLines = buildLinesForCreate({ lines, isReturnInvoice });

  if (isReturnInvoice && builtLines.length === 0) {
    throw new Error(
      "لازم تختار صنف واحد على الأقل من الفاتورة الأصلية للمرتجع",
    );
  }
  if (
    !isReturnInvoice &&
    header.invoiceContentType === "items" &&
    builtLines.length === 0
  ) {
    throw new Error("لازم تضيف صنف واحد على الأقل بكمية أكبر من صفر");
  }

  const paidAmount = Number(header.paid) || 0;
  const discountAmount = Number(header.discount) || 0;
  const netTotal = computeNetTotal(lines, discountAmount);

  validatePaymentRule({
    paymentTerm: resolvedPaymentTerm,
    paidAmount,
    netTotal,
  });

  if (paidAmount > 0 && !header.cashboxId) {
    throw new Error("أي مبلغ مدفوع لازم يكون له خزنة محددة");
  }

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
  withOptionalNumber(payload, "actualDriverId", header.actualDriverId);
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

  if (!form.invoiceType) throw new Error("نوع الفاتورة مطلوب");
  if (!form.paymentTerm) throw new Error("طريقة الدفع مطلوبة");
  if (!form.contentType) throw new Error("محتوى الفاتورة مطلوب");
  if (!rowVersion) throw new Error("rowVersion مفقود - أعد تحميل الفاتورة");

  const validLines = buildLinesForCreate({ lines, isReturnInvoice });

  if (isReturnInvoice && validLines.length === 0) {
    throw new Error("لازم يفضل صنف واحد على الأقل من الفاتورة الأصلية للمرتجع");
  }

  const paidAmount = Number(form.paidAmount) || 0;
  const discountAmount = Number(form.discountAmount) || 0;
  const netTotal = computeNetTotal(lines, discountAmount);

  validatePaymentRule({
    paymentTerm: form.paymentTerm,
    paidAmount,
    netTotal,
  });

  if (paidAmount > 0 && !form.cashboxId) {
    throw new Error("أي مبلغ مدفوع لازم يكون له خزنة محددة");
  }

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
  withOptionalNumber(body, "actualDriverId", form.actualDriverId);
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

  return body;
}
