import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  Search,
  RefreshCw,
  FileText,
  FolderTree,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetFinancialStatementLinesTreeQuery,
  useCreateFinancialStatementLineMutation,
  useUpdateFinancialStatementLineMutation,
  useDeleteFinancialStatementLineMutation,
} from "../financialStatementLinesApi";

import { useGetFiscalYearsSelectQuery } from "../../fiscalYears/fiscalYearsApi";

import FinancialStatementLineFormModal from "../components/FinancialStatementLineFormModal";
import FinancialStatementLineDeleteModal from "../components/FinancialStatementLineDeleteModal";

import CompactSelect from "../../../shared/components/ui/CompactSelect";

const STATEMENT_TYPES = [
  {
    value: "FinancialPosition",
    label: "قائمة المركز المالي",
  },
  {
    value: "IncomeStatement",
    label: "قائمة الدخل",
  },
  {
    value: "CashFlow",
    label: "قائمة التدفقات النقدية",
  },
];

const getNodeId = (node) => node?.id ?? node?.Id;

const getNodeName = (node) =>
  node?.name ?? node?.Name ?? node?.title ?? node?.Title ?? "";

const getNodeCode = (node) => node?.code ?? node?.Code ?? "";

const getChildren = (node) => node?.children ?? node?.Children ?? [];

const normalizeTree = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  return [];
};

const flattenTree = (nodes, level = 0, result = []) => {
  nodes.forEach((node) => {
    result.push({
      ...node,
      level,
    });

    const children = getChildren(node);

    if (children.length) {
      flattenTree(children, level + 1, result);
    }
  });

  return result;
};

const normalizeSelectOptions = (data) => {
  const items = Array.isArray(data)
    ? data
    : (data?.items ?? data?.data ?? data?.result ?? []);

  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    value: item.id ?? item.Id ?? item.value ?? item.Value,
    label:
      item.name ??
      item.Name ??
      item.label ??
      item.Label ??
      item.title ??
      item.Title ??
      item.fiscalYearName ??
      item.FiscalYearName ??
      item.year ??
      item.Year ??
      String(item.id ?? item.Id ?? ""),
  }));
};

const TreeNode = ({
  node,
  level,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const children = getChildren(node);
  const hasChildren = children.length > 0;
  const id = getNodeId(node);
  const name = getNodeName(node);
  const code = getNodeCode(node);

  const isAssignable = node?.isAssignable ?? node?.IsAssignable ?? false;

  const isActive = node?.isActive ?? node?.IsActive ?? true;

  const isExpanded = expanded.has(id);

  return (
    <div className="select-none">
      <div
        className="group flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-ink-400/5 transition-colors"
        style={{
          paddingRight: `${12 + level * 28}px`,
        }}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggle(id)}
          className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
            hasChildren
              ? "text-ink-500 hover:bg-ink-400/10"
              : "text-transparent cursor-default"
          }`}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown size={17} />
            ) : (
              <ChevronLeft size={17} />
            ))}
        </button>

        <div
          className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
            isAssignable
              ? "bg-primary-500/10 text-primary-600"
              : "bg-ink-400/10 text-ink-600"
          }`}
        >
          {isAssignable ? <FileText size={16} /> : <FolderTree size={16} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {code && (
              <span className="text-xs font-mono font-semibold text-primary-600">
                {code}
              </span>
            )}

            <span className="text-sm font-semibold text-ink-900 truncate">
              {name || "بدون اسم"}
            </span>

            {!isAssignable && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-400/10 text-ink-500">
                رئيسي
              </span>
            )}

            {isAssignable && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600">
                قابل للربط
              </span>
            )}

            {!isActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                غير نشط
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:block text-xs text-ink-400">
          {node?.displayOrder ?? node?.DisplayOrder ?? ""}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isAssignable && (
            <button
              type="button"
              onClick={() => onAddChild(node)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-600 hover:bg-primary-500/10 transition-colors"
              title="إضافة بند فرعي"
            >
              <Plus size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(node)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-400/10 hover:text-ink-900 transition-colors"
            title="تعديل"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(node)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
            title="حذف"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={getNodeId(child)}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FinancialStatementsPage() {
  const [fiscalYearId, setFiscalYearId] = useState("");
  const [statementType, setStatementType] = useState("FinancialPosition");

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(new Set());

  const [modal, setModal] = useState({
    isOpen: false,
    mode: "create",
    line: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    line: null,
  });

  const { data: fiscalYearsData, isLoading: isFiscalYearsLoading } =
    useGetFiscalYearsSelectQuery();

  const { data, isLoading, isFetching, refetch } =
    useGetFinancialStatementLinesTreeQuery(
      {
        fiscalYearId: Number(fiscalYearId),
        statementType,
      },
      {
        skip: !fiscalYearId,
      },
    );

  const [createFinancialStatementLine, { isLoading: isCreating }] =
    useCreateFinancialStatementLineMutation();

  const [updateFinancialStatementLine, { isLoading: isUpdating }] =
    useUpdateFinancialStatementLineMutation();

  const [deleteFinancialStatementLine, { isLoading: isDeleting }] =
    useDeleteFinancialStatementLineMutation();

  const fiscalYearOptions = useMemo(
    () => normalizeSelectOptions(fiscalYearsData),
    [fiscalYearsData],
  );

  const tree = useMemo(() => normalizeTree(data), [data]);

  const flatTree = useMemo(() => flattenTree(tree), [tree]);

  const filteredTree = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return tree;

    const filterNodes = (nodes) => {
      const result = [];

      nodes.forEach((node) => {
        const name = getNodeName(node).toLowerCase();
        const code = getNodeCode(node).toLowerCase();

        const children = getChildren(node);
        const filteredChildren = filterNodes(children);

        if (
          name.includes(value) ||
          code.includes(value) ||
          filteredChildren.length > 0
        ) {
          result.push({
            ...node,
            children: filteredChildren,
          });
        }
      });

      return result;
    };

    return filterNodes(tree);
  }, [tree, search]);

  const parentOptions = useMemo(() => {
    return flatTree
      .filter(
        (item) => item?.isAssignable === false && item?.isActive !== false,
      )
      .map((item) => ({
        value: getNodeId(item),
        label: getNodeCode(item)
          ? `${getNodeCode(item)} - ${getNodeName(item)}`
          : getNodeName(item),
      }));
  }, [flatTree]);

  const totals = useMemo(() => {
    const total = flatTree.length;

    const main = flatTree.filter((item) => item?.isAssignable === false).length;

    const sub = flatTree.filter((item) => item?.isAssignable === true).length;

    return {
      total,
      main,
      sub,
    };
  }, [flatTree]);

  const toggleNode = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const expandAll = () => {
    setExpanded(
      new Set(
        flatTree
          .filter((item) => getChildren(item).length > 0)
          .map((item) => getNodeId(item)),
      ),
    );
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const openCreate = () => {
    if (!fiscalYearId) {
      toast.error("اختر السنة المالية أولاً");
      return;
    }

    setModal({
      isOpen: true,
      mode: "create",
      line: {
        fiscalYearId: Number(fiscalYearId),
        statementType,
        parentLineId: null,
        displayOrder: 10,
      },
    });
  };

  const openCreateChild = (parent) => {
    if (!fiscalYearId) {
      toast.error("اختر السنة المالية أولاً");
      return;
    }

    if (parent?.isAssignable) {
      toast.error("لا يمكن إضافة بند فرعي تحت بند قابل للربط");
      return;
    }

    const parentId = getNodeId(parent);

    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });

    setModal({
      isOpen: true,
      mode: "create",
      line: {
        fiscalYearId: Number(fiscalYearId),
        statementType,
        parentLineId: parentId,
        displayOrder: Number(parent?.displayOrder ?? 0) + 10,
      },
    });
  };

  const openEdit = (line) => {
    setModal({
      isOpen: true,
      mode: "edit",
      line,
    });
  };

  const openDelete = (line) => {
    setDeleteModal({
      isOpen: true,
      line,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      mode: "create",
      line: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      line: null,
    });
  };

  const handleSubmit = async (form) => {
    try {
      if (modal.mode === "edit") {
        await updateFinancialStatementLine({
          id: getNodeId(modal.line),
          body: {
            fiscalYearId: Number(form.fiscalYearId),
            statementType: form.statementType,
            code: form.code.trim(),
            name: form.name.trim(),
            parentLineId: form.parentLineId ? Number(form.parentLineId) : null,
            displayOrder: Number(form.displayOrder),
            isAssignable: Boolean(form.isAssignable),
            isActive: Boolean(form.isActive),
            rowVersion: form.rowVersion,
          },
        }).unwrap();

        toast.success("تم تعديل البند بنجاح");
      } else {
        await createFinancialStatementLine({
          fiscalYearId: Number(form.fiscalYearId),
          statementType: form.statementType,
          code: form.code.trim(),
          name: form.name.trim(),
          parentLineId: form.parentLineId ? Number(form.parentLineId) : null,
          displayOrder: Number(form.displayOrder),
          isAssignable: Boolean(form.isAssignable),
          isActive: Boolean(form.isActive),
        }).unwrap();

        toast.success("تم إضافة البند بنجاح");
      }

      closeModal();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "حدث خطأ أثناء تنفيذ العملية",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.line) return;

    try {
      await deleteFinancialStatementLine(getNodeId(deleteModal.line)).unwrap();

      toast.success("تم حذف البند بنجاح");
      closeDeleteModal();
    } catch (error) {
      toast.error(
        error?.data?.message || error?.data?.title || "تعذر حذف البند",
      );
    }
  };

  const handleFiscalYearChange = (value) => {
    setFiscalYearId(value);
    setExpanded(new Set());
    setSearch("");
  };

  const handleStatementTypeChange = (value) => {
    setStatementType(value);
    setExpanded(new Set());
    setSearch("");
  };

  const selectedStatementLabel =
    STATEMENT_TYPES.find((item) => item.value === statementType)?.label || "";

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
              <FolderTree size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-ink-900">
                تشكيل القوائم المالية
              </h1>

              <p className="text-sm text-ink-500 mt-0.5">
                إدارة وتصنيف بنود القوائم المالية
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={!fiscalYearId}
          className="h-10 px-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={17} />
          إضافة بند
        </button>
      </div>

      <div className=" rounded-2xl shadow-card border border-ink-400/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              السنة المالية
            </label>

            <CompactSelect
              options={fiscalYearOptions}
              value={fiscalYearId}
              onChange={handleFiscalYearChange}
              isLoading={isFiscalYearsLoading}
              placeholder="اختر السنة المالية"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              نوع القائمة المالية
            </label>

            <CompactSelect
              options={STATEMENT_TYPES}
              value={statementType}
              onChange={handleStatementTypeChange}
              placeholder="اختر نوع القائمة"
            />
          </div>
        </div>
      </div>

      {fiscalYearId && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className=" rounded-2xl shadow-card border border-ink-400/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-500">إجمالي البنود</p>

                  <p className="text-2xl font-bold text-ink-900 mt-1">
                    {totals.total}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                  <FileText size={19} />
                </div>
              </div>
            </div>

            <div className=" rounded-2xl shadow-card border border-ink-400/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-500">البنود الرئيسية</p>

                  <p className="text-2xl font-bold text-ink-900 mt-1">
                    {totals.main}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-ink-400/10 text-ink-600 flex items-center justify-center">
                  <FolderTree size={19} />
                </div>
              </div>
            </div>

            <div className=" rounded-2xl shadow-card border border-ink-400/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-500">البنود القابلة للربط</p>

                  <p className="text-2xl font-bold text-ink-900 mt-1">
                    {totals.sub}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <FileText size={19} />
                </div>
              </div>
            </div>
          </div>

          <div className=" rounded-2xl shadow-card border border-ink-400/10 overflow-hidden">
            <div className="p-4 border-b border-ink-400/10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث بالكود أو اسم البند..."
                    className="w-full h-10 rounded-xl border border-ink-400/20  pr-10 pl-3 text-sm outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={expandAll}
                    disabled={!flatTree.length}
                    className="h-10 px-3 rounded-xl border border-ink-400/20 text-sm text-ink-600 hover:bg-ink-400/5 transition-colors disabled:opacity-50"
                  >
                    فتح الكل
                  </button>

                  <button
                    type="button"
                    onClick={collapseAll}
                    disabled={!expanded.size}
                    className="h-10 px-3 rounded-xl border border-ink-400/20 text-sm text-ink-600 hover:bg-ink-400/5 transition-colors disabled:opacity-50"
                  >
                    غلق الكل
                  </button>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="w-10 h-10 rounded-xl border border-ink-400/20 text-ink-600 hover:bg-ink-400/5 transition-colors flex items-center justify-center disabled:opacity-50"
                    title="تحديث"
                  >
                    <RefreshCw
                      size={16}
                      className={isFetching ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-ink-400">
                {selectedStatementLabel}
              </div>
            </div>

            <div className="p-3">
              {isLoading ? (
                <div className="min-h-[280px] flex items-center justify-center">
                  <div className="flex items-center gap-2 text-ink-500">
                    <Loader2 size={20} className="animate-spin" />
                    جاري تحميل البنود...
                  </div>
                </div>
              ) : filteredTree.length === 0 ? (
                <div className="min-h-[280px] flex flex-col items-center justify-center text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-ink-400/5 text-ink-400 flex items-center justify-center mb-3">
                    <FolderTree size={25} />
                  </div>

                  <h3 className="font-bold text-ink-800">لا توجد بنود</h3>

                  <p className="text-sm text-ink-500 mt-1">
                    {search
                      ? "لا توجد نتائج مطابقة للبحث"
                      : "لم يتم إنشاء بنود لهذه القائمة بعد"}
                  </p>

                  {!search && (
                    <button
                      type="button"
                      onClick={openCreate}
                      className="mt-4 h-9 px-4 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={15} />
                      إضافة أول بند
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredTree.map((node) => (
                    <TreeNode
                      key={getNodeId(node)}
                      node={node}
                      level={0}
                      expanded={expanded}
                      onToggle={toggleNode}
                      onEdit={openEdit}
                      onDelete={openDelete}
                      onAddChild={openCreateChild}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!fiscalYearId && (
        <div className=" rounded-2xl shadow-card border border-ink-400/10 min-h-[320px] flex flex-col items-center justify-center text-center px-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center mb-4">
            <FolderTree size={28} />
          </div>

          <h2 className="text-lg font-bold text-ink-900">اختر السنة المالية</h2>

          <p className="text-sm text-ink-500 mt-1 max-w-md">
            اختر السنة المالية ونوع القائمة لعرض وتشكيل البنود الخاصة بها.
          </p>
        </div>
      )}

      <FinancialStatementLineFormModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        mode={modal.mode}
        line={modal.line}
        parentOptions={parentOptions}
        fiscalYears={fiscalYearOptions}
        isLoading={isCreating || isUpdating}
        onSubmit={handleSubmit}
      />

      <FinancialStatementLineDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        line={deleteModal.line}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
