// features/inventory/components/buildStockOpeningBalancePayload.js

// السيرفر بيحسب quantity = count * weight و total = quantity * price بنفسه
// ومبيقبلش companyId ولا itemUnitId ولا quantity ولا total في السطر - لو اتبعتوا هيترفضوا
function buildLineObject(line) {
  return {
    itemId: Number(line.itemId),
    count: Number(line.count) || 0,
    weight: Number(line.weight) || 0,
    price: Number(line.price) || 0,
    notes: line.notes || "",
  };
}

function buildValidLines(lines) {
  return lines
    .filter(
      (line) =>
        line.itemId &&
        !line.isTemporaryItem &&
        Number(line.count) > 0 &&
        Number(line.weight) > 0,
    )
    .map(buildLineObject);
}

// ==== إنشاء رصيد افتتاحي مخزني جديد ====
export function buildCreateStockOpeningBalanceRequest({ header, lines }) {
  const validLines = buildValidLines(lines);

  if (validLines.length === 0) {
    throw new Error("لازم صنف واحد على الأقل بعدد ووزن أكبر من صفر");
  }

  return {
    storeId: Number(header.storeId),
    documentNumber: header.documentNumber.trim(),
    documentDate: header.documentDate,
    lines: validLines,
    notes: header.notes || "",
  };
}

// ==== تعديل رصيد افتتاحي موجود ====
export function buildStockOpeningBalanceUpdateBody({
  header,
  lines,
  rowVersion,
}) {
  const validLines = buildValidLines(lines);

  if (!rowVersion) throw new Error("rowVersion مفقود - أعد تحميل السند");
  if (validLines.length === 0) {
    throw new Error("لازم صنف واحد على الأقل بعدد ووزن أكبر من صفر");
  }

  return {
    storeId: Number(header.storeId),
    documentNumber: header.documentNumber.trim(),
    documentDate: header.documentDate,
    lines: validLines,
    notes: header.notes || "",
    rowVersion,
  };
}
