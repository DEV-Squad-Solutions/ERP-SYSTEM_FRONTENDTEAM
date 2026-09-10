// features/statements/employeeStatementApi.js
import { baseApi } from "../../lib/baseApi";

export const employeeStatementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeStatement: builder.query({
      query: (params) => ({
        url: "/Statements/employee",
        method: "GET",
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "EmployeeStatement", id: arg.EmployeeId || "LIST" },
      ],
    }),
  }),
});

export const { useGetEmployeeStatementQuery } = employeeStatementApi;
