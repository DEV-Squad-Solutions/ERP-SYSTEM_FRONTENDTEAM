// خرائط تحويل من قيم الفلتر (اللي في الفرونت) لقيم الـ API الفعلية
const PAYMENT_METHOD_TO_PAYMENT_TERM = {
  cash: "Cash",
  bank: "Bank", // ⚠️ لسه مش متأكد إن ده الاسم الصح في enum الـ API
  credit: "Credit", // ⚠️ لسه مش متأكد إن ده الاسم الصح في enum الـ API
};

export function filterInvoices(invoices, filters) {
  if (!Array.isArray(invoices)) return [];

  return invoices.filter((inv) => {
    if (
      filters.invoiceNumber &&
      !String(inv.invoiceNumber ?? "")
        .toLowerCase()
        .includes(filters.invoiceNumber.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.partyId &&
      String(inv.businessPartnerId) !== String(filters.partyId)
    ) {
      return false;
    }

    // فلتر البلد - المفروض filters.country يبقى فيه countryId
    if (filters.country && String(inv.countryId) !== String(filters.country)) {
      return false;
    }

    if (filters.storeId && String(inv.storeId) !== String(filters.storeId)) {
      return false;
    }

    if (filters.driverId && String(inv.driverId) !== String(filters.driverId)) {
      return false;
    }

    if (
      filters.paymentMethod &&
      inv.paymentTerm !== PAYMENT_METHOD_TO_PAYMENT_TERM[filters.paymentMethod]
    ) {
      return false;
    }

    if (filters.status && inv.paymentStatus !== filters.status) {
      return false;
    }

    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      if (new Date(inv.invoiceDate) < from) return false;
    }
    if (filters.toDate) {
      const to = new Date(filters.toDate);
      if (new Date(inv.invoiceDate) > to) return false;
    }

    return true;
  });
}

export function sortInvoices(invoices, sortBy, sortDir) {
  const field = sortBy === "date" ? "invoiceDate" : sortBy;

  const sorted = [...invoices].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (field === "invoiceDate" || field === "dueDate") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

export function paginateInvoices(invoices, page, pageSize) {
  const start = (page - 1) * pageSize;
  return invoices.slice(start, start + pageSize);
}
export function computeSalesSummary(invoices) {
  if (!Array.isArray(invoices) || invoices.length === 0) {
    return {
      invoicesCount: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalRemaining: 0,
    };
  }

  return invoices.reduce(
    (acc, inv) => {
      acc.invoicesCount += 1;
      acc.totalAmount += inv.total ?? 0;
      acc.totalPaid += inv.paidAmount ?? 0;
      acc.totalRemaining += inv.remainingAmount ?? 0;
      return acc;
    },
    { invoicesCount: 0, totalAmount: 0, totalPaid: 0, totalRemaining: 0 },
  );
}
