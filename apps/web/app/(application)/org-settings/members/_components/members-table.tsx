"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import * as React from "react";

import {
  TableEmptyState,
  TableLoadingSkeleton,
  TablePagination,
} from "@repo/ui/table";
import { IllustrationEmptyEmployeeSpotlight } from "@repo/ui/illustrations";
import * as Table from "@repo/ui/base-table";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@repo/ui/utils/cn";
import { orpc } from "@/orpc/client";

import { membersParsers } from "../search-params";
import { getColumns } from "./columns";

export default function MembersTable() {
  // Query params
  const [tab] = useQueryState("tab", membersParsers.tab);
  const [search] = useQueryState("search", membersParsers.search);

  // Pagination
  const [page, setPage] = useQueryState("page", membersParsers.page);
  const [limit, setLimit] = useQueryState("limit", membersParsers.limit);

  // React Query to fetch members
  const { data, isLoading } = useQuery(
    orpc.organization.listMembers.queryOptions({
      input: {
        tab,
        search,
        page,
        limit,
      },
      placeholderData: keepPreviousData,
    }),
  );

  // Extract members from the response or use empty array
  const members = React.useMemo(() => {
    return data?.members ?? [];
  }, [data]);

  const {
    data: activeMember,
    isPending: isLoadingActiveMember,
    isRefetching: isRefetchingActiveMember,
  } = authClient.useActiveMember();

  const columns = React.useMemo(
    () =>
      getColumns({
        id: activeMember?.userId ?? "",
        role: activeMember?.role ?? "member",
      }),
    [activeMember?.role, activeMember?.userId],
  );

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Table.Root className="-mx-4 w-auto px-4 lg:mx-0 lg:w-full lg:px-0 [&>table]:min-w-215">
        <Table.Header className="whitespace-nowrap">
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Table.Head
                    className={cn(header.column.columnDef.meta?.className)}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.Head>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {(() => {
            if (
              isLoading ||
              isLoadingActiveMember ||
              isRefetchingActiveMember
            ) {
              return <TableLoadingSkeleton columnLength={columns.length} />;
            }

            if (table.getRowModel().rows?.length > 0) {
              return table.getRowModel().rows.map((row, i, arr) => (
                <React.Fragment key={row.id}>
                  <Table.Row data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        className={cn(
                          "h-12",
                          cell.column.columnDef.meta?.className,
                        )}
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                  {i < arr.length - 1 && <Table.RowDivider />}
                </React.Fragment>
              ));
            }

            return (
              <Table.Row>
                <Table.Cell
                  className="h-72 text-center group-hover/row:bg-transparent"
                  colSpan={columns.length}
                >
                  <TableEmptyState
                    description="Add members to your organization to get started"
                    icon={
                      <IllustrationEmptyEmployeeSpotlight className="size-27" />
                    }
                    title="No members found"
                  />
                </Table.Cell>
              </Table.Row>
            );
          })()}
        </Table.Body>
      </Table.Root>

      {data?.pagination && (
        <TablePagination
          itemName="items"
          limit={limit}
          onLimitChange={setLimit}
          onPageChange={setPage}
          page={page}
          pagination={data.pagination}
        />
      )}
    </>
  );
}
