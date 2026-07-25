import { useState } from "react";
import { Plus, Printer, Wallet } from "lucide-react";
import TreasuryFilters from "../components/TreasuryFilters";
import TreasuryTable from "../components/TreasuryTable";
import NewTransactionModal from "../components/NewTransactionModal";
import Button from "../../../shared/components/ui/Button";

import {
  useGetTreasuryTransactionsQuery,
  useDeleteTransactionMutation,
} from "../treasuryApi";

export default function TreasuryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // الفلاتر بدون تواريخ
 const [filters, setFilters] = useState({
  type: "all",
  partnerId: "",
  fromDate: "",
  toDate: "",
});

  const { data: transactions = [], isLoading } = useGetTreasuryTransactionsQuery(filters);
  const [deleteTransaction] = useDeleteTransactionMutation();

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحركة؟")) {
      try {
        await deleteTransaction(id).unwrap();
      } catch (err) {
        console.error("فشل الحذف:", err);
        alert("حدث خطأ أثناء تنفيذ عملية الحذف");
      }
    }
  };

  const handleEdit = (row) => {
    setTransactionToEdit(row);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  // 1️⃣ طباعة إيصال حركة واحدة
  const handlePrintRow = (row) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>إيصال حركة خزنة</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; line-height: 1.6; }
            .box { border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 500px; margin: auto; }
            h2 { text-align: center; color: #1e293b; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px border-dashed #eee; padding: 8px 0; }
            .label { font-weight: bold; color: #475569; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>إيصال حركة خزنة</h2>
            <div class="row"><span class="label">التاريخ:</span> <span>${row.date || "-"}</span></div>
            <div class="row"><span class="label">اسم الحساب:</span> <span>${row.displayName || row.partyName || "-"}</span></div>
            <div class="row"><span class="label">النوع:</span> <span>${row.debit > 0 ? "إيداع (مدين)" : "صرف (دائن)"}</span></div>
            <div class="row"><span class="label">المبلغ:</span> <span>${(row.debit || row.credit || 0).toLocaleString("ar-EG")} ج.م</span></div>
            <div class="row"><span class="label">الملاحظات:</span> <span>${row.notes || "-"}</span></div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 2️⃣ طباعة تقرير تقرير الجدول بالكامل
  const handlePrintAll = () => {
    if (!transactions || transactions.length === 0) {
      alert("لا توجد بيانات للطباعة");
      return;
    }

    let runningBalance = 0;
    const rowsHtml = transactions.map((row) => {
      const debit = Number(row.amountIn ?? row.debit ?? (row.type === "in" ? row.amount : 0) ?? 0);
      const credit = Number(row.amountOut ?? row.credit ?? (row.type === "out" ? row.amount : 0) ?? 0);
      runningBalance += debit - credit;
      const party = row.displayName || row.partyName || row.partnerName || row.accountName || "-";

      return `
        <tr>
          <td>${row.date || "-"}</td>
          <td>${party}</td>
          <td style="color: #16a34a;">${debit > 0 ? debit.toLocaleString("ar-EG") : "—"}</td>
          <td style="color: #dc2626;">${credit > 0 ? credit.toLocaleString("ar-EG") : "—"}</td>
          <td><b>${runningBalance.toLocaleString("ar-EG")}</b></td>
          <td>${row.notes || row.category || "-"}</td>
        </tr>
      `;
    }).join("");

    const totalDebit = transactions.reduce((acc, curr) => acc + Number(curr.debit || curr.amountIn || 0), 0);
    const totalCredit = transactions.reduce((acc, curr) => acc + Number(curr.credit || curr.amountOut || 0), 0);
    const netBalance = totalDebit - totalCredit;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير حركات الخزنة</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; direction: rtl; }
            h1 { text-align: center; color: #0f172a; margin-bottom: 5px; font-size: 20px; }
            p.sub { text-align: center; color: #64748b; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: center; }
            th { background-color: #f8fafc; color: #334155; }
            tfoot tr { background-color: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>تقرير حركات الخزنة</h1>
          <p class="sub">تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</p>
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>اسم الحساب</th>
                <th>مدين (إيداع)</th>
                <th>دائن (صرف)</th>
                <th>الرصيد</th>
                <th>الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">الإجمالي</td>
                <td style="color: #16a34a;">${totalDebit.toLocaleString("ar-EG")}</td>
                <td style="color: #dc2626;">${totalCredit.toLocaleString("ar-EG")}</td>
                <td colspan="2">${netBalance.toLocaleString("ar-EG")} ج.م</td>
              </tr>
            </tfoot>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* هيدر الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">حركات الخزنة</h1>
            <p className="text-xs text-slate-500">إدارة ومتابعة الإيداعات والمسحوبات الحسابية</p>
          </div>
        </div>

        {/* الأزرار العلوية (طباعة + حركة جديدة) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrintAll}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Printer size={18} />
            <span>طباعة</span>
          </button>

          <Button 

            onClick={handleAddNew}
          >
            <Plus size={18} />
            <span>حركة جديدة</span>
          </Button>
        </div>
      </div>

      {/* الفلاتر العلوية */}
      <TreasuryFilters filters={filters} onChange={setFilters} />

      {/* جدول الحركات */}
      <TreasuryTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrintRow={handlePrintRow}
      />

      {/* مودال حركة جديدة / تعديل */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }}
        editData={transactionToEdit}
      />
    </div>
  );
}